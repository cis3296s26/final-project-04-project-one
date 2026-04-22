package com.backend.crazy8s;

public class TurnLogEntry {
    private String message;
    private Card cardPlayed; // null if the CPU drew instead of played

    public TurnLogEntry() {}

    public TurnLogEntry(String message, Card cardPlayed) {
        this.message = message;
        this.cardPlayed = cardPlayed;
    }

    public String getMessage() { return message; }
    public Card getCardPlayed() { return cardPlayed; }

    public void setMessage(String message) { this.message = message; }
    public void setCardPlayed(Card cardPlayed) { this.cardPlayed = cardPlayed; }
}