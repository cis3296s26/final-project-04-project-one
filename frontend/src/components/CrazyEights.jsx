import cardBack from '../assets/cards/card_back.png';

export default function CrazyEights() {
    return (
        <div>
            <section className='flex flex-col items-start -space-y-60'>
                <img src={cardBack} className='w-35 h-50 rotate-90'>
                </img>
                <img src={cardBack} className='w-35 h-50 rotate-90'>
                </img>
                <img src={cardBack} className='w-35 h-50 rotate-90'>
                </img>
            </section>
        </div>
    )
}