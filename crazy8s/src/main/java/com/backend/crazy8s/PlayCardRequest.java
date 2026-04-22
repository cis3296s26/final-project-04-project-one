package com.backend.crazy8s;

public class PlayCardRequest {
    private int playerIndex;
    private int cardIndex;
    private String chosenSuit;

    public PlayCardRequest() {}

    public int getPlayerIndex() { return playerIndex; }
    public void setPlayerIndex(int playerIndex) { this.playerIndex = playerIndex; }
    
    public int getCardIndex() { return cardIndex; }
    public void setCardIndex(int cardIndex) { this.cardIndex = cardIndex; }

    public String getChosenSuit() { return chosenSuit; }
    public void setChosenSuit(String chosenSuit) { this.chosenSuit = chosenSuit; }
}
