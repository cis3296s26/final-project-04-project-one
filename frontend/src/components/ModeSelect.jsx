import back from '../assets/back.svg'
import people from '../assets/people.svg'
import cardDraw from '../assets/card-draw.svg'
import cardHand from '../assets/card-hand.svg'
import timer from '../assets/timer.svg'
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
                    <button onClick={goToHome} className=' '>
                        <img src={back} className='m-5 w-16 h-16 cursor-pointer hover:w-20 h-20'></img>
                    </button>
                </section>
                <section className='grid grid-rows-4 justify-center gap-2'>
                    <button className='bg-white w-full h-20'>
                        vs. Bots
                    </button>
                    <button className='bg-white w-full h-20'>
                        Public
                    </button>
                    <button className='bg-white w-full h-20'>
                        Private
                    </button>
                    <div className='w-full h-20'>
                        <input type='text' placeholder='Room Code'/>
                        <button className='bg-white'>join</button>
                    </div>
                </section>
            </section>
            <section className='grid grid-cols-4 mt-auto'>
                <div className='w-16 h-16'>
                    <img src={people}></img>
                </div>
                <div className='w-16 h-16'>
                    <img src={cardDraw}></img>
                </div>
                <div className='w-16 h-16'>
                    <img src={cardHand}></img>
                </div>
                <div className='w-16 h-16'>
                    <img src={timer}></img>
                </div>
            </section>
        </div>
    )
}