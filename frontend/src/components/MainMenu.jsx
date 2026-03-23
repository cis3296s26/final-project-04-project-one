import setting_gear from '../assets/setting_gear.png'
import placeholder_pfp from '../assets/placeholder_pfp.png'

export default function MainMenu() {
    return (
        <div className=''>
            <div className='mx-50'>
                <section className='columns-3 m-2'>
                    <button className="w-full h-90 bg-white rounded-2xl text-black text-3xl font-bold hover:bg-gray-500 transition-all">
                        Crazy Eights
                    </button>
                    <button className="w-full h-90 bg-white rounded-2xl text-black text-3xl font-bold hover:bg-gray-500 transition-all">
                        Uno
                    </button>
                    <button className="w-full h-90 bg-white rounded-2xl text-black text-3xl font-bold hover:bg-gray-500 transition-all">
                        Stacking
                    </button>
                </section>
                <section className='flex justify-between'>
                    <button className='w-60 h-20 bg-white flex justify-between'>
                        <img src={placeholder_pfp} className='h-20 w-20 rounded-full object-cover'></img>
                        <span className='text-2xl font-semibold'>John Doe</span>
                        <span>level</span>
                    </button>
                    <button className='w-30 h-30'>
                        <img src={setting_gear}></img>
                    </button>
                </section>
            </div>
        </div>
    )
}