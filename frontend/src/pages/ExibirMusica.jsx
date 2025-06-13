import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import homeIcon from "../assets/home.svg";
import playIcon from "../assets/play.svg";
import pauseIcon from "../assets/pause.svg";
import backward from "../assets/backward.svg";
import forward from "../assets/forward.svg";

function ExibirMusica() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialBirthYear = location.state?.birthYear || 1990;

  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [currentYear, setCurrentYear] = useState(initialBirthYear);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(180);
  const [songData, setSongData] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => { 
    const fetchToken = async () => {
    // Tenta recuperar do localStorage
    const localToken = localStorage.getItem("access_token");
    if (localToken) return localToken;

    // Se não tiver, tenta buscar do servidor
    try {
      const res = await fetch("https://divebackintime.onrender.com/api/token", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao buscar token");
      const data = await res.json();
      if (!data.access_token) throw new Error("Token inválido");
    
      // Salva no localStorage para evitar nova requisição
      localStorage.setItem("access_token", data.access_token);

      return data.access_token;
    } catch (error) {
      console.error("Erro ao buscar token:", error);
      navigate("/");
      return null;
    }
  };


    const sendDeviceIdToBackend = async (device_id) => {
      try {
        const res = await fetch("https://divebackintime.onrender.com/api/device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ device_id }),
        });
        if (!res.ok) throw new Error("Falha ao enviar device ID");
      } catch {
        navigate("/");
      }
    };

    const loadSpotifyPlayer = async () => {
      const token = await fetchToken();
      if (!token) return;

      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new window.Spotify.Player({
          name: "Dive Back Player",
          getOAuthToken: (cb) => cb(token),
          volume: 0.5,
        });

        setPlayer(spotifyPlayer);

        spotifyPlayer.addListener("ready", async ({ device_id }) => {
          setDeviceId(device_id);
          await sendDeviceIdToBackend(device_id);
        });

        spotifyPlayer.addListener("not_ready", ({ device_id }) => {
          // Pode logar ou tratar se necessário
        });

        spotifyPlayer.addListener("authentication_error", () => {
          navigate("/");
        });

        spotifyPlayer.addListener("account_error", () => {
          // Pode tratar se quiser
        });

        spotifyPlayer.connect();
      };
    };

    loadSpotifyPlayer();

    return () => {
      if (player) player.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    if (!deviceId) return;

    const fetchSong = async () => {
      try {
        const res = await fetch(
          `https://divebackintime.onrender.com/api/year?year=${currentYear}`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok) throw new Error("Erro ao buscar música");
        const data = await res.json();
        setSongData(data);
        setDuration(Math.floor(data.track_duration / 1000));
        setProgress(0);
      } catch {
        setSongData(null);
        setDuration(180);
        setProgress(0);
        setIsPlaying(false);
      }
    };

    fetchSong();
  }, [currentYear, deviceId]);

  useEffect(() => {
    if (isPlaying && songData) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= duration) {
            clearInterval(intervalRef.current);
            setCurrentYear((y) => y + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, duration, songData]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const IrParaCriar = () => navigate("/criar");

  const postToBackend = async (endpoint) => {
    if (!deviceId) return false;
    try {
      const res = await fetch(`https://divebackintime.onrender.com/api/${endpoint}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) return false;
      return true;
    } catch {
      return false;
    }
  };

  const handlePlayPause = async () => {
    if (!songData) return;
    const success = await postToBackend(isPlaying ? "pause" : "play");
    if (success) setIsPlaying((v) => !v);
  };

  const goToPreviousYear = async () => {
    if (currentYear <= 1946) return;
    const success = await postToBackend("previous");
    if (success) {
      setCurrentYear((y) => y - 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const goToNextYear = async () => {
    const success = await postToBackend("next");
    if (success) {
      setCurrentYear((y) => y + 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#4B1D7E] text-white flex flex-col items-center justify-center px-4 text-center font-body relative">
      <div className="absolute top-6 right-6">
        <button
          onClick={() => navigate("/")}
          className="bg-[#FFD400] text-black font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:opacity-90"
        >
          HOME <img src={homeIcon} alt="Home" className="h-5 w-5" />
        </button>
      </div>

      <div className="text-5xl font-bold mb-6">{currentYear}</div>

      <div className="w-48 h-48 mb-6">
        {songData ? (
          <img
            src={songData.song_img}
            alt="Capa da música"
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
            <p className="text-sm text-gray-400">Carregando música...</p>
          </div>
        )}
      </div>

      <div className="text-xl font-semibold">{songData?.song_name || "N/A"}</div>
      <div className="text-md text-gray-200 mb-4">{songData?.artist_name || "N/A"}</div>

      <div className="w-64 mb-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="w-full h-2 bg-gray-600 rounded-full mt-1 mb-4">
          <div
            className="h-2 bg-[#FFD400] rounded-full"
            style={{ width: `${(progress / duration) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-6 mb-6 items-center">
        <button onClick={goToPreviousYear} disabled={currentYear <= 1946}>
          <img src={backward} alt="Voltar" className="h-6 w-6 fill-white" />
        </button>
        <button onClick={handlePlayPause} disabled={!songData}>
          <img
            src={isPlaying ? pauseIcon : playIcon}
            alt="Play/Pause"
            className="h-10 w-10 fill-white"
          />
        </button>
        <button onClick={goToNextYear}>
          <img src={forward} alt="Avançar" className="h-6 w-6 fill-white" />
        </button>
      </div>

      <button
        onClick={IrParaCriar}
        className="bg-[#FFD400] text-black font-bold font-body px-6 py-2 rounded-full hover:opacity-90 transition"
      >
        Ir para sua viagem no tempo
      </button>

      {!deviceId && (
        <p className="text-yellow-300 mt-4">Carregando player do Spotify...</p>
      )}
      {deviceId && (
        <p className="text-green-400 mt-4">Player carregado e conectado!</p>
      )}
    </div>
  );
}

export default ExibirMusica;
