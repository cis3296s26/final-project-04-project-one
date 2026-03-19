import { useState } from 'react'
import './App.css'
import MainMenu from './components/MainMenu'

export default function App() {
  const [screen] = useState('menu')

  if (screen === 'menu') return <MainMenu />
}


