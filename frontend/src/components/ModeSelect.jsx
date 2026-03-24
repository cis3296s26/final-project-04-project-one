import back from '../assets/back.svg'
import { useNavigate } from 'react-router-dom';

export default function ModeSelect() {
    const navigate = useNavigate();
    const goToHome = () => {
        navigate('/');
    }

    return (
        <div>
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
        </div>
    )
}