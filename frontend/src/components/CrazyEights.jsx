import { useState, useEffect, useRef } from 'react';
import { newGame, playCard, drawCard } from '../api/gameApi';
import { getCardImage, getCardBack } from '../utils/cardImages';

export default function CrazyEights() {
    const [gameState, setGameState] = useState(null);
    const [message, setMessage] = useState('');
    const [playedCardIndex, setPlayedCardIndex] = useState(null);
    const [cardOffset, setCardOffset] = useState({ x: 0, y: 0 });

    const discardRef = useRef(null);
    const cardRefs = useRef([]);

    // Start game on mount
    useEffect(() => {
        newGame().then(setGameState);
    }, []);

    const handleCardPlay = async (cardIndex) => {
        // Calculate distance from clicked card to discard pile
        const cardEl = cardRefs.current[cardIndex];
        const discardEl = discardRef.current;

        if (cardEl && discardEl) {
            const cardRect = cardEl.getBoundingClientRect();
            const discardRect = discardEl.getBoundingClientRect();

            setCardOffset({
                x: discardRect.left - cardRect.left + (discardRect.width - cardRect.width) / 2,
                y: discardRect.top - cardRect.top + (discardRect.height - cardRect.height) / 2,
            });
        }

        setPlayedCardIndex(cardIndex);

        setTimeout(async () => {
            try {
                const updated = await playCard(gameState, cardIndex);
                setGameState(updated);
                setPlayedCardIndex(null);
                setCardOffset({ x: 0, y: 0 });
                if (updated.status === "FINISHED")
                    setMessage(`${updated.winner} wins!`);
            } catch (e) {
                setPlayedCardIndex(null);
                setCardOffset({ x: 0, y: 0 });
                setMessage(e.message || "Invalid move.");
            }
        }, 400);
    };

    const handleDraw = async () => {
        const updated = await drawCard(gameState);
        setGameState(updated);
    };

    const handleNewGame = () => {
        newGame().then(state => {
            setGameState(state);
            setMessage('');
        });
    };

    if (!gameState) return <div className="text-white text-center mt-10">Loading...</div>;

    const userHand = gameState.hands[0];
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const opponent1Hand = gameState.hands[1]; // top
    const opponent2Hand = gameState.hands[2]; // left
    const opponent3Hand = gameState.hands[3]; // right

    return (
        <div className='grid h-screen w-screen grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto]'>
            {/* top hand */}
            <section className='col-start-1 col-end-4 flex flex-row justify-center items-start pt-2 -space-x-16'>
                {opponent1Hand.map((_, i) => (
                    <img key={i} src={getCardBack()} className='w-35 h-50 rotate-180' />
                ))}
            </section>

            {/* left hand */}
            <section className='row-start-2 flex flex-col justify-center items-center pl-2 -space-y-60'>
                {opponent2Hand.map((_, i) => (
                    <img key={i} src={getCardBack()} className='w-35 h-50 rotate-90' />
                ))}
            </section>

            {/* middle cards */}
            <section className='row-start-2 col-start-2 flex flex-col justify-center items-center gap-4'>
                {message && <p className='text-white text-lg font-bold'>{message}</p>}
                <p className='text-white text-sm'>Current Suit: {gameState.currentSuit}</p>
                <div className='flex flex-row justify-center items-center gap-6'>
                    <button onClick={handleDraw} className='cursor-pointer hover:scale-105 transition-transform'>
                        <img src={getCardBack()} className='w-35 h-50' />
                    </button>
                    <div ref={discardRef}>
                        <img
                            src={getCardImage(topCard.rank, topCard.suit)}
                            className='w-35 h-50'
                        />
                    </div>
                </div>
                {gameState.status === "FINISHED" && (
                    <button onClick={handleNewGame} className='mt-4 px-6 py-2 bg-white text-black rounded font-bold hover:bg-gray-200'>
                        New Game
                    </button>
                )}
            </section>

            {/* right hand */}
            <section className='row-start-2 col-start-3 flex flex-col justify-center items-center pr-2 -space-y-60'>
                {opponent3Hand.map((_, i) => (
                    <img key={i} src={getCardBack()} className='w-35 h-50 -rotate-90' />
                ))}
            </section>

            {/* player hand */}
            <section className='col-start-1 col-end-4 flex flex-row justify-center items-end pb-2 -space-x-16'>
                {userHand.map((card, i) => (
                    <button
                        key={i}
                        ref={el => cardRefs.current[i] = el}
                        onClick={() => handleCardPlay(i)}
                        style={
                            playedCardIndex === i
                                ? {
                                    transform: `translate(${cardOffset.x}px, ${cardOffset.y}px)`,
                                    transition: 'transform 0.4s ease-in-out',
                                    zIndex: 50,
                                    pointerEvents: 'none',
                                }
                                : {}
                        }
                        className='hover:-translate-y-4 focus:outline-none cursor-pointer'
                    >
                        <img src={getCardImage(card.rank, card.suit)} className='w-35 h-50' />
                    </button>
                ))}
            </section>
        </div>
    );
}