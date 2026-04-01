const SUITS = ["Hearts", "Diamonds", "Spades", "Clubs"]
const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "Jack", "Queen", "King"]

function makeDeck() {
    const deck = [];
    for (const suit of SUITS)
        for (const rank of RANKS)
            deck.push({ rank, suit });
    return deck.sort(() => Math.random() - 0.5);
}

export async function newGame() {
    const deck = makeDeck();
    const hands = [[], [], [], []];
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 7; j++)
            hands[i].push(deck.pop());

    const topCard = deck.pop();

    return {
        gameId: "mock-id",
        hands,
        deck,
        discardPile: [topCard],
        currentSuit: topCard.suit,
        currentPlayer: 0,
        direction: 1,
        skipNext: false,
        penaltyDraw: 0,
        status: "IN_PROGRESS",
        winner: null,
    };
}