package com.backend.crazy8s;

import java.util.ArrayList;
import java.util.List;

public class UnoRuleset implements Ruleset {

    @Override
    public List<Card> handleCreateDeck() {
        String[] SUITS = {"Red", "Green", "Blue", "Yellow"};
        String[] RANKS = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "Draw2", "Reverse", "Skip"};
        String[] WILD = {"Wild", "WildDraw4"};
        List<Card> deck = new ArrayList<>();

        // 1 zero card per color (4)
        for (String suit : SUITS) { deck.add(new Card("0", suit)); }

        // 2 number and action cards per color (96)
        for (String suit : SUITS) {
            for (String rank : RANKS) {
                deck.add(new Card(rank, suit));
                deck.add(new Card(rank, suit));
            }
        }

        // 4 of each wild card (8)
        for (String wild : WILD) {
            deck.add(new Card(wild, "none"));
            deck.add(new Card(wild, "none"));
            deck.add(new Card(wild, "none"));
            deck.add(new Card(wild, "none"));
        }
        return deck;
    }

    @Override
    public boolean handleValidPlay(GameState state, Card card) {
        List<Card> discard = state.getDiscardPile();
        Card topCard = discard.get(discard.size() - 1);

        // Penalty draw behavior
        if (state.getPenaltyDraw() > 0) {
            return false;
        }

        return card.getRank().equals("Wild")
            || card.getRank().equals("WildDraw4")
            || card.getRank().equals(topCard.getRank())
            || card.getSuit().equals(state.getCurrentSuit());
    }

    @Override
    public void handleApplyEffect(GameState state, Card card, String chosenSuit) {
        switch (card.getRank()) {
            case"WildDraw4" -> {
                if (chosenSuit != null) state.setCurrentSuit(chosenSuit);
                state.setPenaltyDraw(4);
                state.setSkipNext(true);
            }
            case "Wild" -> { 
                if (chosenSuit != null) state.setCurrentSuit(chosenSuit); 
            }
            case "Skip" -> state.setSkipNext(true);
            case "Reverse" -> state.setDirection(state.getDirection() * -1);
            case "Draw2" -> {
                state.setPenaltyDraw(2);
                state.setSkipNext(true);
            }
        } 
    }
}