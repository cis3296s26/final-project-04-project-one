package com.backend.crazy8s;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class GameService {

    private static final String[] SUITS = {"Hearts", "Diamonds", "Clubs", "Spades"};
    private static final String[] RANKS = {"Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"};
    private static final String[] PLAYER_NAMES = {"User", "Player 2", "Player 3", "Player 4"};

    // Create Game
    public GameState createGame() {
        String gameId = UUID.randomUUID().toString();
        GameState state = new GameState(gameId);

        // Build and shuffle deck
        List<Card> deck = new ArrayList<>();
        for (String suit : SUITS)
            for (String rank : RANKS)
                deck.add(new Card(rank, suit));
        Collections.shuffle(deck);
        state.setDeck(deck);

        // Deal 7 cards to each of 4 players
        List<List<Card>> hands = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            List<Card> hand = new ArrayList<>();
            for (int j = 0; j < 7; j++)
                hand.add(deck.remove(0));
            hands.add(hand);
        }
        state.setHands(hands);

        // Set up discard pile
        List<Card> discardPile = new ArrayList<>();
        Card firstCard = deck.remove(0);
        discardPile.add(firstCard);
        state.setDiscardPile(discardPile);
        state.setCurrentSuit(firstCard.getSuit());

        return state;
    }

    // Draw Card (User)
    public GameState drawCard(GameState state) {
        state.getTurnLog().clear();
        if (!state.getDeck().isEmpty()) {
            Card drawn = state.getDeck().remove(0);
            state.getHands().get(0).add(drawn);
        }

        // Advance to next player then run CPU turns
        advancePlayer(state);
        processCpuTurns(state);
        return state;
    }

    // Play Card (User)
    public GameState playCard(GameState state, int cardIndex, String chosenSuit) {
        state.getTurnLog().clear();
        List<Card> userHand = state.getHands().get(0);
        Card topCard = getTopCard(state);

        if (cardIndex < 0 || cardIndex >= userHand.size())
            throw new IllegalArgumentException("Invalid card index.");

        Card card = userHand.get(cardIndex);

        // Validate move
        if (!isValidPlay(card, topCard, state.getCurrentSuit()))
            throw new IllegalArgumentException("Invalid move.");

        // Play the card
        userHand.remove(cardIndex);
        state.getDiscardPile().add(card);
        state.setCurrentSuit(card.getSuit());

        // Handle special cards
        applySpecialCard(card, state, chosenSuit);

        // Check if user won
        if (userHand.isEmpty()) {
            state.setStatus("FINISHED");
            state.setWinner(PLAYER_NAMES[0]);
            return state;
        }

        // Advance to next player then run CPU turns
        advancePlayer(state);
        processCpuTurns(state);
        return state;
    }

    // CPU Turns
    public void processCpuTurns(GameState state) {
        // Keep running CPU turns until it's the user's turn or game is over
        while (state.getCurrentPlayer() != 0 && state.getStatus().equals("IN_PROGRESS")) {
            int current = state.getCurrentPlayer();
            List<Card> hand = state.getHands().get(current);
            String name = PLAYER_NAMES[current];

            // Handle skip
            if (state.isSkipNext()) {
                state.getTurnLog().add(new TurnLogEntry(name + " was skipped.", null));
                state.setSkipNext(false);
                advancePlayer(state);
                continue;
            }

            // Handle penalty draw
            if (state.getPenaltyDraw() > 0) {
                int amount = state.getPenaltyDraw();
                for (int i = 0; i < amount; i++)
                    if (!state.getDeck().isEmpty())
                        hand.add(state.getDeck().remove(0));
                state.getTurnLog().add(new TurnLogEntry(name + " drew " + amount + " cards.", null));
                state.setPenaltyDraw(0);
                advancePlayer(state);
                continue;
            }

            // Try to play: match rank or suit first
            Card cardToPlay = null;
            Card topCard = getTopCard(state);

            for (Card c : hand) {
                if (c.getRank().equals(topCard.getRank()) || c.getSuit().equals(state.getCurrentSuit())) {
                    cardToPlay = c;
                    break;
                }
            }

            // Try an 8 if nothing else
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

                // CPU picks most common suit in hand when playing an 8
                String chosenSuit = cardToPlay.getRank().equals("8") ? pickBestSuit(hand) : null;
                applySpecialCard(cardToPlay, state, chosenSuit);
                state.getTurnLog().add(new TurnLogEntry(name + " played " + cardToPlay + ".", cardToPlay));
            } else {
                if (!state.getDeck().isEmpty()) {
                    hand.add(state.getDeck().remove(0));
                    state.getTurnLog().add(new TurnLogEntry(name + " drew a card.", null));
                } else {
                    state.getTurnLog().add(new TurnLogEntry(name + " was skipped.", null));
                }
            }

            if (hand.isEmpty()) {
                state.setStatus("FINISHED");
                state.setWinner(name);
                state.getTurnLog().add(new TurnLogEntry(name + " wins!", null));
                return;
            }

            advancePlayer(state);
        }
    }

    // Helpers
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

    // CPU picks whichever suit appears most in its hand when playing an 8
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