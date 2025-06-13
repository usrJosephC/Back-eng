import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import homeIcon from '../assets/home.svg';
import discoIcon from '../assets/disco.svg';
import sendIcon from '../assets/send.svg';
import restartIcon from '../assets/restart.svg';

function ConfirmarPlaylist() {
  const navigate = useNavigate();
  const [musicasSelecionadas, setMusicasSelecionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [playlistCriada, setPlaylistCriada] = useState(false);

  useEffect(() => {
    const carregarMusicas = async () => {
      const anos = JSON.parse(localStorage.getItem('anosSelecionados') || '[]');
      if (anos.length === 0) {
        setErro('Nenhuma música selecionada.');
        setLoading(false);
        return;
      }

      try {
        const respostas = await Promise.all(
          anos.map(async (ano) => {
            const res = await fetch(`https://divebackintime.onrender.com/api/year?year=${ano}`, {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error(`Erro ao buscar músicas do ano ${ano}`);
            const data = await res.json();

            return {
              ano,
              ...data[ano] // pega a entrada específica do ano
            };
          })
        );

        setMusicasSelecionadas(respostas);
      } catch (err) {
        console.error(err);
        setErro('Erro ao carregar músicas.');
      } finally {
        setLoading(false);
      }
    };

    carregarMusicas();
  }, []);

  const handleConfirmar = async () => {
    try {
      const anos = musicasSelecionadas.map(m => m.ano);
      const res = await fetch('https://divebackintime.onrender.com/api/playlist', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ years: anos })
      });

      if (!res.ok) throw new Error('Erro ao criar playlist');
      setPlaylistCriada(true);
      localStorage.removeItem('anosSelecionados');
    } catch (err) {
      console.error(err);
      setErro('Erro ao enviar playlist para o Spotify.');
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
          Revise as músicas selecionadas antes de criar sua playlist "Dive Back in Time"
        </p>

        <div className="bg-spotifyYellow text-black p-6 rounded-3xl shadow-md w-full max-w-md text-left mt-4">
          <h2 className="text-xl font-extrabold">Sua playlist Nostálgica</h2>
          {loading ? (
            <p className="text-center text-gray-700">Carregando músicas...</p>
          ) : erro ? (
            <p className="text-center text-red-600">{erro}</p>
          ) : musicasSelecionadas.length === 0 ? (
            <p className="text-center text-gray-700">Nenhuma música para exibir.</p>
          ) : (
            <>
              <span className="text-sm ml-2">{musicasSelecionadas.length} músicas</span>
              <div className="mt-4 space-y-3">
                {musicasSelecionadas.map((m) => (
                  <div key={m.ano} className="flex justify-between items-center bg-yellow-300 rounded-full px-4 py-2">
                    <div className="flex items-center gap-3">
                      <img src={m.song_img} alt="Disco" className="h-6 w-6 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{m.song_name}</p>
                        <p className="text-xs text-black/80">{m.artist_name}</p>
                      </div>
                    </div>
                    <span className="text-sm bg-yellow-500 rounded-full px-2 py-1">{m.ano}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {playlistCriada ? (
          <p className="text-green-400 font-bold mt-4">Playlist criada com sucesso no Spotify!</p>
        ) : (
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleConfirmar}
              disabled={loading || musicasSelecionadas.length === 0}
              className={`bg-spotifyYellow text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 ${
                loading || musicasSelecionadas.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
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
