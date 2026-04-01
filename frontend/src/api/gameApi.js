const SUITS = ["Hearts", "Diamonds", "Spades", "Clubs"]
const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "Jack", "Queen", "King"]

export async function newGame() {
    return fetch("http://localhost:8080/api/game/new", {
        method: "POST"
    }).then(res => res.json());
}

export async function playCard(gameState, cardIndex, chosenSuit = null) {
    return fetch(`http://localhost:8080/api/game/${gameState.gameId}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIndex, chosenSuit })
    }).then(res => res.json());
    
    // return gameState;
}

export async function drawCard(gameState) {
    return fetch(`http://localhost:8080/api/game/${gameState.gameId}/draw`, {
        method: "POST"
    }).then(res => res.json());

    // const newState = { ...gameState };
    // if (newState.deck.length > 0) {
    //     const drawn = newState.deck[0];
    //     newState.deck = newState.deck.slice(1);
    //     newState.hands = newState.hands.map((h, i) =>
    //         i === 0 ? [...h, drawn] : h
    //     );
    // }
    // return newState;
}