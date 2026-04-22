import "./App.css";
import { useState } from "react";
import MainMenu from "./components/MainMenu";
import ModeSelect from "./components/ModeSelect";
import CrazyEights from "./components/CrazyEights";
import Lobby from "./components/Lobby";
import { Routes, Route, useNavigate } from "react-router-dom";

function LobbyPage() {
  const [gameData, setGameData] = useState(null);

  if (gameData) {
    return (
      <CrazyEights
        initialState={gameData.gameState}
        playerInfo={gameData.playerInfo}
        stompClient={gameData.stompClient}
      />
    );
  }

  return (
    <Lobby
      onGameStart={(gameState, playerInfo, stompClient) =>
        setGameData({ gameState, playerInfo, stompClient })
      }
    />
  );
}

export default function App() {
  return (
    <div className="min-h-screen min-w-full bg-radial from-green-500 to-green-700">
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/mode-select" element={<ModeSelect />} />
        <Route path="/crazy-eights" element={<CrazyEights />} />
        <Route path="/lobby" element={<LobbyPage />} />
      </Routes>
    </div>
  );
}
