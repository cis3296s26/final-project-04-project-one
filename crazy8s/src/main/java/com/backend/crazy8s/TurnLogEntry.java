// TurnLogEntry.java
package com.backend.crazy8s;

public class TurnLogEntry {
    private String message;
    private Card cardPlayed; // null if drew a card

    public TurnLogEntry(String message, Card cardPlayed) {
        this.message = message;
        this.cardPlayed = cardPlayed;
    }

    public String getMessage() { return message; }
    public Card getCardPlayed() { return cardPlayed; }
}