package com.backend.crazy8s;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class GameService {
    /* Change this once players are implemented */
    private static final String[] PLAYER_NAMES = {"User", "Player 2", "Player 3", "Player 4"};

    // Create Game
    public GameState createGame(Ruleset ruleset) {
        String gameId = UUID.randomUUID().toString();
        GameState state = new GameState(gameId, ruleset);

        // Build and shuffle deck
        List<Card> deck = createDeck(state);
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

        // draw card penalty
        if (state.getPenaltyDraw() > 0) {
            for (int i = 0; i < state.getPenaltyDraw(); i++) {
                Card drawn = state.getDeck().remove(0);
                state.getHands().get(0).add(drawn);
            }
            state.setPenaltyDraw(0);
            advancePlayer(state);
        }

        /* Add on empty behavior */
        // voluntarily draw card
        if (!state.getDeck().isEmpty()) {
            Card drawn = state.getDeck().remove(0);
            state.getHands().get(0).add(drawn);
            advancePlayer(state);
        }

        /* Change when players are added */ 
        processCpuTurns(state);
        return state;
    }

    // Play Card (User)
    public GameState playCard(GameState state, int cardIndex, String chosenSuit) {
        state.getTurnLog().clear();
        List<Card> currentHand = state.getHands().get(state.getCurrentPlayer());

        // Validate selection
        if (cardIndex < 0 || cardIndex >= currentHand.size())
            throw new IllegalArgumentException("Invalid card index.");

        Card card = currentHand.get(cardIndex);

        // Validate move
        if (!isValidPlay(state, card))
            throw new IllegalArgumentException("Invalid move.");

        // Play the card
        currentHand.remove(cardIndex);
        state.getDiscardPile().add(card);
        state.setCurrentSuit(card.getSuit());

        // Handle special cards
        applyEffect(card, state, chosenSuit);

        // Check if player won
        if (currentHand.isEmpty()) {
            state.setStatus("FINISHED");
            /* Change this once players are implemented */
            state.setWinner(PLAYER_NAMES[state.getCurrentPlayer()]);
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
            List<Card> discard = state.getDiscardPile();
            Card topCard = discard.get(discard.size() - 1);

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
                // CPU picks most common suit
                String chosenSuit = pickBestSuit(hand);
                hand.remove(cardToPlay);
                state.getDiscardPile().add(cardToPlay);
                state.setCurrentSuit(cardToPlay.getSuit());
                
                applyEffect(cardToPlay, state, chosenSuit);
                state.getTurnLog().add(new TurnLogEntry(name + " played " + cardToPlay + ".", cardToPlay));
            } else {
                // Penalty draw
                if (state.getPenaltyDraw() > 0) {
                    for (int i = 0; i < state.getPenaltyDraw(); i++) {
                        Card drawn = state.getDeck().remove(0);
                        state.getHands().get(0).add(drawn);
                    }
                    advancePlayer(state);
                    continue;
                }

                // Draw card voluntarily
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
    private boolean isValidPlay(GameState state, Card card) {
        return state.getRuleset().handleValidPlay(state, card);
    }

    private void applyEffect(Card card, GameState state, String chosenSuit) {
        state.getRuleset().handleApplyEffect(state, card, chosenSuit);
    }

    private List<Card> createDeck(GameState state) {
        return state.getRuleset().handleCreateDeck();
    }

    private void advancePlayer(GameState state) {
        int next = (state.getCurrentPlayer() + state.getDirection() + 4) % 4;
        state.setCurrentPlayer(next);
    }

    // CPU picks whichever suit appears most in its hand when playing an 8
    private String pickBestSuit(List<Card> hand) {
        Map<String, Integer> suitCount = new HashMap<>();
        for (Card c : hand)
            suitCount.merge(c.getSuit(), 1, Integer::sum);
        return suitCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(hand.get(0).getSuit());
    }
}