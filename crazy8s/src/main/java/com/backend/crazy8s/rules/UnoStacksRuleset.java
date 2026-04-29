package com.backend.crazy8s.rules;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.backend.crazy8s.model.Card;
import com.backend.crazy8s.model.GameState;

@Component("unoStacksRuleset")
public class UnoStacksRuleset implements Ruleset {

    @Override
    public List<Card> handleCreateDeck() {
        String[] SUITS = {"Red", "Green", "Blue", "Yellow"};
        String[] RANKS = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "Draw2", "Reverse", "Skip"};
        String[] WILD = {"Wild", "WildDraw4"};
        List<Card> deck = new ArrayList<>();

        // 1 zero card per color (4)
        for (String s : SUITS) { deck.add(new Card("0", s)); }

        // 2 number and action cards per color (96)
        for (String s : SUITS) {
            for (String r : RANKS) {
                deck.add(new Card(r, s));
                deck.add(new Card(r, s));
            }
        }

        // 4 of each wild card (8)
        for (String w : WILD) {
            deck.add(new Card(w, "wild"));
            deck.add(new Card(w, "wild"));
            deck.add(new Card(w, "wild"));
            deck.add(new Card(w, "wild"));
        }
        return deck;
    }

    @Override
    public boolean handleValidPlay(GameState state, Card card) {
        /* Possibly write this better */
        List<Card> discard = state.getDiscardPile();
        Card topCard = discard.get(discard.size() - 1);

        // Stacking behavior
        if (state.getPenaltyDraw() > 0) {
            return card.getRank().equals(topCard.getRank());
        }

        //Wild is first behavior
        if (topCard.getSuit().equals("wild") && discard.size() == 1) {
            return true;
        }

        return card.getSuit().equals("wild")
            || card.getRank().equals(topCard.getRank())
            || card.getSuit().equals(state.getCurrentSuit());
    }

    @Override
    public void handleApplyEffect(GameState state, Card card, String chosenSuit) {
        switch (card.getRank()) {
            case"WildDraw4" -> {
                if (chosenSuit != null) state.setCurrentSuit(chosenSuit);
                state.setPenaltyDraw(state.getPenaltyDraw() + 4);
                state.setSkipNext(true);
            }
            case "Wild" -> { 
                if (chosenSuit != null) state.setCurrentSuit(chosenSuit); 
            }
            case "Skip" -> state.setSkipNext(true);
            case "Reverse" -> state.setDirection(state.getDirection() * -1);
            case "Draw2" -> {
                state.setPenaltyDraw(state.getPenaltyDraw() + 2);
                state.setSkipNext(true);
            }
        } 
    }
}