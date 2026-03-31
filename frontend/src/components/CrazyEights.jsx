import cardBack from '../assets/cards/card_back.png';
import twoClubs from '../assets/cards/2_of_clubs.svg';
import queenClubs from '../assets/cards/queen_of_clubs2.svg';
import eightDiamonds from '../assets/cards/8_of_diamonds.svg';
import threeHearts from '../assets/cards/3_of_hearts.svg';

export default function CrazyEights() {
    const handleCardPlay = (card) => {
        console.log(`Played: ${card}`);
        // game logic here
    };

    return (
        <div className='grid h-screen w-screen grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto]'>
            {/* top hand */}
            <section className='col-start-1 col-end-4 flex flex-row justify-center items-start pt-2 -space-x-16'>
                <img src={cardBack} className='w-35 h-50 rotate-180' />
                <img src={cardBack} className='w-35 h-50 rotate-180' />
                <img src={cardBack} className='w-35 h-50 rotate-180' />
            </section>
            {/* left hand */}
            <section className='row-start-2 flex flex-col justify-center items-center pl-2 -space-y-60'>
                <img src={cardBack} className='w-35 h-50 rotate-90' />
                <img src={cardBack} className='w-35 h-50 rotate-90' />
                <img src={cardBack} className='w-35 h-50 rotate-90' />
            </section>
            {/* middle cards */}
            <section className='row-start-2 col-start-2 flex flex-row justify-center items-center gap-6'>
                <img src={cardBack} className='w-35 h-50 cursor-pointer' />
                <img src={twoClubs} className='w-35 h-50' />
            </section>
            {/* right hand */}
            <section className='row-start-2 col-start-3 flex flex-col justify-center items-center pr-2 -space-y-60'>
                <img src={cardBack} className='w-35 h-50 -rotate-270' />
                <img src={cardBack} className='w-35 h-50 -rotate-270' />
                <img src={cardBack} className='w-35 h-50 -rotate-270' />
            </section>

            {/* player hand */}
            <section className='col-start-1 col-end-4 flex flex-row justify-center items-end pb-2 -space-x-16'>
                {[
                    { src: queenClubs, name: 'Queen of Clubs' },
                    { src: eightDiamonds, name: 'Eight of Diamonds' },
                    { src: threeHearts, name: 'Three of Hearts' },
                ].map((card) => (
                    <button
                        key={card.name}
                        onClick={() => handleCardPlay(card.name)}
                        className='transition-transform duration-150 hover:-translate-y-4 focus:outline-none cursor-pointer'
                    >
                        <img src={card.src} className='w-35 h-50' />
                    </button>
                ))}
            </section>

        </div>
    )
}