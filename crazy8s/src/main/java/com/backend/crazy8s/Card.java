package com.backend.crazy8s;

public class Card {
    private String rank;
    private String suit;

    public Card() {}

    public Card(String rank, String suit) {
        this.rank = rank;
        this.suit = suit;
    }

    // Getters
    public String getRank() { return rank; }
    public String getSuit() { return suit; }

    // Setters
    public void setRank(String rank) { this.rank = rank; }
    public void setSuit(String suit) { this.suit = suit; }

    @Override
    public String toString() {
        return rank + " of " + suit;
    }
}