import { useNavigate } from 'react-router-dom';
import setting_gear from '../assets/setting_gear.png'
import placeholder_pfp from '../assets/placeholder_pfp.png'

export default function MainMenu() {
    const navigate = useNavigate();
    const goToModeSelect = () => {
        navigate('/mode-select');
    }
    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='mx-12 my-12 w-full max-w-4xl'>
                <section className='grid grid-cols-3 gap-2 mb-4'>
                    <button onClick={goToModeSelect} className="w-full h-90 bg-white rounded-2xl text-black text-3xl font-bold hover:bg-gray-500 transition-all">
                        Crazy Eights
                    </button>
                    <button onClick={goToModeSelect} className="w-full h-90 bg-white rounded-2xl text-black text-3xl font-bold hover:bg-gray-500 transition-all">
                        Uno
                    </button>
                    <button onClick={goToModeSelect} className="w-full h-90 bg-white rounded-2xl text-black text-3xl font-bold hover:bg-gray-500 transition-all">
                        Stacking
                    </button>
                </section>
                <section className='flex justify-between items-center'>
                    <div className='flex items-center gap-3'>
                        <button className='shrink-0 cursor-pointer'>
                            <img src={placeholder_pfp} className='h-16 w-16 rounded-full object-cover'/>
                        </button>
                        <div className='flex flex-col gap-1'>
                            <div className='flex items-center gap-2'>
                                <button className='text-2xl font-bold hover:underline cursor-pointer'>
                                    John Doe
                                </button>
                                <span className='text-xl'>6🔥</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm font-semibold whitespace-nowrap'>lv 10</span>
                                <div className='w-40 h-3 bg-black rounded-full overflow-hidden'>
                                    <div
                                        className='h-full bg-green-400 rounded-full'
                                        style={{ width: '65%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className='w-12 h-12 cursor-pointer'>
                        <img src={setting_gear} className='w-full h-full object-contain'/>
                    </button>
                </section>
            </div>
        </div>
    )
}