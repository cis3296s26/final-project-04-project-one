import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom, startGame } from "../api/gameApi";
import back from "../assets/back.svg";
import people from "../assets/people.svg";
import cardDraw from "../assets/card-draw.svg";
import cardHand from "../assets/card-hand.svg";
import timer from "../assets/timer.svg";
import arrow from "../assets/arrow.svg";

export default function ModeSelect() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(
    "Player" + Math.floor(Math.random() * 1000),
  );
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(""); // 'bots' | 'private' | 'join' | ''

  // vs. Bots: create room, immediately start (CPUs fill remaining slots), go straight to game
  const handleVsBots = async () => {
    setError("");
    setLoading("bots");
    try {
      const playerInfo = await createRoom(displayName); // { roomCode, playerId, playerIndex: 0 }
      const { gameId } = await startGame(playerInfo.roomCode); // fills slots 1-3 with CPU
      navigate("/crazy-eights", { state: { playerInfo, gameId } });
    } catch (e) {
      setError("Failed to start game. Is the server running?");
    } finally {
      setLoading("");
    }
  };

  // Private: create room, go to waiting room so host can share the code
  const handleCreatePrivate = async () => {
    setError("");
    setLoading("private");
    try {
      const playerInfo = await createRoom(displayName);
      navigate("/waiting-room", { state: { playerInfo } });
    } catch (e) {
      setError("Failed to create room. Is the server running?");
    } finally {
      setLoading("");
    }
  };

  // Join: join existing room by code, go to waiting room
  const handleJoin = async () => {
    if (!roomCodeInput.trim()) {
      setError("Enter a room code.");
      return;
    }
    setError("");
    setLoading("join");
    try {
      const playerInfo = await joinRoom(
        roomCodeInput.trim().toUpperCase(),
        displayName,
      );
      navigate("/waiting-room", { state: { playerInfo } });
    } catch (e) {
      setError("Room not found or already full.");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-grow">
        {/* Back button */}
        <button onClick={() => navigate("/")}>
          <img
            src={back}
            className="m-5 w-12 h-12 cursor-pointer hover:scale-125 transition-all"
          />
        </button>

        {/* Display name — shared across all modes */}
        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="Your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="p-2 rounded-xl border border-gray-400 bg-white text-black w-72 text-center"
          />
        </div>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <section className="grid grid-rows-4 justify-center gap-2">
          {/* vs. Bots */}
          <button
            onClick={handleVsBots}
            disabled={!!loading}
            className="bg-white w-72 h-20 rounded-2xl hover:bg-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {loading === "bots" ? "Starting..." : "vs. Bots"}
          </button>

          {/* Public — not yet supported */}
          <button
            disabled
            className="bg-white w-72 h-20 rounded-2xl opacity-40 cursor-not-allowed font-semibold text-lg"
            title="Public matchmaking coming soon"
          >
            Public (Coming Soon)
          </button>

          {/* Private Room */}
          <button
            onClick={handleCreatePrivate}
            disabled={!!loading}
            className="bg-white w-72 h-20 rounded-2xl hover:bg-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {loading === "private" ? "Creating Room..." : "Private Room"}
          </button>

          {/* Join by room code */}
          <div className="flex gap-2 w-72 h-20 items-center">
            <input
              type="text"
              placeholder="Room Code"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              maxLength={4}
              className="p-2 rounded-xl border border-gray-400 bg-white text-black flex-grow h-12 text-center tracking-widest font-bold"
            />
            <button
              onClick={handleJoin}
              disabled={!!loading}
              className="bg-white h-12 px-4 rounded-xl hover:bg-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading === "join" ? "..." : "Join"}
            </button>
          </div>
        </section>
      </section>

      {/* Settings bar — cosmetic, not yet wired to backend */}
      <section className="grid grid-cols-4 mt-auto p-5 bg-gray-300">
        <div className="flex flex-row items-center gap-5">
          <img src={people} className="w-16 h-16" />
          <span className="text-3xl font-bold">4</span>
          <div className="flex flex-col gap-2">
            <button className="w-7 h-7 flex items-center justify-center cursor-not-allowed opacity-40">
              <img src={arrow} className="w-7 h-7" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center cursor-not-allowed opacity-40">
              <img src={arrow} className="w-7 h-7 rotate-180" />
            </button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-5">
          <img src={cardDraw} className="w-16 h-16" />
          <span className="text-3xl font-bold">3</span>
          <div className="flex flex-col gap-2">
            <button className="w-7 h-7 flex items-center justify-center cursor-not-allowed opacity-40">
              <img src={arrow} className="w-7 h-7" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center cursor-not-allowed opacity-40">
              <img src={arrow} className="w-7 h-7 rotate-180" />
            </button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-5">
          <img src={cardHand} className="w-16 h-16" />
          <span className="text-3xl font-bold">7</span>
          <div className="flex flex-col gap-2">
            <button className="w-7 h-7 flex items-center justify-center cursor-not-allowed opacity-40">
              <img src={arrow} className="w-7 h-7" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center cursor-not-allowed opacity-40">
              <img src={arrow} className="w-7 h-7 rotate-180" />
            </button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-5">
          <img src={timer} className="w-16 h-16" />
          <span className="text-3xl font-bold">30</span>
          <div className="flex flex-col gap-2">
            <button className="w-7 h-7 flex items-center justify-center cursor-not-allowed opacity-40">
              <img src={arrow} className="w-7 h-7" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center cursor-not-allowed opacity-40">
              <img src={arrow} className="w-7 h-7 rotate-180" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
