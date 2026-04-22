export const SUITS = ["Hearts", "Diamonds", "Spades", "Clubs"];
export const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api";

// Helper — throw on non-2xx so callers can catch HTTP errors normally
async function checkOk(res) {
  if (!res.ok) {
    const body = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(body || `HTTP ${res.status}`);
  }
  return res.json();
}

// Lobby Management
export async function createRoom(displayName) {
  const res = await fetch(`${BASE_URL}/lobby/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName })
  });
  return checkOk(res);
}

export async function joinRoom(roomCode, displayName) {
  const res = await fetch(`${BASE_URL}/lobby/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomCode, displayName })
  });
  return checkOk(res);
}

export async function startGame(roomCode) {
  const res = await fetch(`${BASE_URL}/lobby/${roomCode}/start`, {
    method: "POST"
  });
  return checkOk(res);
}
