import { useState, useEffect, useRef } from "react";
import { newGame, playCard, drawCard } from "../api/gameApi";
import { getCardImage, getCardBack } from "../utils/cardImages";

/**
 * CrazyEights game board.
 *
 * Solo mode  (no props)     — fetches a new bot game on mount, uses REST API.
 * Multi mode (props passed) — driven by the parent (e.g. a page that shows Lobby
 *                             first, then mounts this with the data below).
 *
 * Props (all optional; omit for solo bot mode):
 *   initialState  GameState  — initial game state from the server
 *   playerInfo    { playerId, playerIndex, roomCode }
 *   stompClient   ref        — active STOMP client from Lobby
 */
export default function CrazyEights({
  initialState = null,
  playerInfo = null,
  stompClient = null,
}) {
  const isMultiplayer = !!playerInfo;
  const myIdx = isMultiplayer ? playerInfo.playerIndex : 0;

  const [gameState, setGameState] = useState(initialState);
  const [message, setMessage] = useState("");
  const [playedCardIndex, setPlayedCardIndex] = useState(null);
  const [cardOffset, setCardOffset] = useState({ x: 0, y: 0 });
  const [flyingCard, setFlyingCard] = useState(null);

  const discardRef = useRef(null);
  const cardRefs = useRef([]);
  const opponent1Ref = useRef(null);
  const opponent2Ref = useRef(null);
  const opponent3Ref = useRef(null);
  const deckRef = useRef(null);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  // Solo mode: start a new bot game on mount
  useEffect(() => {
    if (!isMultiplayer) {
      newGame().then(setGameState);
    }
  }, []);

  // Multiplayer: subscribe to game updates via the shared STOMP client
  useEffect(() => {
    if (!isMultiplayer || !stompClient || !initialState) return;
    const gameId = initialState.gameId;
    const sub = stompClient.subscribe(`/topic/game/${gameId}`, (msg) => {
      const updated = JSON.parse(msg.body);
      setGameState(updated);
      if (updated.status === "FINISHED") setMessage(`${updated.winner} wins!`);
    });
    return () => sub.unsubscribe();
  }, [isMultiplayer, stompClient, initialState]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const animateFlyFromDeck = async (targetRef) => {
    const deckEl = deckRef.current;
    const targetEl = targetRef.current || targetRef;
    if (!deckEl || !targetEl) return;

    const deckRect = deckEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    setFlyingCard({
      fromRect: {
        left: deckRect.left,
        top: deckRect.top,
        width: deckRect.width,
        height: deckRect.height,
      },
      offset: { x: 0, y: 0 },
    });
    await delay(50);
    setFlyingCard((prev) => ({
      ...prev,
      offset: {
        x:
          targetRect.left -
          deckRect.left +
          (targetRect.width - deckRect.width) / 2,
        y:
          targetRect.top -
          deckRect.top +
          (targetRect.height - deckRect.height) / 2,
      },
    }));
    await delay(450);
    setFlyingCard(null);
  };

  // ── Play Card ──────────────────────────────────────────────────────────────

  const handleCardPlay = async (cardIndex) => {
    if (isMultiplayer) {
      // Multiplayer: send over WebSocket, state update comes back via subscription
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: `/app/game/${gameState.gameId}/play`,
          body: JSON.stringify({
            playerIndex: myIdx,
            cardIndex,
            chosenSuit: null,
          }),
        });
      }
      return;
    }

    // Solo: animate then call REST
    const cardEl = cardRefs.current[cardIndex];
    const discardEl = discardRef.current;
    if (cardEl && discardEl) {
      const cardRect = cardEl.getBoundingClientRect();
      const discardRect = discardEl.getBoundingClientRect();
      setCardOffset({
        x:
          discardRect.left -
          cardRect.left +
          (discardRect.width - cardRect.width) / 2,
        y:
          discardRect.top -
          cardRect.top +
          (discardRect.height - cardRect.height) / 2,
      });
    }
    setPlayedCardIndex(cardIndex);

    const playedCard = gameState.hands[0][cardIndex];
    const previousGameState = gameState;
    setGameState((prev) => ({
      ...prev,
      discardPile: [...prev.discardPile, playedCard],
    }));

    setTimeout(async () => {
      try {
        const updated = await playCard(gameState, cardIndex);
        setPlayedCardIndex(null);
        setCardOffset({ x: 0, y: 0 });

        const log = updated.turnLog || [];
        for (let i = 0; i < log.length; i++) {
          const entry = log[i];
          console.log("TURN LOG ENTRY:", JSON.stringify(entry));
          const match = entry.message.match(/^\[(\d+)\]/);
          const entryPlayerIdx = match ? parseInt(match[1]) : 1;
          let opponentRef = opponent1Ref;
          //   if (entry.message.startsWith("Player 3")) opponentRef = opponent2Ref;
          //   if (entry.message.startsWith("Player 4")) opponentRef = opponent3Ref;
          if (entryPlayerIdx === (myIdx + 2) % 4) opponentRef = opponent2Ref; // top
          if (entryPlayerIdx === (myIdx + 3) % 4) opponentRef = opponent3Ref; // right

          if (entry.cardPlayed) {
            const fromEl = opponentRef.current;
            const discardEl = discardRef.current;
            if (fromEl && discardEl) {
              const fromRect = fromEl.getBoundingClientRect();
              const discardRect = discardEl.getBoundingClientRect();
              setFlyingCard({
                fromRect: {
                  left: fromRect.left,
                  top: fromRect.top,
                  width: fromRect.width,
                  height: fromRect.height,
                },
                offset: { x: 0, y: 0 },
              });
              await delay(50);
              setFlyingCard((prev) => ({
                ...prev,
                offset: {
                  x:
                    discardRect.left -
                    fromRect.left +
                    (discardRect.width - fromRect.width) / 2,
                  y:
                    discardRect.top -
                    fromRect.top +
                    (discardRect.height - fromRect.height) / 2,
                },
              }));
              await delay(450);
              setFlyingCard(null);
              setGameState((prev) => ({
                ...prev,
                discardPile: [...prev.discardPile, entry.cardPlayed],
                currentSuit: entry.cardPlayed.suit,
              }));
            }
            await delay(600);
          } else {
            await animateFlyFromDeck(opponentRef);
            await delay(300);
          }
        }

        await delay(400);
        setGameState(updated);
        setMessage("");
        if (updated.status === "FINISHED")
          setMessage(`${updated.winner} wins!`);
      } catch (e) {
        setPlayedCardIndex(null);
        setCardOffset({ x: 0, y: 0 });
        setGameState(previousGameState);
        setMessage(e.message || "Invalid move.");
      }
    }, 400);
  };

  // ── Draw Card ──────────────────────────────────────────────────────────────

  const handleDraw = async () => {
    if (isMultiplayer) {
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: `/app/game/${gameState.gameId}/draw`,
          body: JSON.stringify({ playerIndex: myIdx }),
        });
      }
      return;
    }

    // Solo: animate then call REST
    const deckEl = deckRef.current;
    if (deckEl) {
      const deckRect = deckEl.getBoundingClientRect();
      setFlyingCard({
        fromRect: {
          left: deckRect.left,
          top: deckRect.top,
          width: deckRect.width,
          height: deckRect.height,
        },
        offset: { x: 0, y: 0 },
      });
      await delay(50);
      setFlyingCard((prev) => ({
        ...prev,
        offset: {
          x: 0,
          y: window.innerHeight - deckRect.top - deckRect.height - 20,
        },
      }));
      await delay(450);
      setFlyingCard(null);
    }

    const updated = await drawCard(gameState);
    setGameState(updated);

    const log = updated.turnLog || [];
    for (let i = 0; i < log.length; i++) {
      const entry = log[i];
      console.log("TURN LOG ENTRY:", JSON.stringify(entry));
      const match = entry.message.match(/^\[(\d+)\]/);
      const entryPlayerIdx = match ? parseInt(match[1]) : 1;
      let opponentRef = opponent1Ref;
      //   if (entry.message.startsWith("Player 3")) opponentRef = opponent2Ref;
      //   if (entry.message.startsWith("Player 4")) opponentRef = opponent3Ref;
      if (entryPlayerIdx === (myIdx + 2) % 4) opponentRef = opponent2Ref; // top
      if (entryPlayerIdx === (myIdx + 3) % 4) opponentRef = opponent3Ref; // right

      if (entry.cardPlayed) {
        const fromEl = opponentRef.current;
        const discardEl = discardRef.current;
        if (fromEl && discardEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const discardRect = discardEl.getBoundingClientRect();
          setFlyingCard({
            fromRect: {
              left: fromRect.left + fromRect.width / 2 - 70,
              top: fromRect.top + fromRect.height / 2 - 98,
              width: 140,
              height: 196,
            },
            offset: { x: 0, y: 0 },
          });
          await delay(50);
          setFlyingCard((prev) => ({
            ...prev,
            offset: {
              x:
                discardRect.left +
                discardRect.width / 2 -
                (fromRect.left + fromRect.width / 2),
              y:
                discardRect.top +
                discardRect.height / 2 -
                (fromRect.top + fromRect.height / 2),
            },
          }));
          await delay(450);
          setFlyingCard(null);
          setGameState((prev) => ({
            ...prev,
            discardPile: [...prev.discardPile, entry.cardPlayed],
            currentSuit: entry.cardPlayed.suit,
          }));
        }
        await delay(600);
      } else {
        await animateFlyFromDeck(opponentRef);
        await delay(300);
      }
    }
    setGameState(updated);
  };

  const handleNewGame = () => {
    if (!isMultiplayer) {
      newGame().then((state) => {
        setGameState(state);
        setMessage("");
      });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!gameState)
    return <div className="text-white text-center mt-10">Loading...</div>;

  const userHand = gameState.hands[myIdx];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  // Map the three "other" players relative to myIdx
  // others[0] = left, others[1] = top, others[2] = right
  const others = [(myIdx + 1) % 4, (myIdx + 2) % 4, (myIdx + 3) % 4];
  const isMyTurn = gameState.currentPlayer === myIdx;

  return (
    <div className="grid h-screen w-screen grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto]">
      {/* Flying card animation overlay */}
      {flyingCard && (
        <img
          src={getCardBack()}
          style={{
            position: "fixed",
            left: flyingCard.fromRect.left,
            top: flyingCard.fromRect.top,
            width: flyingCard.fromRect.width,
            height: flyingCard.fromRect.height,
            transform: `translate(${flyingCard.offset.x}px, ${flyingCard.offset.y}px)`,
            transition: "transform 0.4s ease-in-out",
            zIndex: 100,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top opponent */}
      <section className="col-start-1 col-end-4 flex flex-col justify-center items-center pt-2">
        <p className="text-white font-bold mb-1">
          {gameState.playerNames[others[1]]}
        </p>
        <div className="flex flex-row -space-x-16">
          {gameState.hands[others[1]].map((_, i) => (
            <img
              key={i}
              ref={i === 0 ? opponent2Ref : null}
              src={getCardBack()}
              className="w-35 h-50 rotate-180"
            />
          ))}
        </div>
      </section>

      {/* Left opponent */}
      <section className="row-start-2 flex flex-col justify-center items-center pl-2 -space-y-60">
        <p className="text-white font-bold mb-1 rotate-90">
          {gameState.playerNames[others[0]]}
        </p>
        {gameState.hands[others[0]].map((_, i) => (
          <img
            key={i}
            ref={i === 0 ? opponent1Ref : null}
            src={getCardBack()}
            className="w-35 h-50 rotate-90"
          />
        ))}
      </section>

      {/* Middle board */}
      <section className="row-start-2 col-start-2 flex flex-col justify-center items-center gap-4">
        {message && (
          <p className="text-yellow-400 text-3xl font-black drop-shadow-md animate-bounce">
            {message}
          </p>
        )}
        {!message && (
          <p className="text-white text-xl font-bold bg-black/30 px-4 py-2 rounded-full">
            {isMyTurn
              ? "YOUR TURN"
              : `${gameState.playerNames[gameState.currentPlayer]}'s Turn`}
          </p>
        )}
        <p className="text-white text-sm">
          Current Suit: {gameState.currentSuit}
        </p>
        <div className="flex flex-row justify-center items-center gap-6">
          <button
            ref={deckRef}
            onClick={handleDraw}
            disabled={!isMyTurn || gameState.status === "FINISHED"}
            className="cursor-pointer hover:scale-105 transition-transform disabled:opacity-50"
          >
            <img src={getCardBack()} className="w-35 h-50" />
            {gameState.deck && (
              <p className="text-white text-xs text-center mt-1">
                {gameState.deck.length} left
              </p>
            )}
          </button>
          <div ref={discardRef}>
            <img
              src={getCardImage(topCard.rank, topCard.suit)}
              className="w-35 h-50"
            />
          </div>
        </div>
        {gameState.status === "FINISHED" && !isMultiplayer && (
          <button
            onClick={handleNewGame}
            className="mt-4 px-6 py-2 bg-white text-black rounded font-bold hover:bg-gray-200"
          >
            New Game
          </button>
        )}
      </section>

      {/* Right opponent */}
      <section className="row-start-2 col-start-3 flex flex-col justify-center items-center pr-2 -space-y-60">
        <p className="text-white font-bold mb-1 -rotate-90">
          {gameState.playerNames[others[2]]}
        </p>
        {gameState.hands[others[2]].map((_, i) => (
          <img
            key={i}
            ref={i === 0 ? opponent3Ref : null}
            src={getCardBack()}
            className="w-35 h-50 -rotate-90"
          />
        ))}
      </section>

      {/* Player hand */}
      <section className="col-start-1 col-end-4 flex flex-col justify-center items-center pb-2">
        <div className="flex flex-row justify-center items-end -space-x-16">
          {userHand.map((card, i) => (
            <button
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              onClick={() => handleCardPlay(i)}
              disabled={!isMyTurn || gameState.status === "FINISHED"}
              style={
                playedCardIndex === i
                  ? {
                      transform: `translate(${cardOffset.x}px, ${cardOffset.y}px)`,
                      transition: "transform 0.4s ease-in-out",
                      zIndex: 50,
                      pointerEvents: "none",
                    }
                  : {}
              }
              className="hover:-translate-y-4 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:grayscale-[0.4]"
            >
              <img
                src={getCardImage(card.rank, card.suit)}
                className="w-35 h-50"
              />
            </button>
          ))}
        </div>
        <p className="text-white font-black mt-2 text-xl tracking-widest text-center w-full">
          {gameState.playerNames[myIdx]} (YOU)
        </p>
      </section>
    </div>
  );
}
