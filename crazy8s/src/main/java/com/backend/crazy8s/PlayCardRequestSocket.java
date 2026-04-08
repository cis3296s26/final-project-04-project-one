package com.backend.crazy8s;

import lombok.Data;

@Data
public class PlayCardRequestSocket {
    private GameState state;
    private int cardIndex;
    private String chosenSuit;

    public PlayCardRequestSocket() {

    }
}
