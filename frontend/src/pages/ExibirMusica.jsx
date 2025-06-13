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

  // MUDANÇA CRUCIAL AQUI: Usaremos um estado para o objeto token_info completo
  const [tokenInfo, setTokenInfo] = useState(null);

  // Function to fetch or refresh token
  const fetchOrRefreshToken = async () => {
    console.log("Tentando recuperar ou renovar token...");
    // MUDANÇA CRUCIAL AQUI: Busca o objeto completo 'token_info'
    const localTokenInfoString = localStorage.getItem("token_info");
    let localTokenInfo = null;

    if (localTokenInfoString) {
      try {
        localTokenInfo = JSON.parse(localTokenInfoString);
        // Opcional, mas recomendado: Lógica de expiração do token no frontend
        if (
          localTokenInfo.expires_at &&
          Date.now() < localTokenInfo.expires_at * 1000
        ) {
          console.log("Token válido do localStorage (com escopos).");
          setTokenInfo(localTokenInfo); // Atualiza o estado
          return localTokenInfo; // Retorna o objeto completo
        } else {
          console.log("Token no localStorage expirado ou sem data de expiração.");
          localStorage.removeItem("token_info"); // Remove token expirado
        }
      } catch (e) {
        console.error("Erro ao parsear token_info do localStorage:", e);
        localStorage.removeItem("token_info"); // Limpar token inválido
      }
    }

    try {
      console.log("Buscando token do servidor (ou renovando)...");
      const res = await fetch("https://divebackintime.onrender.com/api/token", {
        credentials: "include",
      });
      if (!res.ok) {
        // Se a resposta for 401 (Não Autorizado), força o logout
        if (res.status === 401) {
          console.error("Erro 401 ao buscar token, forçando re-autenticação.");
          localStorage.removeItem("token_info"); // Limpar token inválido
          navigate("/"); // Redireciona para o login
          return null;
        }
        throw new Error("Falha ao buscar token");
      }
      // MUDANÇA CRUCIAL AQUI: 'data' agora é o objeto token_info completo
      const data = await res.json();
      if (!data.access_token) throw new Error("Token inválido recebido");

      console.log("Token completo recebido/renovado do servidor:", data);
      localStorage.setItem("token_info", JSON.stringify(data)); // Armazenar o objeto completo como string
      setTokenInfo(data); // Atualiza o estado
      return data; // Retorna o objeto completo
    } catch (error) {
      console.error("Erro ao buscar/renovar token:", error);
      localStorage.removeItem("token_info"); // Limpar token inválido
      navigate("/"); // Redirecionar para o login se falhar
      return null;
    }
  };

  const sendDeviceIdToBackend = async (device_id) => {
    console.log("Enviando device ID para o backend:", device_id);
    try {
      const res = await fetch(
        "https://divebackintime.onrender.com/api/device",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ device_id }),
        }
      );
      if (!res.ok) throw new Error("Falha ao enviar device ID");
      console.log("Device ID enviado com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar device ID:", error);
      // Não navegar para / aqui, pois pode estar apenas sem deviceId
      // O erro de autenticação do player já lida com a navegação.
    }
  };

  useEffect(() => {
    // Carregar o SDK do Spotify apenas uma vez
    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log("Spotify Web Playback SDK pronto. Criando player...");
      const spotifyPlayer = new window.Spotify.Player({
        name: "Dive Back Player",
        // MUDANÇA CRUCIAL AQUI: getOAuthToken deve sempre buscar o token mais recente
        getOAuthToken: async (cb) => {
          // fetchOrRefreshToken agora retorna o objeto token_info completo
          const currentTokenInfo = await fetchOrRefreshToken();
          if (currentTokenInfo && currentTokenInfo.access_token) {
            cb(currentTokenInfo.access_token); // Passa APENAS o access_token para o SDK
          } else {
            console.error(
              "Não foi possível fornecer um access_token válido para o Spotify Player."
            );
            // Não chame cb(null) ou cb("") aqui, deixe o listener de 'authentication_error' lidar com isso.
          }
        },
        volume: 0.5,
      });

      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener("ready", async ({ device_id }) => {
        console.log("Player pronto! Device ID:", device_id);
        setDeviceId(device_id);
        await sendDeviceIdToBackend(device_id);
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Player ficou offline. Device ID:", device_id);
      });

      spotifyPlayer.addListener("authentication_error", async (error) => {
        console.error("Erro de autenticação no player:", error);
        console.error("Mensagem do erro:", error.message);
        // MUDANÇA IMPORTANTE AQUI: Remove o token_info completo para forçar renovação
        localStorage.removeItem("token_info");
        // Tenta renovar o token e re-conectar. Se falhar, redireciona.
        console.log("Tentando renovar token após erro de autenticação...");
        const newTokenInfo = await fetchOrRefreshToken();
        if (newTokenInfo) {
          console.log("Token renovado, tentando reconectar o player...");
          // Você pode tentar reconectar explicitamente, ou simplesmente navegar
          // para a página inicial que iniciará o processo novamente.
          // player.connect(); // Isso pode não ser suficiente, dependendo do erro.
          navigate("/selecionar", { state: { birthYear: currentYear } }); // Volta para a tela de seleção para re-iniciar tudo
        } else {
          console.error(
            "Falha ao renovar token após erro de autenticação. Redirecionando para login."
          );
          navigate("/"); // Redireciona para o login se a renovação falhar
        }
      });

      spotifyPlayer.addListener("account_error", (error) => {
        console.error("Erro na conta Spotify:", error);
        navigate("/"); // Redirect on account error
      });

      spotifyPlayer.addListener("playback_error", (error) => {
        console.error("Erro na reprodução:", error);
        // Consider handling this gracefully, maybe pausing or skipping
      });

      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log("Conectado ao player Spotify com sucesso.");
        } else {
          console.error("Falha ao conectar ao player Spotify.");
          // Se a conexão inicial falhar, limpe o token e navegue
          localStorage.removeItem("token_info");
          navigate("/");
        }
      });
    };

    return () => {
      if (player) {
        console.log("Desconectando player Spotify...");
        player.disconnect();
      }
      // Limpar o window.onSpotifyWebPlaybackSDKReady para evitar múltiplas vinculações
      window.onSpotifyWebPlaybackSDKReady = null;
    };
    // Adicione 'tokenInfo' às dependências para que o useEffect reaja a mudanças no token
  }, [navigate, player, tokenInfo]); 

  // ... rest of your component (useEffect for fetchSong, formatTime, handlers) remains the same

  useEffect(() => {
    // Garante que só busca música se o deviceId estiver disponível e o tokenInfo existir
    if (!deviceId || !tokenInfo) return;

    const fetchSong = async () => {
      try {
        console.log("Buscando música para o ano:", currentYear);
        const res = await fetch(
          `https://divebackintime.onrender.com/api/year?year=${currentYear}`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok) {
          // Se buscar uma música também retornar 401, o token está ruim.
          if (res.status === 401) {
            console.error(
              "Erro 401 ao buscar música, token provavelmente expirado. Forçando re-autenticação."
            );
            localStorage.removeItem("token_info"); // Limpa o token antigo
            navigate("/"); // Aciona o fluxo de re-autenticação completo
            return;
          }
          throw new Error("Erro ao buscar música");
        }
        const data = await res.json();
        setSongData(data);
        setDuration(Math.floor(data.track_duration / 1000));
        setProgress(0);
      } catch (error) {
        console.error("Erro ao buscar música:", error);
        setSongData(null);
        setDuration(180);
        setProgress(0);
        setIsPlaying(false);
      }
    };

    fetchSong();
  }, [currentYear, deviceId, navigate, tokenInfo]); // Adicionado tokenInfo à dependência

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
  }, [isPlaying, duration, songData, currentYear]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const IrParaCriar = () => navigate("/criar");

  const postToBackend = async (endpoint) => {
    // MUDANÇA IMPORTANTE AQUI: Verifica se deviceId e tokenInfo existem antes de prosseguir
    if (!deviceId || !tokenInfo) {
        console.warn("Player ou token não estão prontos para enviar requisição ao backend.");
        return false;
    }
    try {
      console.log(`Enviando requisição para /api/${endpoint}`);
      const res = await fetch(
        `https://divebackintime.onrender.com/api/${endpoint}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        // Se o controle de reprodução também retornar 401, força a re-autenticação
        if (res.status === 401) {
          console.error(
            `Erro 401 na requisição /api/${endpoint}, token provavelmente expirado. Forçando re-autenticação.`
          );
          localStorage.removeItem("token_info");
          navigate("/");
          return false;
        }
        console.error(`Falha na requisição /api/${endpoint}`);
        return false;
      }
      console.log(`Requisição /api/${endpoint} bem-sucedida`);
      return true;
    } catch (error) {
      console.error(`Erro na requisição /api/${endpoint}:`, error);
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