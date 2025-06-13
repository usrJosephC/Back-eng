import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import homeIcon from '../assets/home.svg';
import discoIcon from '../assets/disco.svg';
import sendIcon from '../assets/send.svg';
import restartIcon from '../assets/restart.svg';

const ConfirmarPlaylist = () => {
  const navigate = useNavigate();

  const anosSelecionados = JSON.parse(localStorage.getItem('anosSelecionados') || '[]');

  const [musicas, setMusicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (anosSelecionados.length === 0) {
      setErro('Nenhum ano selecionado. Volte para escolher suas músicas.');
      setLoading(false);
      return;
    }

    const fetchMusicas = async () => {
      try {
        const respostas = await Promise.all(
          anosSelecionados.map(async (ano) => {
            const res = await fetch(`https://divebackintime.onrender.com/api/year?year=${ano}`, {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) throw new Error(`Erro ao buscar músicas do ano ${ano}`);

            const dados = await res.json();

            return {
              ano: parseInt(ano),
              ...dados[ano],
            };
          })
        );

        setMusicas(respostas);
      } catch (err) {
        console.error(err);
        setErro('Erro ao carregar músicas.');
      } finally {
        setLoading(false);
      }
    };

    fetchMusicas();
  }, [anosSelecionados]);

  const handleRestart = () => {
    localStorage.removeItem('anosSelecionados');
    navigate('/');
  };

  const handleEnviar = () => {
    // Aqui você pode implementar o envio da playlist confirmada para o backend ou próximo passo
    alert('Playlist confirmada! (implemente envio)');
  };

  return (
    <div className="min-h-screen bg-backgroundPurple text-white flex flex-col items-center justify-center px-4 text-center font-body">
      <div className="absolute top-6 right-6 flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="bg-spotifyYellow text-black font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:opacity-90"
        >
          HOME <img src={homeIcon} alt="Home" className="h-5 w-5" />
        </button>
        <button
          onClick={handleRestart}
          className="bg-red-600 text-white font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:opacity-90"
        >
          Reiniciar <img src={restartIcon} alt="Reiniciar" className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 mt-10 max-w-xl w-full">
        <img src={discoIcon} alt="Disco" className="h-16 w-16" />
        <h1 className="text-4xl font-extrabold font-title text-white">Confirme sua Playlist</h1>
        <p className="text-base text-white mb-6">Confira as músicas escolhidas para sua viagem nostálgica</p>

        {loading ? (
          <p className="text-yellow-300">Carregando músicas...</p>
        ) : erro ? (
          <p className="text-red-400">{erro}</p>
        ) : musicas.length === 0 ? (
          <p className="text-gray-400">Nenhuma música selecionada.</p>
        ) : (
          <div className="space-y-4 w-full max-h-96 overflow-y-auto">
            {musicas.map((m) => (
              <div
                key={m.ano}
                className="flex justify-between items-center px-4 py-2 rounded-md border border-white text-left transition-all hover:bg-white/10"
              >
                <img src={m.song_img} alt={m.song_name} className="h-12 w-12 rounded" />
                <div className="flex flex-col flex-grow ml-4">
                  <p className="font-semibold text-white">{m.song_name}</p>
                  <p className="text-sm text-white/80">{m.artist_name}</p>
                </div>
                <div className="text-sm font-bold font-body text-[#000] bg-[#FFD400] px-3 py-1 rounded-full">
                  {m.ano}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleEnviar}
          disabled={loading || musicas.length === 0}
          className={`mt-8 flex items-center gap-2 bg-spotifyYellow text-black font-semibold px-6 py-3 rounded-full ${
            loading || musicas.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <img src={sendIcon} alt="Enviar" className="w-5 h-5" />
          Confirmar Playlist
        </button>
      </div>
    </div>
  );
};

export default ConfirmarPlaylist;
