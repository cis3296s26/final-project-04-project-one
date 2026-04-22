package com.backend.crazy8s;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component("crazy8sRuleset")
public class Crazy8sRuleset implements Ruleset {

    @Override
    public List<Card> handleCreateDeck() {
        String[] SUITS = {"Hearts", "Diamonds", "Clubs", "Spades"};
        String[] RANKS = {"Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"};
        List<Card> deck = new ArrayList<>();

        for (String suit : SUITS) {
            for (String rank : RANKS) {
                deck.add(new Card(suit, rank));
            }
        }
        return deck;
    }

    @Override
    public boolean handleValidPlay(GameState state,Card card) {
        List<Card> discard = state.getDiscardPile();
        Card topCard = discard.get(discard.size() - 1);

        // Penalty draw behavior
        if (state.getPenaltyDraw() > 0) {
            return false;
        }

        return card.getRank().equals("8")
            || card.getRank().equals(topCard.getRank())
            || card.getSuit().equals(state.getCurrentSuit());
    }

    @Override
    public void handleApplyEffect(GameState state, Card card, String chosenSuit) {
        switch (card.getRank()) {
            case "8" -> { 
                if (chosenSuit != null) state.setCurrentSuit(chosenSuit); 
            }
            case "Queen" -> state.setSkipNext(true);
            case "Ace" -> state.setDirection(state.getDirection() * -1);
            case "2" -> state.setPenaltyDraw(2);
        }
    } 
}
