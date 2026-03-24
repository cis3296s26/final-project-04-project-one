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
        </div>
    )
}