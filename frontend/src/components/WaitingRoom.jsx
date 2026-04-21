import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { startGame } from "../api/gameApi";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function WaitingRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  // Always set by ModeSelect — if missing, user navigated here directly
  const playerInfo = location.state?.playerInfo || null;

  const [room, setRoom] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const stompClient = useRef(null);

  useEffect(() => {
    if (!playerInfo) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/lobby/${playerInfo.roomCode}`, (msg) => {
          const data = JSON.parse(msg.body);
          if (data.gameId) {
            // Host started the game — move everyone to the game board
            navigate("/crazy-eights", {
              state: { playerInfo, gameId: data.gameId },
            });
          } else {
            // Another player joined — update the player list
            setRoom(data);
          }
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    stompClient.current = client;

    return () => client.deactivate();
  }, []);

  const handleStartGame = async () => {
    setError("");
    try {
      await startGame(playerInfo.roomCode); // POST /api/lobby/{roomCode}/start
      // WS broadcast will fire and the subscribe handler navigates everyone
    } catch (e) {
      setError("Failed to start game. Need at least 2 players.");
    }
  };

  // Guard: navigated here without going through ModeSelect
  if (!playerInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4">
        <p className="text-xl">No room session found.</p>
        <button
          onClick={() => navigate("/mode-select")}
          className="bg-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-500 transition-colors"
        >
          Go to Mode Select
        </button>
      </div>
    );
  }

  // Slot display — before first WS message room is null, so show a placeholder
  const slots = room
    ? room.playerNames.map((name, i) => ({ name, i }))
    : [
        { name: "You", i: playerInfo.playerIndex },
        { name: "Waiting...", i: -1 },
        { name: "Waiting...", i: -2 },
        { name: "Waiting...", i: -3 },
      ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white gap-6">
      <h1 className="text-4xl font-bold">Crazy Eights</h1>

      <div className="bg-gray-800 p-8 rounded-xl flex flex-col gap-4 w-96 text-center">
        <h2 className="text-lg font-semibold text-gray-400">Room Code</h2>
        <p className="text-5xl font-black tracking-widest text-yellow-400">
          {playerInfo.roomCode}
        </p>
        <p className="text-gray-500 text-sm">Share this with friends to join</p>

        {/* Player slots */}
        <div className="flex flex-col gap-2 my-2">
          {slots.map(({ name, i }) => {
            const isYou = i === playerInfo.playerIndex;
            const isCpu = name === "CPU";
            const isEmpty = name === "Waiting...";
            return (
              <div
                key={i}
                className={`p-2 rounded font-semibold transition-colors ${
                  isEmpty
                    ? "bg-gray-900 text-gray-600 animate-pulse"
                    : isCpu
                      ? "bg-gray-900 text-gray-600"
                      : isYou
                        ? "bg-blue-700 text-white"
                        : "bg-gray-700 text-white"
                }`}
              >
                {name} {isYou ? "(You)" : ""}
              </div>
            );
          })}
        </div>

        {/* Connection status */}
        {!connected && (
          <p className="text-gray-500 text-sm animate-pulse">
            Connecting to server...
          </p>
        )}

        {/* Only slot 0 (creator) can start */}
        {playerInfo.playerIndex === 0 && (
          <button
            onClick={handleStartGame}
            disabled={!connected}
            className="bg-orange-600 p-2 rounded font-bold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Game
          </button>
        )}

        {playerInfo.playerIndex !== 0 && (
          <p className="text-gray-400 text-sm">
            Waiting for the host to start...
          </p>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
}
