import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import homeIcon from '../assets/home.svg';
import headphones from '../assets/headphones.svg';
import sendIcon from '../assets/send.svg';

const CriarPlaylist = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch('https://divebackintime.onrender.com/api/playlist', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error('Erro ao buscar músicas');
        const data = await res.json();
        setSongs(data);
        setSelectedSongs(data.map(song => song.id)); // Seleciona todas por padrão
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar músicas.");
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const toggleSong = (songId) => {
    setSelectedSongs(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const selectAll = () => {
    setSelectedSongs(songs.map(song => song.id));
  };

  const handleCreatePlaylist = async () => {
    try {
      localStorage.setItem('selectedSongIds', JSON.stringify(selectedSongs));
      
      const res = await fetch('https://divebackintime.onrender.com/api/playlist', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songIds: selectedSongs }),
      });

      if (!res.ok) {
        throw new Error('Erro ao salvar playlist no backend');
      }

      navigate('/confirmar');
    } catch (err) {
      console.error("Erro ao criar playlist:", err);
      alert("Erro ao salvar a playlist. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-backgroundPurple text-white flex flex-col items-center justify-center px-4 text-center font-body">
      <div className="absolute top-6 right-6">
        <button
          onClick={() => navigate('/')}
          className="bg-spotifyYellow text-black font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:opacity-90"
        >
          HOME <img src={homeIcon} alt="Home" className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 mt-10">
        <img src={headphones} alt="Fones" className="h-16 w-16" />
        <h1 className="text-4xl font-extrabold font-title text-white">
          Escolha as suas favoritas
        </h1>
        <p className="text-base text-white">
          Selecione as músicas que você gostaria de adicionar à sua playlist nostálgica
        </p>
      </div>

      <div className="bg-transparent border mt-10 border-white rounded-md px-8 py-6 w-full max-w-xl">
        {loading ? (
          <p className="text-center text-yellow-300">Carregando músicas...</p>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : songs.length === 0 ? (
          <p className="text-center text-gray-400">Nenhuma música disponível para seleção.</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-medium font-body">
                Músicas da sua Viagem ({selectedSongs.length} selecionada{selectedSongs.length !== 1 ? 's' : ''})
              </span>
              <button
                onClick={selectAll}
                className="text-white text-sm hover:underline font-title"
              >
                Selecionar todas
              </button>
            </div>

            <div className="space-y-4">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="flex justify-between items-center px-4 py-2 rounded-md border border-white text-left transition-all hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSongs.includes(song.id)}
                      onChange={() => toggleSong(song.id)}
                      className="form-checkbox h-5 w-5 text-black bg-transparent border-white rounded"
                    />
                    <div>
                      <p className="font-semibold text-white">{song.title}</p>
                      <p className="text-sm text-white/80">{song.artist}</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold font-body text-[#000] bg-[#FFD400] px-3 py-1 rounded-full">
                    {song.year}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleCreatePlaylist}
        disabled={selectedSongs.length === 0 || loading}
        className={`mt-8 flex items-center gap-2 bg-spotifyYellow text-black font-semibold px-6 py-3 rounded-full ${
          selectedSongs.length === 0 || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <img src={sendIcon} alt="Enviar" className="w-5 h-5" />
        Criar minha playlist
      </button>
    </div>
  );
};

export default CriarPlaylist;
