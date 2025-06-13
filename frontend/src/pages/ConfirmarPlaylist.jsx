import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import homeIcon from '../assets/home.svg';
import discoIcon from '../assets/disco.svg';
import sendIcon from '../assets/send.svg';
import restartIcon from '../assets/restart.svg';

function ConfirmarPlaylist() {
  const navigate = useNavigate();
  const [selectedSongsYears, setSelectedSongsYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playlistCreated, setPlaylistCreated] = useState(false);

  useEffect(() => {
    const fetchLocalYears = () => {
      try {
        const years = JSON.parse(localStorage.getItem('selectedSongYears') || '[]');
        if (years.length === 0) {
          setError('Nenhuma música selecionada. Volte para escolher suas favoritas.');
        } else {
          setSelectedSongsYears(years);
        }
      } catch (e) {
        setError('Erro ao carregar anos das músicas.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocalYears();
  }, []);

  const handleCreatePlaylistOnSpotify = async () => {
    if (selectedSongsYears.length === 0) {
      setError('Nenhum ano selecionado para criar a playlist.');
      return;
    }

    try {
      const res = await fetch('https://divebackintime.onrender.com/api/playlist', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ years: selectedSongsYears }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Erro ao criar a playlist');
      }

      setPlaylistCreated(true);
      localStorage.removeItem('selectedSongYears');
    } catch (err) {
      console.error('Erro ao criar playlist:', err);
      setError('Erro ao criar a playlist. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-backgroundPurple text-white flex flex-col items-center px-4 pt-10 font-body">
      <div className="absolute top-6 right-6">
        <button
          onClick={() => navigate('/')}
          className="bg-spotifyYellow text-black font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:opacity-90"
        >
          HOME <img src={homeIcon} alt="Home" className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-6 mt-10 text-center">
        <img src={discoIcon} alt="Disco" className="h-16 w-16" />
        <h1 className="text-white text-5xl font-title font-bold">Confirme sua Playlist</h1>
        <p className="text-lg max-w-md">
          Revise os anos das músicas selecionadas antes de criar <br />
          sua playlist "Dive Back in Time"
        </p>

        <div className="bg-spotifyYellow text-black p-6 rounded-3xl shadow-md w-full max-w-md text-left mt-4">
          <h2 className="text-xl font-extrabold">Anos incluídos na playlist</h2>
          {loading ? (
            <p className="text-center text-gray-700">Carregando anos...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : (
            <>
              <span className="text-sm ml-2">{selectedSongsYears.length} ano(s)</span>
              <div className="mt-4 space-y-2">
                {selectedSongsYears.map((year, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-yellow-300 rounded-full px-4 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <img src={discoIcon} alt="Disco" className="h-6 w-6" />
                      <p className="text-sm font-medium">Ano: {year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {playlistCreated ? (
          <p className="text-green-400 font-bold mt-4">Playlist criada com sucesso no Spotify!</p>
        ) : (
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleCreatePlaylistOnSpotify}
              disabled={loading || selectedSongsYears.length === 0}
              className={`bg-spotifyYellow text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 ${
                loading || selectedSongsYears.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:opacity-90'
              }`}
            >
              Criar playlist no Spotify <img src={sendIcon} alt="Send" className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-yellow-800 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90"
            >
              Começar novamente <img src={restartIcon} alt="Restart" className="h-5 w-5" />
            </button>
          </div>
        )}

        <p className="mt-6 text-sm text-white/90 max-w-sm">
          Isso criará uma nova lista de reprodução na sua conta do Spotify conectada
        </p>
      </div>
    </div>
  );
}

export default ConfirmarPlaylist;
