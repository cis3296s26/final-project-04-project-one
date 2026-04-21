import "./App.css";
import MainMenu from "./components/MainMenu";
import ModeSelect from "./components/ModeSelect";
import WaitingRoom from "./components/WaitingRoom";
import CrazyEights from "./components/CrazyEights";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen min-w-full bg-radial from-green-500 to-green-700">
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/mode-select" element={<ModeSelect />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
        <Route path="/crazy-eights" element={<CrazyEights />} />
      </Routes>
    </div>
  );
}
