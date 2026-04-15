package com.backend.crazy8s;

import java.util.List;

public interface Ruleset {

    public List<Card> handleCreateDeck();

    public boolean handleValidPlay(GameState state, Card Card);

    public void handleApplyEffect(GameState state, Card card, String chosenSuit);
}
