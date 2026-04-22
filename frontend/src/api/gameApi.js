export const SUITS = ["Hearts", "Diamonds", "Spades", "Clubs"];
export const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api";

// Lobby Management
export async function createRoom(displayName) {
    return fetch(`${BASE_URL}/lobby/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName })
    }).then(res => res.json());
}

export async function joinRoom(roomCode, displayName) {
    return fetch(`${BASE_URL}/lobby/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, displayName })
    }).then(res => res.json());
}

export async function startGame(roomCode) {
    return fetch(`${BASE_URL}/lobby/${roomCode}/start`, {
        method: "POST"
    }).then(res => res.json());
}
