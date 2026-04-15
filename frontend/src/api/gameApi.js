const SUITS = ["Hearts", "Diamonds", "Spades", "Clubs"];
const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "Jack", "Queen", "King"];

const API_BASE = "https://final-project-04-project-one.onrender.com";

export async function newGame() {
    const response = await fetch(`${API_BASE}/api/game/new`, {
        method: "POST"
    });

    if (!response.ok) {
        throw new Error("Failed to create new game.");
    }

    return response.json();
}

export async function playCard(gameState, cardIndex, chosenSuit = null) {
    const response = await fetch(`${API_BASE}/api/game/${gameState.gameId}/play`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ cardIndex, chosenSuit })
    });

    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Invalid move.");
    }

    return response.json();
}

export async function drawCard(gameState) {
    const response = await fetch(`${API_BASE}/api/game/${gameState.gameId}/draw`, {
        method: "POST"
    });

    if (!response.ok) {
        throw new Error("Failed to draw card.");
    }

    return response.json();
}