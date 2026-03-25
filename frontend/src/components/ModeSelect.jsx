import back from '../assets/back.svg'
import people from '../assets/people.svg'
import cardDraw from '../assets/card-draw.svg'
import cardHand from '../assets/card-hand.svg'
import timer from '../assets/timer.svg'
import arrow from '../assets/arrow.svg'
import { useNavigate } from 'react-router-dom';

export default function ModeSelect() {
    const navigate = useNavigate();
    const goToHome = () => {
        navigate('/');
    }

    return (
        <div className='flex flex-col min-h-screen'>
            <section className='flex-grow'>
                <section>
                    <button onClick={goToHome} className=''>
                        <img src={back} className='m-5 w-12 h-12 cursor-pointer hover:scale-125 transition-all'></img>
                    </button>
                </section>
                <section className='grid grid-rows-4 justify-center gap-2'>
                    <button className='bg-white w-full h-20 rounded-2xl hover:bg-gray-500 transition-all'>
                        vs. Bots
                    </button>
                    <button className='bg-white w-full h-20 rounded-2xl hover:bg-gray-500 transition-all'>
                        Public
                    </button>
                    <button className='bg-white w-full h-20 rounded-2xl hover:bg-gray-500 transition-all'>
                        Private
                    </button>
                    <div className='w-full h-20'>
                        <input type='text' placeholder='Room Code'/>
                        <button className='bg-white hover:bg-gray-500 transition-all'>join</button>
                    </div>
                </section>
            </section>
            <section className='grid grid-cols-4 mt-auto p-5 bg-gray-300'>
                <div className='flex flex-row items-center gap-5'>
                    <img src={people} className='w-16 h-16' />
                    <span className='text-3xl font-bold'>5</span>
                    <div className='flex flex-col gap-2'>
                        <button className='w-7 h-7 flex items-center justify-center cursor-pointer'>
                            <img src={arrow} className='w-7 h-7 hover:scale-150 transition-all'/>
                        </button>
                        <button className='w-7 h-7 flex items-center justify-center cursor-pointer'>
                            <img src={arrow} className='w-7 h-7 hover:scale-150 transition-all rotate-180' />
                        </button>
                    </div>
                </div>
                <div className='flex flex-row items-center gap-5'>
                    <img src={cardDraw} className='w-16 h-16' />
                    <span className='text-3xl font-bold'>3</span>
                    <div className='flex flex-col gap-2'>
                        <button className='w-7 h-7 flex items-center justify-center cursor-pointer'>
                            <img src={arrow} className='w-7 h-7 hover:scale-150 transition-all' />
                        </button>
                        <button className='w-7 h-7 flex items-center justify-center cursor-pointer'>
                            <img src={arrow} className='w-7 h-7 hover:scale-150 transition-all rotate-180' />
                        </button>
                    </div>
                </div>
                <div className='flex flex-row items-center gap-5'>
                    <img src={cardHand} className='w-16 h-16' />
                    <span className='text-3xl font-bold'>7</span>
                    <div className='flex flex-col gap-2'>
                        <button className='w-7 h-7 flex items-center justify-center cursor-pointer '>
                            <img src={arrow} className='w-7 h-7 hover:scale-150 transition-all' />
                        </button>
                        <button className='w-7 h-7 flex items-center justify-center cursor-pointer '>
                            <img src={arrow} className='w-7 h-7 hover:scale-150 transition-all rotate-180' />
                        </button>
                    </div>
                </div>
                <div className='flex flex-row items-center gap-5'>
                    <img src={timer} className='w-16 h-16' />
                    <span className='text-3xl font-bold'>30</span>
                    <div className='flex flex-col gap-2'>
                        <button className='w-7 h-7 flex items-center justify-center cursor-pointer'>
                            <img src={arrow} className='w-7 h-7 hover:scale-150 transition-all' />
                        </button>
                        <button className='w-7 h-7 flex items-center justify-center cursor-pointer'>
                            <img src={arrow} className='w-7 h-7 hover:scale-150 transition-all rotate-180' />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}