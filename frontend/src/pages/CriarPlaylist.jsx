import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import homeIcon from '../assets/home.svg';
import headphones from '../assets/headphones.svg';
import sendIcon from '../assets/send.svg';

const CriarPlaylist = () => {
  const navigate = useNavigate();

  const anoParaBuscar = localStorage.getItem('anoEscolhido'); // <-- pegando do localStorage

  const [musicas, setMusicas] = useState([]);
  const [anosSelecionados, setAnosSelecionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!anoParaBuscar) {
      setErro('Ano não informado. Volte e escolha um ano.');
      setLoading(false);
      return;
    }

    const fetchMusicas = async () => {
      try {
        const res = await fetch(`https://divebackintime.onrender.com/api/year?year=${anoParaBuscar}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error('Erro ao buscar músicas');
        const dados = await res.json();

        const listaMusicas = Object.entries(dados).map(([ano, info]) => ({
          ano: parseInt(ano),
          ...info
        }));

        setMusicas(listaMusicas);
        setAnosSelecionados(listaMusicas.map(m => m.ano)); // tudo selecionado por padrão
      } catch (err) {
        console.error(err);
        setErro('Erro ao carregar músicas.');
      } finally {
        setLoading(false);
      }
    };

    fetchMusicas();
  }, [anoParaBuscar]);

  const toggleAno = (ano) => {
    setAnosSelecionados(prev =>
      prev.includes(ano)
        ? prev.filter(a => a !== ano)
        : [...prev, ano]
    );
  };

  const selecionarTodos = () => {
    setAnosSelecionados(musicas.map(m => m.ano));
  };

  const handleAvancar = () => {
    localStorage.setItem('anosSelecionados', JSON.stringify(anosSelecionados));
    navigate('/confirmar');
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
        <h1 className="text-4xl font-extrabold font-title text-white">Escolha as suas favoritas</h1>
        <p className="text-base text-white">Selecione as músicas que você gostaria de adicionar à sua playlist nostálgica</p>
      </div>

      <div className="bg-transparent border mt-10 border-white rounded-md px-8 py-6 w-full max-w-xl">
        {loading ? (
          <p className="text-center text-yellow-300">Carregando músicas...</p>
        ) : erro ? (
          <p className="text-center text-red-400">{erro}</p>
        ) : musicas.length === 0 ? (
          <p className="text-center text-gray-400">Nenhuma música disponível para seleção.</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-medium font-body">
                Músicas da sua Viagem ({anosSelecionados.length} selecionada{anosSelecionados.length !== 1 ? 's' : ''})
              </span>
              <button
                onClick={selecionarTodos}
                className="text-white text-sm hover:underline font-title"
              >
                Selecionar todas
              </button>
            </div>

            <div className="space-y-4">
              {musicas.map((m) => (
                <div
                  key={m.ano}
                  className="flex justify-between items-center px-4 py-2 rounded-md border border-white text-left transition-all hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={anosSelecionados.includes(m.ano)}
                      onChange={() => toggleAno(m.ano)}
                      className="form-checkbox h-5 w-5 text-black bg-transparent border-white rounded"
                    />
                    <img src={m.song_img} alt={m.song_name} className="h-12 w-12 rounded" />
                    <div>
                      <p className="font-semibold text-white">{m.song_name}</p>
                      <p className="text-sm text-white/80">{m.artist_name}</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold font-body text-[#000] bg-[#FFD400] px-3 py-1 rounded-full">
                    {m.ano}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleAvancar}
        disabled={anosSelecionados.length === 0 || loading}
        className={`mt-8 flex items-center gap-2 bg-spotifyYellow text-black font-semibold px-6 py-3 rounded-full ${
          anosSelecionados.length === 0 || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <img src={sendIcon} alt="Enviar" className="w-5 h-5" />
        Avançar
      </button>
    </div>
  );
};

export default CriarPlaylist;
