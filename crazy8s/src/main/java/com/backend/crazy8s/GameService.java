package com.backend.crazy8s;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {

    private static final String[] SUITS = {"Hearts", "Diamonds", "Clubs", "Spades"};
    private static final String[] RANKS = {"Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"};
    
    private final Map<String, GameState> games = new ConcurrentHashMap<>();

    // Create Game from a Room
    public GameState createGame(Room room) {
        String gameId = UUID.randomUUID().toString();
        GameState state = new GameState(gameId);
        state.setPlayerNames(Arrays.asList(room.getPlayerNames()));

        // Build and shuffle deck
        List<Card> deck = new ArrayList<>();
        for (String suit : SUITS)
            for (String rank : RANKS)
                deck.add(new Card(rank, suit));
        Collections.shuffle(deck);

        // Deal 7 cards to each of 4 players
        List<List<Card>> hands = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            List<Card> hand = new ArrayList<>();
            for (int j = 0; j < 7; j++)
                hand.add(deck.remove(0));
            hands.add(hand);
        }
        state.setHands(hands);
        state.setDeck(deck);

        // Set up discard pile
        List<Card> discardPile = new ArrayList<>();
        Card firstCard = deck.remove(0);
        discardPile.add(firstCard);
        state.setDiscardPile(discardPile);
        state.setCurrentSuit(firstCard.getSuit());

        return state;
    }

    public void saveGame(GameState state) {
        games.put(state.getGameId(), state);
    }

    public GameState getGame(String gameId) {
        return games.get(gameId);
    }

    // Draw Card
    public GameState drawCard(String gameId, int playerIndex) {
        GameState state = getGame(gameId);
        if (state == null || state.getCurrentPlayer() != playerIndex) return state;

        if (!state.getDeck().isEmpty()) {
            Card drawn = state.getDeck().remove(0);
            state.getHands().get(playerIndex).add(drawn);
        }

        advancePlayer(state);
        processCpuTurns(state);
        return state;
    }

    // Play Card
    public GameState playCard(String gameId, int playerIndex, int cardIndex, String chosenSuit) {
        GameState state = getGame(gameId);
        if (state == null || state.getCurrentPlayer() != playerIndex) return state;

        List<Card> hand = state.getHands().get(playerIndex);
        Card topCard = getTopCard(state);

        if (cardIndex < 0 || cardIndex >= hand.size())
            throw new IllegalArgumentException("Invalid card index.");

        Card card = hand.get(cardIndex);

        // Validate move
        if (!isValidPlay(card, topCard, state.getCurrentSuit()))
            throw new IllegalArgumentException("Invalid move.");

        // Play the card
        hand.remove(cardIndex);
        state.getDiscardPile().add(card);
        state.setCurrentSuit(card.getSuit());

        // Handle special cards
        applySpecialCard(card, state, chosenSuit);

        // Check if player won
        if (hand.isEmpty()) {
            state.setStatus("FINISHED");
            state.setWinner(state.getPlayerNames().get(playerIndex));
            return state;
        }

        advancePlayer(state);
        processCpuTurns(state);
        return state;
    }

    // CPU Turns (runs automatically for any slot that is "CPU")
    public void processCpuTurns(GameState state) {
        while (state.getStatus().equals("IN_PROGRESS") && isCpu(state, state.getCurrentPlayer())) {
            int current = state.getCurrentPlayer();
            List<Card> hand = state.getHands().get(current);
            Card topCard = getTopCard(state);

            // Handle skip
            if (state.isSkipNext()) {
                state.setSkipNext(false);
                advancePlayer(state);
                continue;
            }

            // Handle penalty draw
            if (state.getPenaltyDraw() > 0) {
                for (int i = 0; i < state.getPenaltyDraw(); i++)
                    if (!state.getDeck().isEmpty())
                        hand.add(state.getDeck().remove(0));
                state.setPenaltyDraw(0);
                advancePlayer(state);
                continue;
            }

            // Try to play
            Card cardToPlay = null;
            for (Card c : hand) {
                if (c.getRank().equals(topCard.getRank()) || c.getSuit().equals(state.getCurrentSuit())) {
                    cardToPlay = c;
                    break;
                }
            }

            if (cardToPlay == null) {
                for (Card c : hand) {
                    if (c.getRank().equals("8")) {
                        cardToPlay = c;
                        break;
                    }
                }
            }

            if (cardToPlay != null) {
                hand.remove(cardToPlay);
                state.getDiscardPile().add(cardToPlay);
                state.setCurrentSuit(cardToPlay.getSuit());
                String suit = cardToPlay.getRank().equals("8") ? pickBestSuit(hand) : null;
                applySpecialCard(cardToPlay, state, suit);

                if (hand.isEmpty()) {
                    state.setStatus("FINISHED");
                    state.setWinner(state.getPlayerNames().get(current));
                    return;
                }
            } else {
                if (!state.getDeck().isEmpty())
                    hand.add(state.getDeck().remove(0));
            }
            advancePlayer(state);
        }
    }

    private boolean isCpu(GameState state, int index) {
        return "CPU".equals(state.getPlayerNames().get(index));
    }

    private boolean isValidPlay(Card card, Card topCard, String currentSuit) {
        return card.getRank().equals("8")
                || card.getRank().equals(topCard.getRank())
                || card.getSuit().equals(currentSuit);
    }

    private void applySpecialCard(Card card, GameState state, String chosenSuit) {
        switch (card.getRank()) {
            case "8":
                if (chosenSuit != null) state.setCurrentSuit(chosenSuit);
                break;
            case "Queen":
                state.setSkipNext(true);
                break;
            case "Ace":
                state.setDirection(state.getDirection() * -1);
                break;
            case "2":
                state.setPenaltyDraw(state.getPenaltyDraw() + 2);
                break;
        }
    }

    private void advancePlayer(GameState state) {
        int next = (state.getCurrentPlayer() + state.getDirection() + 4) % 4;
        state.setCurrentPlayer(next);
    }

    private Card getTopCard(GameState state) {
        List<Card> pile = state.getDiscardPile();
        return pile.get(pile.size() - 1);
    }

    private String pickBestSuit(List<Card> hand) {
        Map<String, Integer> suitCount = new HashMap<>();
        for (Card c : hand)
            suitCount.merge(c.getSuit(), 1, Integer::sum);
        return suitCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Hearts");
    }
}
