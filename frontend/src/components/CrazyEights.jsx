import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { startGame } from "../api/gameApi";
import { getCardImage, getCardBack } from "../utils/cardImages";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function CrazyEights() {
  const location = useLocation();
  const navigate = useNavigate();

  // If coming from ModeSelect, playerInfo and optionally gameId are in route state.
  // If navigated directly (e.g. old bookmark), both will be null and we show an error.
  const routePlayerInfo = location.state?.playerInfo || null;
  const routeGameId = location.state?.gameId || null; // only set for vs. Bots
  const waitingInLobby = location.state?.waitingInLobby || false; // true for Private / Join

  const [gameState, setGameState] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerInfo] = useState(routePlayerInfo); // never changes after mount
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false); // WebSocket ready?

  const stompClient = useRef(null);
  const gameIdRef = useRef(routeGameId); // store gameId for use inside callbacks

  // ─── WebSocket setup ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!playerInfo) return; // no playerInfo = came here directly, do nothing

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);

        if (waitingInLobby) {
          // Private / Join: subscribe to lobby topic to wait for the host to start
          client.subscribe(`/topic/lobby/${playerInfo.roomCode}`, (msg) => {
            const data = JSON.parse(msg.body);
            if (data.gameId) {
              // Host pressed Start — switch to game subscription
              gameIdRef.current = data.gameId;
              subscribeToGame(client, data.gameId);
            } else {
              // Another player joined — update the room player list
              setRoom(data);
            }
          });
        } else if (routeGameId) {
          // vs. Bots: game already started, subscribe directly to game topic
          subscribeToGame(client, routeGameId);
          // Also fetch the initial state via REST since the WS broadcast
          // from startGame() fired before we were connected
          fetchInitialGameState(routeGameId);
        }
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    stompClient.current = client;

    return () => client.deactivate();
  }, []); // runs once on mount

  const subscribeToGame = (client, gameId) => {
    client.subscribe(`/topic/game/${gameId}`, (msg) => {
      const newState = JSON.parse(msg.body);
      setGameState(newState);
      if (newState.status === "FINISHED") {
        setMessage(`🏆 ${newState.winner} wins!`);
      }
    });
  };

  // For vs. Bots: the WS broadcast from startGame() fires before we subscribe,
  // so we do a one-time REST GET to load the current state immediately.
  const fetchInitialGameState = async (gameId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/game/${gameId}`);
      const state = await res.json();
      setGameState(state);
    } catch (e) {
      setMessage("Failed to load game state.");
    }
  };

  // ─── Lobby actions ───────────────────────────────────────────────────────────

  // Only the room creator (playerIndex === 0) can start the game
  const handleStartGame = async () => {
    try {
      await startGame(playerInfo.roomCode); // POST /api/lobby/{roomCode}/start
      // The WS broadcast will fire and subscribeToGame() handles the rest
    } catch (e) {
      setMessage("Failed to start game.");
    }
  };

  // ─── Game actions ────────────────────────────────────────────────────────────

  const handleCardPlay = (cardIndex) => {
    if (!stompClient.current?.connected) return;
    stompClient.current.publish({
      destination: `/app/game/${gameIdRef.current}/play`,
      body: JSON.stringify({
        playerIndex: playerInfo.playerIndex,
        cardIndex,
        chosenSuit: null,
      }),
    });
  };

  const handleDraw = () => {
    if (!stompClient.current?.connected) return;
    stompClient.current.publish({
      destination: `/app/game/${gameIdRef.current}/draw`,
      body: JSON.stringify({
        playerIndex: playerInfo.playerIndex,
      }),
    });
  };

  // ─── Guard: navigated here without going through ModeSelect ─────────────────

  if (!playerInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4">
        <p className="text-xl">No game session found.</p>
        <button
          onClick={() => navigate("/mode-select")}
          className="bg-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-500 transition-colors"
        >
          Go to Mode Select
        </button>
      </div>
    );
  }

  // ─── Lobby waiting view (Private / Join) ─────────────────────────────────────

  if (waitingInLobby && !gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white gap-6">
        <h1 className="text-4xl font-bold">Crazy Eights</h1>
        <div className="bg-gray-800 p-8 rounded-xl flex flex-col gap-4 w-96 text-center">
          <h2 className="text-2xl font-bold">Room Code</h2>
          <p className="text-5xl font-black tracking-widest text-yellow-400">
            {playerInfo.roomCode}
          </p>
          <p className="text-gray-400 text-sm">Share this code with friends</p>

          <div className="flex flex-col gap-2 my-2">
            {/* Show slots — populated once someone joins and room state arrives */}
            {room ? (
              room.playerNames.map((name, i) => (
                <div
                  key={i}
                  className={`p-2 rounded font-semibold ${
                    name === "CPU"
                      ? "bg-gray-900 text-gray-600"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {name} {i === playerInfo.playerIndex ? "(You)" : ""}
                </div>
              ))
            ) : (
              // Before first WS message, show a placeholder for our own slot
              <div className="p-2 rounded bg-gray-700 text-white font-semibold">
                Waiting for players...
              </div>
            )}
          </div>

          {/* Only the creator (slot 0) can start */}
          {playerInfo.playerIndex === 0 && (
            <button
              onClick={handleStartGame}
              className="bg-orange-600 p-2 rounded font-bold hover:bg-orange-500 transition-colors"
            >
              Start Game
            </button>
          )}

          {!connected && (
            <p className="text-gray-400 text-sm animate-pulse">
              Connecting to server...
            </p>
          )}
          {message && <p className="text-red-400">{message}</p>}
        </div>
      </div>
    );
  }

  // ─── Loading state: vs. Bots, WebSocket connected but REST fetch not back yet ─

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white text-2xl">
        Loading game...
      </div>
    );
  }

  // ─── Game view ───────────────────────────────────────────────────────────────

  const myIdx = playerInfo.playerIndex;
  const userHand = gameState.hands[myIdx];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const others = [(myIdx + 1) % 4, (myIdx + 2) % 4, (myIdx + 3) % 4];
  const isMyTurn =
    gameState.currentPlayer === myIdx && gameState.status === "IN_PROGRESS";

  return (
    <div className="grid h-screen w-screen grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto] bg-green-900 overflow-hidden">
      {/* Top Opponent */}
      <section className="col-start-1 col-end-4 flex flex-col justify-center items-center pt-2">
        <p
          className={`font-bold mb-1 ${gameState.currentPlayer === others[1] ? "text-yellow-400" : "text-white"}`}
        >
          {gameState.playerNames[others[1]]}
          {gameState.currentPlayer === others[1] ? " ◀" : ""}
        </p>
        <div className="flex flex-row -space-x-16">
          {gameState.hands[others[1]].map((_, i) => (
            <img
              key={i}
              src={getCardBack()}
              alt="card"
              className="w-24 h-36 rotate-180 shadow-lg"
            />
          ))}
        </div>
      </section>

      {/* Left Opponent */}
      <section className="row-start-2 flex flex-col justify-center items-center pl-4">
        <p
          className={`font-bold mb-2 rotate-90 ${gameState.currentPlayer === others[0] ? "text-yellow-400" : "text-white"}`}
        >
          {gameState.playerNames[others[0]]}
          {gameState.currentPlayer === others[0] ? " ◀" : ""}
        </p>
        <div className="flex flex-col -space-y-24">
          {gameState.hands[others[0]].map((_, i) => (
            <img
              key={i}
              src={getCardBack()}
              alt="card"
              className="w-24 h-36 rotate-90 shadow-lg"
            />
          ))}
        </div>
      </section>

      {/* Middle Board */}
      <section className="row-start-2 col-start-2 flex flex-col justify-center items-center gap-6">
        <div className="text-center">
          {message ? (
            <p className="text-yellow-400 text-3xl font-black drop-shadow-md animate-bounce">
              {message}
            </p>
          ) : (
            <p className="text-white text-xl font-bold bg-black/30 px-4 py-2 rounded-full">
              {isMyTurn
                ? "YOUR TURN"
                : `${gameState.playerNames[gameState.currentPlayer]}'s Turn`}
            </p>
          )}
          <p className="text-white mt-2 font-medium">
            Current Suit:{" "}
            <span className="font-bold text-yellow-300">
              {gameState.currentSuit}
            </span>
          </p>
          {gameState.penaltyDraw > 0 && (
            <p className="text-red-400 font-bold mt-1">
              +{gameState.penaltyDraw} draw penalty incoming!
            </p>
          )}
          {gameState.skipNext && (
            <p className="text-orange-400 font-bold mt-1">
              Next player is skipped!
            </p>
          )}
        </div>

        <div className="flex flex-row justify-center items-center gap-10">
          {/* Draw pile */}
          <button
            onClick={handleDraw}
            disabled={!isMyTurn}
            className="cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src={getCardBack()}
              alt="draw pile"
              className="w-32 h-48 shadow-2xl"
            />
            <p className="text-white text-xs mt-2 text-center">
              {gameState.deck.length} cards left
            </p>
          </button>

          {/* Top of discard pile */}
          <img
            src={getCardImage(topCard.rank, topCard.suit)}
            alt={`${topCard.rank} of ${topCard.suit}`}
            className="w-32 h-48 shadow-2xl"
          />
        </div>
      </section>

      {/* Right Opponent */}
      <section className="row-start-2 col-start-3 flex flex-col justify-center items-center pr-4">
        <p
          className={`font-bold mb-2 -rotate-90 ${gameState.currentPlayer === others[2] ? "text-yellow-400" : "text-white"}`}
        >
          {gameState.playerNames[others[2]]}
          {gameState.currentPlayer === others[2] ? " ◀" : ""}
        </p>
        <div className="flex flex-col -space-y-24">
          {gameState.hands[others[2]].map((_, i) => (
            <img
              key={i}
              src={getCardBack()}
              alt="card"
              className="w-24 h-36 -rotate-90 shadow-lg"
            />
          ))}
        </div>
      </section>

      {/* Player Hand */}
      <section className="col-start-1 col-end-4 flex flex-col justify-center items-center pb-4">
        <div className="flex flex-row justify-center items-end -space-x-12">
          {userHand.map((card, i) => (
            <button
              key={i}
              disabled={!isMyTurn}
              onClick={() => handleCardPlay(i)}
              className="transition-all duration-150 hover:-translate-y-8 hover:z-10 focus:outline-none cursor-pointer disabled:cursor-not-allowed group"
            >
              <img
                src={getCardImage(card.rank, card.suit)}
                alt={`${card.rank} of ${card.suit}`}
                className="w-32 h-48 shadow-xl group-disabled:grayscale-[0.5]"
              />
            </button>
          ))}
        </div>
        <p className="text-white font-black mt-4 text-xl tracking-widest">
          {gameState.playerNames[myIdx]} (YOU)
          {isMyTurn ? " — Your Turn!" : ""}
        </p>
      </section>
    </div>
  );
}
