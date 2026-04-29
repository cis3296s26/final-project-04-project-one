package com.backend.crazy8s.rules;

import java.util.List;

import com.backend.crazy8s.model.Card;
import com.backend.crazy8s.model.GameState;

public interface Ruleset {

    public List<Card> handleCreateDeck();

    public boolean handleValidPlay(GameState state, Card Card);

    public void handleApplyEffect(GameState state, Card card, String chosenSuit);
}
