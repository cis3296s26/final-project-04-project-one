import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { createRoom, joinRoom, startGame } from '../api/gameApi';
import { getCardImage, getCardBack } from '../utils/cardImages';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BACKEND_WS_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const BACKEND_API_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api`;

export default function CrazyEights() {
  const location = useLocation();

  const [gameState, setGameState] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [actionPending, setActionPending] = useState(false);
  const [message, setMessage] = useState('');
  const [displayName, setDisplayName] = useState('Player ' + Math.floor(Math.random() * 1000));
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const stompClient = useRef(null);

  useEffect(() => {
    const state = location.state;

    if (state?.multiplayer && state?.gameId) {
      const info = {
        playerId: state.playerId,
        playerIndex: state.playerIndex,
        roomCode: state.roomCode || ''
      };

      setPlayerInfo(info);
      connectToGameDirect(state.gameId);
    }

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  const connectToGameDirect = (gameId) => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_WS_URL}/ws`),
      reconnectDelay: 0,

      onConnect: () => {
        client.subscribe(`/topic/game/${gameId}`, (msg) => {
          const newState = JSON.parse(msg.body);

          setGameState(newState);
          setActionPending(false);

          if (newState.status === 'FINISHED') {
            setMessage(`${newState.winner} wins!`);
          } else {
            setMessage('');
          }
        });

        fetch(`${BACKEND_API_URL}/game/${gameId}`)
          .then(res => res.json())
          .then(state => {
            setGameState(state);
            setActionPending(false);

            if (state.status === 'FINISHED') {
              setMessage(`${state.winner} wins!`);
            }
          })
          .catch(err => {
            console.error('Failed to fetch initial game state:', err);
            setMessage('Failed to load game state.');
            setActionPending(false);
          });
      },

      onStompError: () => {
        setMessage('Connection issue. Try refreshing or restarting the game.');
        setActionPending(false);
      },

      onWebSocketClose: () => {
        setActionPending(false);
      }
    });

    client.activate();
    stompClient.current = client;
  };

  const connectToLobby = (roomCode) => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_WS_URL}/ws`),
      reconnectDelay: 0,

      onConnect: () => {
        client.subscribe(`/topic/lobby/${roomCode}`, (msg) => {
          const data = JSON.parse(msg.body);

          if (data.gameId) {
            connectToGame(data.gameId, client);
          } else {
            setRoom(data);
          }
        });
      },

      onStompError: () => {
        setMessage('Connection issue. Try refreshing or restarting the game.');
        setActionPending(false);
      },

      onWebSocketClose: () => {
        setActionPending(false);
      }
    });

    client.activate();
    stompClient.current = client;
  };

  const connectToGame = (gameId, client) => {
    const c = client || stompClient.current;

    if (!c) {
      setMessage('Connection issue. Try refreshing or restarting the game.');
      return;
    }

    c.subscribe(`/topic/game/${gameId}`, (msg) => {
      const newState = JSON.parse(msg.body);

      setGameState(newState);
      setActionPending(false);

      if (newState.status === 'FINISHED') {
        setMessage(`${newState.winner} wins!`);
      } else {
        setMessage('');
      }
    });

    fetch(`${BACKEND_API_URL}/game/${gameId}`)
      .then(res => res.json())
      .then(state => {
        setGameState(state);
        setActionPending(false);

        if (state.status === 'FINISHED') {
          setMessage(`${state.winner} wins!`);
        }
      })
      .catch(err => {
        console.error('Failed to fetch initial game state:', err);
        setMessage('Failed to load game state.');
        setActionPending(false);
      });
  };

  const handleCreateRoom = async () => {
    try {
      setMessage('');

      const data = await createRoom(displayName);

      setPlayerInfo(data);
      connectToLobby(data.roomCode);
    } catch (e) {
      setMessage('Failed to create room.');
    }
  };

  const handleJoinRoom = async () => {
    try {
      setMessage('');

      const data = await joinRoom(roomCodeInput, displayName);

      setPlayerInfo(data);
      connectToLobby(data.roomCode);
    } catch (e) {
      setMessage('Room not found or full.');
    }
  };

  const handleStartGame = async () => {
    try {
      setMessage('');
      await startGame(playerInfo.roomCode);
    } catch (e) {
      setMessage('Need at least 2 players to start.');
    }
  };

  const handleCardPlay = (cardIndex) => {
    if (actionPending) return;

    if (!gameState || !playerInfo) {
      setMessage('Game is not ready yet.');
      return;
    }

    if (!stompClient.current || !stompClient.current.connected) {
      setMessage('Connection issue. Try refreshing or restarting the game.');
      return;
    }

    if (gameState.currentPlayer !== playerInfo.playerIndex) {
      setMessage('It is not your turn.');
      return;
    }

    if (gameState.status === 'FINISHED') {
      return;
    }

    setActionPending(true);
    setMessage('');

    stompClient.current.publish({
      destination: `/app/game/${gameState.gameId}/play`,
      body: JSON.stringify({
        playerIndex: playerInfo.playerIndex,
        cardIndex,
        chosenSuit: null
      })
    });
  };

  const handleDraw = () => {
    if (actionPending) return;

    if (!gameState || !playerInfo) {
      setMessage('Game is not ready yet.');
      return;
    }

    if (!stompClient.current || !stompClient.current.connected) {
      setMessage('Connection issue. Try refreshing or restarting the game.');
      return;
    }

    if (gameState.currentPlayer !== playerInfo.playerIndex) {
      setMessage('It is not your turn.');
      return;
    }

    if (gameState.status === 'FINISHED') {
      return;
    }

    setActionPending(true);
    setMessage('');

    stompClient.current.publish({
      destination: `/app/game/${gameState.gameId}/draw`,
      body: JSON.stringify({
        playerIndex: playerInfo.playerIndex
      })
    });
  };

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white gap-6">
        <h1 className="text-4xl font-bold">Crazy Eights Lobby</h1>

        {!playerInfo ? (
          <div className="bg-gray-800 p-8 rounded-xl flex flex-col gap-4 w-96">
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={handleCreateRoom}
              className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-500 transition-colors"
            >
              Create Private Room
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Room Code"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="p-2 rounded bg-gray-700 border border-gray-600 flex-grow"
              />

              <button
                onClick={handleJoinRoom}
                className="bg-green-600 p-2 rounded font-bold hover:bg-green-500"
              >
                Join
              </button>
            </div>

            {message && <p className="text-red-400 text-center">{message}</p>}
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded-xl flex flex-col gap-4 w-96 text-center">
            <h2 className="text-2xl font-bold">Room: {playerInfo.roomCode}</h2>

            <div className="flex flex-col gap-2 my-4">
              {room && room.playerNames.map((name, i) => (
                <div
                  key={i}
                  className={`p-2 rounded ${
                    name === 'CPU'
                      ? 'bg-gray-900 text-gray-600'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {name} {i === playerInfo.playerIndex ? '(You)' : ''}
                </div>
              ))}
            </div>

            {playerInfo.playerIndex === 0 && (
              <button
                onClick={handleStartGame}
                className="bg-orange-600 p-2 rounded font-bold hover:bg-orange-500"
              >
                Start Game
              </button>
            )}

            {message && <p className="text-red-400">{message}</p>}
          </div>
        )}
      </div>
    );
  }

  const myIdx = playerInfo.playerIndex;
  const userHand = gameState.hands[myIdx];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const others = [(myIdx + 1) % 4, (myIdx + 2) % 4, (myIdx + 3) % 4];

  const isMyTurn = gameState.currentPlayer === myIdx;
  const gameFinished = gameState.status === 'FINISHED';
  const controlsDisabled = actionPending || !isMyTurn || gameFinished;

  return (
    <div className="grid h-screen w-screen grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto] bg-green-900 overflow-hidden">
      <section className="col-start-1 col-end-4 flex flex-col justify-center items-center pt-2">
        <p className="text-white font-bold mb-1">
          {gameState.playerNames[others[1]]}
        </p>

        <div className="flex flex-row -space-x-16">
          {gameState.hands[others[1]].map((_, i) => (
            <img
              key={i}
              src={getCardBack()}
              className="w-24 h-36 rotate-180 shadow-lg"
            />
          ))}
        </div>
      </section>

      <section className="row-start-2 flex flex-col justify-center items-center pl-4">
        <p className="text-white font-bold mb-2 rotate-90">
          {gameState.playerNames[others[0]]}
        </p>

        <div className="flex flex-col -space-y-24">
          {gameState.hands[others[0]].map((_, i) => (
            <img
              key={i}
              src={getCardBack()}
              className="w-24 h-36 rotate-90 shadow-lg"
            />
          ))}
        </div>
      </section>

      <section className="row-start-2 col-start-2 flex flex-col justify-center items-center gap-6">
        <div className="text-center">
          {message ? (
            <p className="text-yellow-400 text-3xl font-black drop-shadow-md animate-bounce">
              {message}
            </p>
          ) : (
            <p className="text-white text-xl font-bold bg-black/30 px-4 py-2 rounded-full">
              {actionPending
                ? 'WAITING...'
                : isMyTurn
                  ? 'YOUR TURN'
                  : `${gameState.playerNames[gameState.currentPlayer]}'s Turn`}
            </p>
          )}

          <p className="text-white mt-2 font-medium">
            Suit: {gameState.currentSuit}
          </p>
        </div>

        <div className="flex flex-row justify-center items-center gap-10">
          <button
            onClick={handleDraw}
            disabled={controlsDisabled}
            className="cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src={getCardBack()} className="w-32 h-48 shadow-2xl" />
            <p className="text-white text-xs mt-2">
              {gameState.deck.length} cards left
            </p>
          </button>

          <img
            src={getCardImage(topCard.rank, topCard.suit)}
            className="w-32 h-48 shadow-2xl"
          />
        </div>
      </section>

      <section className="row-start-2 col-start-3 flex flex-col justify-center items-center pr-4">
        <p className="text-white font-bold mb-2 -rotate-90">
          {gameState.playerNames[others[2]]}
        </p>

        <div className="flex flex-col -space-y-24">
          {gameState.hands[others[2]].map((_, i) => (
            <img
              key={i}
              src={getCardBack()}
              className="w-24 h-36 -rotate-90 shadow-lg"
            />
          ))}
        </div>
      </section>

      <section className="col-start-1 col-end-4 flex flex-col justify-center items-center pb-4">
        <div className="flex flex-row justify-center items-end -space-x-12">
          {userHand.map((card, i) => (
            <button
              key={i}
              disabled={controlsDisabled}
              onClick={() => handleCardPlay(i)}
              className="transition-all duration-150 hover:-translate-y-8 hover:z-10 focus:outline-none cursor-pointer disabled:cursor-not-allowed group"
            >
              <img
                src={getCardImage(card.rank, card.suit)}
                className="w-32 h-48 shadow-xl group-disabled:grayscale-[0.5]"
              />
            </button>
          ))}
        </div>

        <p className="text-white font-black mt-4 text-xl tracking-widest">
          {gameState.playerNames[myIdx]} (YOU)
        </p>
      </section>
    </div>
  );
}