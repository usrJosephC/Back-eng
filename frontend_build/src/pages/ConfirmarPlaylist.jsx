import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import homeIcon from '../assets/home.svg';
import discoIcon from '../assets/disco.svg';
import sendIcon from '../assets/send.svg';
import restartIcon from '../assets/restart.svg';

function ConfirmarPlaylist() {
  const navigate = useNavigate();
  const [selectedSongsDetails, setSelectedSongsDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playlistCreated, setPlaylistCreated] = useState(false);

  useEffect(() => {
    const fetchSelectedSongs = async () => {
      const selectedSongIds = JSON.parse(localStorage.getItem('selectedSongIds') || '[]');
      if (selectedSongIds.length === 0) {
        setError('Nenhuma música selecionada. Volte para escolher suas favoritas.');
        setLoading(false);
        return;
      }

      try {  
        const tokenResponse = await fetch('https://divebackintime.onrender.com/api/token');
        if (!tokenResponse.ok) throw new Error('Erro ao obter o token');
        const { access_token } = await tokenResponse.json();

        const params = new URLSearchParams();
        selectedSongIds.forEach(id => params.append('song_ids', id));

        const res = await fetch(`https://backend-divebackintime.onrender.com/playlist-details?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Erro ao buscar detalhes das músicas selecionadas.');
        }

        const data = await res.json();
        setSelectedSongsDetails(data);
      } catch (err) {
        console.error("Erro ao carregar detalhes das músicas:", err);
        setError("Não foi possível carregar os detalhes das músicas. Tente novamente.");
        setSelectedSongsDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedSongs();
  }, [navigate]);

  const handleCreatePlaylistOnSpotify = async () => {
    if (selectedSongsDetails.length === 0) {
      setError('Músicas não disponíveis para criar a playlist.');
      return;
    }

    try {
      const tokenResponse = await fetch('https://divebackintime.onrender.com/api/token');
      if (!tokenResponse.ok) throw new Error('Erro ao obter o token');
      const { access_token } = await tokenResponse.json();

      const years = selectedSongsDetails.map(song => song.year);
      const songUris = selectedSongsDetails.map(song => song.uri);

      const params = new URLSearchParams();
      years.forEach(year => params.append('years', year));
      songUris.forEach(uri => params.append('song_uris', uri));

      const response = await fetch(`https://divebackintime.onrender.com/api/playlist?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Playlist criada com sucesso no Spotify!');
        setPlaylistCreated(true);
        localStorage.removeItem('selectedSongIds');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar playlist no Spotify.');
        console.error('Erro ao criar playlist:', errorData);
      }
    } catch (err) {
      console.error('Erro na requisição para criar playlist:', err);
      setError('Erro na conexão com o servidor ao tentar criar a playlist.');
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
          Revise as músicas selecionadas antes de criar <br />
          sua playlist "Dive Back in Time"
        </p>

        <div className="bg-spotifyYellow text-black p-6 rounded-3xl shadow-md w-full max-w-md text-left mt-4">
          <h2 className="text-xl font-extrabold">Sua playlist Nostálgica</h2>
          {loading ? (
            <p className="text-center text-gray-700">Carregando músicas...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : selectedSongsDetails.length === 0 ? (
            <p className="text-center text-gray-700">Nenhuma música para exibir.</p>
          ) : (
            <>
              <span className="text-sm ml-2">{selectedSongsDetails.length} músicas</span>
              <div className="mt-4 space-y-3">
                {selectedSongsDetails.map((song) => (
                  <div key={song.id} className="flex justify-between items-center bg-yellow-300 rounded-full px-4 py-2">
                    <div className="flex items-center gap-3">
                      <img src={discoIcon} alt="Disco" className="h-6 w-6" />
                      <div>
                        <p className="text-sm font-medium">{song.title}</p>
                        <p className="text-xs text-black/80">{song.artist}</p>
                      </div>
                    </div>
                    <span className="text-sm bg-yellow-500 rounded-full px-2 py-1">{song.year}</span>
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
              disabled={loading || selectedSongsDetails.length === 0}
              className={`bg-spotifyYellow text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 ${
                loading || selectedSongsDetails.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
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
