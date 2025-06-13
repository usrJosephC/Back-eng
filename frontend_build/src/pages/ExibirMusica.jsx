import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import homeIcon from "../assets/home.svg";
import playIcon from "../assets/play.svg";
import pauseIcon from "../assets/pause.svg";
import backward from "../assets/backward.svg";
import forward from "../assets/forward.svg";

function ExibirMusica() { // birthYear will come from location state
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access location state
  const initialBirthYear = location.state?.birthYear || 1990; // Get birthYear from state, default if not found

  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState('');
  const accessToken = localStorage.getItem('access_token'); // Get token from localStorage

  const [currentYear, setCurrentYear] = useState(initialBirthYear); // Initialize with passed birthYear
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(180);
  const [songData, setSongData] = useState(null);
  const [token, setToken] = useState(null); // Now using accessToken from localStorage
  const intervalRef = useRef(null);

  // --- Spotify SDK Initialization ---
  useEffect(() => {
    if (!accessToken) {
      console.error("Access Token not found. Redirecting to home.");
      navigate('/'); // Redirect if no access token
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Dive Back Player',
        getOAuthToken: cb => { cb(accessToken); },
        volume: 0.5,
      });

      setPlayer(spotifyPlayer); // Set the Spotify player instance

      spotifyPlayer.addListener('ready', async ({ device_id }) => {
        console.log('Device is ready with ID', device_id);
        setDeviceId(device_id);

        // Send the device_id to the backend
        try {
          const res = await fetch('https://divebackintime.onrender.com/api/device', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', 
            body: JSON.stringify({ device_id }),
          });
          if (!res.ok) throw new Error('Failed to send device ID to backend');
          console.log('Device ID enviado com sucesso!');
        } catch (error) {
          console.error('Erro ao enviar device_id:', error);
          // Handle error, e.g., display a message to the user
        }
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message);
        // Redirect to login or show an error
        navigate('/'); 
      });

      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
        // Inform user about premium account requirement
      });

      spotifyPlayer.connect();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken, navigate, player]); // Added player to dependencies for cleanup

  // Set the token from localStorage once available
  useEffect(() => {
    if (accessToken) {
      setToken(accessToken);
    }
  }, [accessToken]);


  // --- MusicPlayer Logic ---
  useEffect(() => {
    if (!token || !deviceId) return; // Wait for token and deviceId
    const fetchSong = async () => {
      try {
        const res = await fetch(
          `https://divebackintime.onrender.com/api/year?year=${currentYear}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar música");
        const data = await res.json();
        setSongData(data);
        setDuration(Math.floor(data.track_duration / 1000));
        setProgress(0);
        // Optionally auto-play new song if it was playing before
        // if (isPlaying) {
        //   player.play(); // Or trigger backend play route
        // }
      } catch (error) {
        console.error("Erro ao buscar música:", error);
        setSongData(null);
        setDuration(180); // Default duration
        setProgress(0);
        setIsPlaying(false);
      }
    };
    fetchSong();
  }, [currentYear, token, deviceId]); 

  useEffect(() => {
    if (isPlaying && songData) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= duration) {
            clearInterval(intervalRef.current);
            setCurrentYear(y => y + 1); // Go to next year automatically
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

  const formatTime = seconds => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const IrParaCriar = () => navigate("/criar");

  const postToBackend = async endpoint => {
    if (!token || !deviceId) {
      console.warn("Token or Device ID not available. Cannot perform action.");
      return false; 
    }
    try {
      const res = await fetch(
        `https://divebackintime.onrender.com/api/${endpoint}`,
        {
          method: "GET", // These endpoints are GET as per your spec
          credentials: "include", 
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro na rota ${endpoint}: ${res.status} ${errorText}`);
      }
      return true;
    } catch (error) {
      console.error(`Erro ao chamar ${endpoint}:`, error);
      // Potentially show a user-friendly error message
      return false;
    }
  };

  const handlePlayPause = async () => {
    if (!songData) {
      console.warn("No song data to play/pause.");
      return;
    }
    const success = await postToBackend(isPlaying ? "pause" : "play");
    if (success) {
      setIsPlaying(v => !v);
    }
  };

  const goToPreviousYear = async () => {
    if (currentYear <= 1946) { // Adjusted min year to 1946 based on SelecionarAno
      console.warn("Cannot go to previous year, already at the minimum.");
      return;
    }
    const success = await postToBackend("previous");
    if (success) {
      setCurrentYear(y => y - 1);
      setProgress(0);
      setIsPlaying(false); // Pause when changing song
    }
  };

  const goToNextYear = async () => {
    const success = await postToBackend("next");
    if (success) {
      setCurrentYear(y => y + 1);
      setProgress(0);
      setIsPlaying(false); // Pause when changing song
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
          <img src={songData.song_img} alt="Capa da música" className="w-full h-full object-cover rounded" />
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
          <img src={isPlaying ? pauseIcon : playIcon} alt="Play/Pause" className="h-10 w-10 fill-white" />
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

      {/* Displaying device ID status for debugging, can be removed in production */}
      {!deviceId && (
        <p className="text-yellow-300 mt-4">Carregando player do Spotify...</p>
      )}
      {deviceId && (
        <p className="text-green-400 mt-4">Player carregado e conectado!</p>
      )}
      {!accessToken && (
        <p className="text-red-400 mt-4">Erro: Token de acesso não encontrado. Faça login novamente.</p>
      )}
    </div>
  );
}

export default ExibirMusica;