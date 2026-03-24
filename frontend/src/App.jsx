import './App.css'
import MainMenu from './components/MainMenu'
import ModeSelect from './components/ModeSelect';
import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen min-w-full bg-radial from-green-500 to-green-700 content-center">
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="mode-select" element={<ModeSelect />} />
      </Routes>
    </div>
  )
}


