import { useState, useEffect, useRef } from "react";
import { createRoom, joinRoom, startGame } from "../api/gameApi";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Lobby component for multiplayer Crazy Eights.
 *
 * Props:
 *   onGameStart(gameState, playerInfo) — called when the game begins.
 *     gameState  : the initial GameState from the server
 *     playerInfo : { playerId, playerIndex, roomCode }
 */
export default function Lobby({ onGameStart }) {
  const [playerInfo, setPlayerInfo] = useState(null); // { playerId, playerIndex, roomCode }
  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState(
    "Player " + Math.floor(Math.random() * 1000),
  );
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const stompClient = useRef(null);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, []);

  const connectToLobby = (roomCode, info) => {
    const socket = new SockJS(`${API_BASE}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        // Listen for lobby updates (players joining) and game start signal
        client.subscribe(`/topic/lobby/${roomCode}`, (msg) => {
          const data = JSON.parse(msg.body);
          if (data.gameId) {
            // Server sent a gameId — subscribe to the game and wait for state
            client.subscribe(`/topic/game/${data.gameId}`, (gameMsg) => {
              const gameState = JSON.parse(gameMsg.body);
              onGameStart(gameState, info, client);
            });
          } else {
            // Regular room update
            setRoom(data);
          }
        });
      },
      onDisconnect: () => setMessage("Disconnected from server."),
    });
    client.activate();
    stompClient.current = client;
  };

  const handleCreateRoom = async () => {
    try {
      const data = await createRoom(displayName);
      setPlayerInfo(data);
      connectToLobby(data.roomCode, data);
    } catch {
      setMessage("Failed to create room.");
    }
  };

  const handleJoinRoom = async () => {
    try {
      const data = await joinRoom(
        roomCodeInput.trim().toUpperCase(),
        displayName,
      );
      setPlayerInfo(data);
      connectToLobby(data.roomCode, data);
    } catch {
      setMessage("Room not found or full.");
    }
  };

  const handleStartGame = async () => {
    try {
      await startGame(playerInfo.roomCode);
    } catch {
      setMessage("Failed to start game. Need at least 2 players.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white gap-6">
      <h1 className="text-4xl font-bold">Crazy Eights</h1>

      {!playerInfo ? (
        /* ── Enter name / room code ── */
        <div className="bg-gray-800 p-8 rounded-xl flex flex-col gap-4 w-96">
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCreateRoom}
            className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-500 transition-colors"
          >
            Create Private Room
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Room Code"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              className="p-2 rounded bg-gray-700 border border-gray-600 flex-grow"
            />
            <button
              onClick={handleJoinRoom}
              className="bg-green-600 px-4 rounded font-bold hover:bg-green-500 transition-colors"
            >
              Join
            </button>
          </div>
          {message && <p className="text-red-400 text-center">{message}</p>}
        </div>
      ) : (
        /* ── Waiting room ── */
        <div className="bg-gray-800 p-8 rounded-xl flex flex-col gap-4 w-96 text-center">
          <h2 className="text-2xl font-bold">Room: {playerInfo.roomCode}</h2>
          <p className="text-gray-400 text-sm">Share this code with friends!</p>
          <div className="flex flex-col gap-2 my-2">
            {room ? (
              room.playerNames.map((name, i) => (
                <div
                  key={i}
                  className={`p-2 rounded ${
                    name === "CPU"
                      ? "bg-gray-900 text-gray-600"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {name}
                  {i === playerInfo.playerIndex ? " (You)" : ""}
                </div>
              ))
            ) : (
              <p className="text-gray-400">Waiting for room data...</p>
            )}
          </div>
          {/* Only the room creator (slot 0) can start */}
          {playerInfo.playerIndex === 0 && (
            <button
              onClick={handleStartGame}
              className="bg-orange-600 p-2 rounded font-bold hover:bg-orange-500 transition-colors"
            >
              Start Game
            </button>
          )}
          {message && <p className="text-red-400">{message}</p>}
        </div>
      )}
    </div>
  );
}
