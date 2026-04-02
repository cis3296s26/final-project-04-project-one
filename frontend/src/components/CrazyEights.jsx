import { useState, useEffect } from 'react';
import { newGame, playCard, drawCard } from '../api/gameApi';
import { getCardImage, getCardBack } from '../utils/cardImages';

export default function CrazyEights() {
    const [gameState, setGameState] = useState(null);
    const [message, setMessage] = useState('');

    // Start game on mount
    useEffect(() => {
        newGame().then(setGameState);
    }, []);

    const handleCardPlay = async (cardIndex) => {
        try {
            const updated = await playCard(gameState, cardIndex);
            setGameState(updated);
            if (updated.status === "FINISHED")
                setMessage(`${updated.winner} wins!`);
        } catch (e) {
            setMessage(e.message || "Invalid move."); // ← just shows message, gameState untouched
        }
    };

    const handleDraw = async () => {
        const updated = await drawCard(gameState);
        setGameState(updated);
    }

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
            <section className='row-start-2 col-start-2 flex flex-row justify-center items-center gap-6'>
                {message && (
                    <p className='text-white text-lg font-bold'>{message}</p>
                )}
                <p className='text-white text-sm'>
                    Current Suit: {gameState.currentSuit}
                </p>
                <div className='flex flex-row justify-center items-center gap-6'>
                    {/* Draw pile */}
                    <button onClick={handleDraw} className='cursor-pointer hover:scale-105 transition-transform'>
                        <img src={getCardBack()} className='w-35 h-50' />
                    </button>
                    {/* Discard pile */}
                    <img
                        src={getCardImage(topCard.rank, topCard.suit)}
                        className='w-35 h-50'
                    />
                </div>
                {gameState.status === "FINISHED" && (
                    <button
                        onClick={handleNewGame}
                        className='mt-4 px-6 py-2 bg-white text-black rounded font-bold hover:bg-gray-200'
                    >
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
                        onClick={() => handleCardPlay(i)}
                        className='transition-transform duration-150 hover:-translate-y-4 focus:outline-none cursor-pointer'
                    >
                        <img
                            src={getCardImage(card.rank, card.suit)}
                            className='w-35 h-50'
                        />
                    </button>
                ))}
            </section>

        </div>
    )
}