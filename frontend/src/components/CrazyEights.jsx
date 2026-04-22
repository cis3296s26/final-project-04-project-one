import { useState, useEffect, useRef } from "react";
import { newGame, playCard, drawCard } from "../api/gameApi";
import { getCardImage, getCardBack } from "../utils/cardImages";

export default function CrazyEights() {
  const [gameState, setGameState] = useState(null);
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

  // Start game on mount
  useEffect(() => {
    newGame().then(setGameState);
  }, []);

  // helper
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // animate flying from deck helper function
  const animateFlyFromDeck = async (targetRef) => {
    const deckEl = deckRef.current;
    const targetEl = targetRef.current || targetRef; // support both ref and element
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

  const handleCardPlay = async (cardIndex) => {
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

        // Replay each CPU turn: update top card visually, then show message
        for (let i = 0; i < log.length; i++) {
          const entry = log[i];

          if (entry.cardPlayed) {
            // Figure out which opponent played (parse from message)
            let opponentRef = opponent1Ref;
            if (entry.message.startsWith("Player 3"))
              opponentRef = opponent2Ref;
            if (entry.message.startsWith("Player 4"))
              opponentRef = opponent3Ref;

            const fromEl = opponentRef.current;
            const discardEl = discardRef.current;

            if (fromEl && discardEl) {
              const fromRect = fromEl.getBoundingClientRect();
              const discardRect = discardEl.getBoundingClientRect();

              // Start the card at the opponent's position
              setFlyingCard({
                fromRect: {
                  left: fromRect.left + fromRect.width / 2 - 70,
                  top: fromRect.top + fromRect.height / 2 - 98,
                  width: 140,
                  height: 196,
                },
                offset: { x: 0, y: 0 },
              });

              await delay(50); // let the element mount first

              // Fly it to the discard pile
              const discardCenter = {
                x: discardRect.left + discardRect.width / 2,
                y: discardRect.top + discardRect.height / 2,
              };
              setFlyingCard((prev) => ({
                ...prev,
                offset: {
                  x: discardCenter.x - (fromRect.left + fromRect.width / 2),
                  y: discardCenter.y - (fromRect.top + fromRect.height / 2),
                },
              }));

              await delay(450); // wait for animation to finish

              // Swap to the real card on the discard pile, remove flying card
              setFlyingCard(null);
              setGameState((prev) => ({
                ...prev,
                discardPile: [...prev.discardPile, entry.cardPlayed],
                currentSuit: entry.cardPlayed.suit,
              }));
            }

            await delay(600);
          } else {
            let opponentRef = opponent1Ref;
            if (entry.message.startsWith("Player 3"))
              opponentRef = opponent2Ref;
            if (entry.message.startsWith("Player 4"))
              opponentRef = opponent3Ref;

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

  const handleDraw = async () => {
    // Find the user hand section to fly the card toward
    // We can just use the cardRefs area or approximate with a fixed bottom target
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

    // Now animate CPU turns that follow
    const log = updated.turnLog || [];
    for (let i = 0; i < log.length; i++) {
      const entry = log[i];

      // Resolve opponent ref for every entry, not just card plays
      let opponentRef = opponent1Ref;
      if (entry.message.startsWith("Player 3")) opponentRef = opponent2Ref;
      if (entry.message.startsWith("Player 4")) opponentRef = opponent3Ref;

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
    newGame().then((state) => {
      setGameState(state);
      setMessage("");
    });
  };

  if (!gameState)
    return <div className="text-white text-center mt-10">Loading...</div>;

  const userHand = gameState.hands[0];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const opponent1Hand = gameState.hands[1]; // top
  const opponent2Hand = gameState.hands[2]; // left
  const opponent3Hand = gameState.hands[3]; // right

  return (
    <div className="grid h-screen w-screen grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto]">
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
      {/* top hand */}
      <section
        ref={opponent2Ref}
        className="col-start-1 col-end-4 flex flex-row justify-center items-start pt-2 -space-x-16"
      >
        {opponent1Hand.map((_, i) => (
          <img key={i} src={getCardBack()} className="w-35 h-50 rotate-180" />
        ))}
      </section>

      {/* left hand */}
      <section
        ref={opponent1Ref}
        className="row-start-2 flex flex-col justify-center items-center pl-2 -space-y-60"
      >
        {opponent2Hand.map((_, i) => (
          <img key={i} src={getCardBack()} className="w-35 h-50 rotate-90" />
        ))}
      </section>

      {/* middle cards */}
      <section className="row-start-2 col-start-2 flex flex-col justify-center items-center gap-4">
        {message && <p className="text-white text-lg font-bold">{message}</p>}
        <p className="text-white text-sm">
          Current Suit: {gameState.currentSuit}
        </p>
        <div className="flex flex-row justify-center items-center gap-6">
          <button
            ref={deckRef}
            onClick={handleDraw}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            <img src={getCardBack()} className="w-35 h-50" />
          </button>
          <div ref={discardRef}>
            <img
              src={getCardImage(topCard.rank, topCard.suit)}
              className="w-35 h-50"
            />
          </div>
        </div>
        {gameState.status === "FINISHED" && (
          <button
            onClick={handleNewGame}
            className="mt-4 px-6 py-2 bg-white text-black rounded font-bold hover:bg-gray-200"
          >
            New Game
          </button>
        )}
      </section>

      {/* right hand */}
      <section
        ref={opponent3Ref}
        className="row-start-2 col-start-3 flex flex-col justify-center items-center pr-2 -space-y-60"
      >
        {opponent3Hand.map((_, i) => (
          <img key={i} src={getCardBack()} className="w-35 h-50 -rotate-90" />
        ))}
      </section>

      {/* player hand */}
      <section className="col-start-1 col-end-4 flex flex-row justify-center items-end pb-2 -space-x-16">
        {userHand.map((card, i) => (
          <button
            key={i}
            ref={(el) => (cardRefs.current[i] = el)}
            onClick={() => handleCardPlay(i)}
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
            className="hover:-translate-y-4 focus:outline-none cursor-pointer"
          >
            <img
              src={getCardImage(card.rank, card.suit)}
              className="w-35 h-50"
            />
          </button>
        ))}
      </section>
    </div>
  );
}
