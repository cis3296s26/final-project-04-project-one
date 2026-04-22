import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { createRoom, joinRoom, startGame } from '../api/gameApi';
import back from '../assets/back.svg';
import people from '../assets/people.svg';
import cardDraw from '../assets/card-draw.svg';
import cardHand from '../assets/card-hand.svg';
import timer from '../assets/timer.svg';
import arrow from '../assets/arrow.svg';

const BACKEND_WS_URL = 'http://localhost:8080';

export default function ModeSelect() {
  const navigate = useNavigate();

  // Lobby state
  const [screen, setScreen] = useState('menu'); // 'menu' | 'hosting' | 'joining'
  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [playerIndex, setPlayerIndex] = useState(0);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const stompRef = useRef(null);

  const goToHome = () => navigate('/');
  const goToCrazyEights = () => navigate('/crazy-eights');

  // Connect WebSocket and subscribe to lobby topic
  function connectLobby(code, pid, pIndex) {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_WS_URL}/ws`),
      reconnectDelay: 0,
      onConnect: () => {
        client.subscribe(`/topic/lobby/${code}`, (message) => {
          const data = JSON.parse(message.body);
          // Server broadcasts { gameId } when host calls startGame
          if (data.gameId) {
            client.deactivate();
            navigate('/crazy-eights', {
              state: { gameId: data.gameId, playerId: pid, playerIndex: pIndex, multiplayer: true }
            });
          }
        });
      },
      onStompError: (frame) => {
        setError('WebSocket error: ' + frame.headers?.message);
      },
    });
    client.activate();
    stompRef.current = client;
  }

  // Host a new private room
  async function handleCreateRoom() {
    setLoading(true);
    setError('');
    try {
      const data = await createRoom('Player');
      // data = { roomCode, playerId, playerIndex: 0 }
      setRoomCode(data.roomCode);
      setPlayerId(data.playerId);
      setPlayerIndex(data.playerIndex);
      setIsCreator(true);
      setScreen('hosting');
      connectLobby(data.roomCode, data.playerId, data.playerIndex);
    } catch (err) {
      setError('Failed to create room. Try again.');
    } finally {
      setLoading(false);
    }
  }

  // Join an existing room by code
  async function handleJoinRoom() {
    if (!joinInput.trim()) { setError('Enter a room code.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await joinRoom(joinInput.trim().toUpperCase(), 'Player');
      // data = { roomCode, playerId, playerIndex }
      setRoomCode(data.roomCode);
      setPlayerId(data.playerId);
      setPlayerIndex(data.playerIndex);
      setIsCreator(false);
      setScreen('joining');
      connectLobby(data.roomCode, data.playerId, data.playerIndex);
    } catch (err) {
      setError('Could not join. Check the room code and try again.');
    } finally {
      setLoading(false);
    }
  }

  // Host starts the game
  async function handleStartGame() {
    setLoading(true);
    setError('');
    try {
      await startGame(roomCode);
      // Server will broadcast gameId over WebSocket — navigation happens in connectLobby callback
    } catch (err) {
      setError('Failed to start game.');
      setLoading(false);
    }
  }

  // Leave lobby
  function handleLeave() {
    if (stompRef.current) stompRef.current.deactivate();
    setScreen('menu');
    setRoomCode('');
    setJoinInput('');
    setError('');
  }

  // ─── HOSTING LOBBY SCREEN ────────────────────────────────────────────────
  if (screen === 'hosting') {
    return (
      <div className='flex flex-col min-h-screen items-center justify-center gap-6 bg-gray-100'>
        <h2 className='text-2xl font-bold'>Private Room Created</h2>
        <div className='bg-white rounded-2xl p-8 shadow-md flex flex-col items-center gap-4'>
          <p className='text-gray-500'>Share this code with your friend:</p>
          <span className='text-5xl font-mono font-bold tracking-widest'>{roomCode}</span>
          <p className='text-gray-400 text-sm'>Waiting for players to join…</p>
        </div>
        {error && <p className='text-red-500'>{error}</p>}
        <button
          onClick={handleStartGame}
          disabled={loading}
          className='bg-green-500 text-white px-8 py-3 rounded-2xl text-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50'
        >
          {loading ? 'Starting…' : 'Start Game'}
        </button>
        <button onClick={handleLeave} className='text-gray-400 underline text-sm'>Leave</button>
      </div>
    );
  }

  // ─── JOINING / WAITING SCREEN ─────────────────────────────────────────────
  if (screen === 'joining') {
    return (
      <div className='flex flex-col min-h-screen items-center justify-center gap-6 bg-gray-100'>
        <h2 className='text-2xl font-bold'>Joined Room {roomCode}</h2>
        <div className='bg-white rounded-2xl p-8 shadow-md flex flex-col items-center gap-4'>
          <p className='text-gray-500'>You are Player {playerIndex + 1}</p>
          <p className='text-gray-400 animate-pulse'>Waiting for host to start the game…</p>
        </div>
        <button onClick={handleLeave} className='text-gray-400 underline text-sm'>Leave</button>
      </div>
    );
  }

  // ─── MAIN MENU SCREEN ────────────────────────────────────────────────────
  return (
    <div className='flex flex-col min-h-screen'>
      <section className='flex-grow'>
        <section>
          <button onClick={goToHome} className=''>
            <img src={back} className='m-5 w-12 h-12 cursor-pointer hover:scale-125 transition-all' />
          </button>
        </section>
        <section className='grid grid-rows-4 justify-center gap-2'>
          <button
            onClick={goToCrazyEights}
            className='bg-white w-full h-20 rounded-2xl hover:bg-gray-500 transition-all'
          >
            vs. Bots
          </button>
          <button className='bg-white w-full h-20 rounded-2xl hover:bg-gray-500 transition-all'>
            Public
          </button>
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className='bg-white w-full h-20 rounded-2xl hover:bg-gray-500 transition-all disabled:opacity-50'
          >
            {loading ? 'Creating…' : 'Private'}
          </button>
          <div className='flex w-full h-20 gap-2'>
            <input
              type='text'
              placeholder='Room Code'
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
              maxLength={4}
              className='flex-1 rounded-2xl border-2 border-gray-300 px-4 text-xl font-mono tracking-widest text-center focus:outline-none focus:border-gray-500 transition-all'
            />
            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className='bg-white rounded-2xl px-6 hover:bg-gray-500 transition-all disabled:opacity-50'
            >
              {loading ? '…' : 'join'}
            </button>
          </div>
          {error && <p className='text-red-500 text-sm text-center'>{error}</p>}
        </section>
      </section>

      {/* Game settings bar */}
      <section className='grid grid-cols-4 mt-auto p-5 bg-gray-300'>
        <div className='flex flex-row items-center gap-5'>
          <img src={people} className='w-16 h-16' />
          <span className='text-3xl font-bold'>5</span>
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
            <button className='w-7 h-7 flex items-center justify-center cursor-pointer'>
              <img src={arrow} className='w-7 h-7 hover:scale-150 transition-all' />
            </button>
            <button className='w-7 h-7 flex items-center justify-center cursor-pointer'>
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
  );
}
