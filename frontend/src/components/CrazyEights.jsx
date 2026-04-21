import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCardImage, getCardBack } from "../utils/cardImages";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function CrazyEights() {
  const location = useLocation();
  const navigate = useNavigate();

  // Both always set by ModeSelect (vs. Bots) or WaitingRoom (Private/Join)
  const playerInfo = location.state?.playerInfo || null;
  const gameId = location.state?.gameId || null;

  const [gameState, setGameState] = useState(null);
  const [message, setMessage] = useState("");

  const stompClient = useRef(null);

  useEffect(() => {
    if (!playerInfo || !gameId) return;

    // Fetch the current game state immediately via REST.
    // Needed because the WS broadcast from startGame() fired before we subscribed.
    fetch(`http://localhost:8080/api/game/${gameId}`)
      .then((res) => res.json())
      .then((state) => setGameState(state))
      .catch(() => setMessage("Failed to load game state."));

    // Connect to WebSocket and subscribe to live game updates
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/game/${gameId}`, (msg) => {
          const newState = JSON.parse(msg.body);
          setGameState(newState);
          if (newState.status === "FINISHED") {
            setMessage(`🏆 ${newState.winner} wins!`);
          }
        });
      },
    });

    client.activate();
    stompClient.current = client;

    return () => client.deactivate();
  }, []);

  const handleCardPlay = (cardIndex) => {
    if (!stompClient.current?.connected) return;
    stompClient.current.publish({
      destination: `/app/game/${gameId}/play`,
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
      destination: `/app/game/${gameId}/draw`,
      body: JSON.stringify({
        playerIndex: playerInfo.playerIndex,
      }),
    });
  };

  // Guard: navigated here without going through ModeSelect or WaitingRoom
  if (!playerInfo || !gameId) {
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

  // Loading: REST fetch not back yet
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
          {gameState.playerNames[myIdx]} (YOU){isMyTurn ? " — Your Turn!" : ""}
        </p>
      </section>
    </div>
  );
}
