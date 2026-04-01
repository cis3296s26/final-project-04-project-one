const SUITS = ["Hearts", "Diamonds", "Spades", "Clubs"]
const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "Jack", "Queen", "King"]

function makeDeck() {
    const deck = [];
    for (const suit of SUITS)
        for (const rank of RANKS)
            deck.push({ rank, suit });
    return deck.sort(() => Math.random() - 0.5);
}