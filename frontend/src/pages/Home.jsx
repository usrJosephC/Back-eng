import { useNavigate } from 'react-router-dom';
import headphones from '../assets/headphones.svg';
import homeIcon from '../assets/home.svg';
import spotifyIcon from '../assets/spotify.svg';

function Home() {
  const navigate = useNavigate();

  const iniciarLogin = () => {
    window.location.href = 'https://divebackintime.onrender.com/api/login';
  };

  return (
    <div className="min-h-screen bg-backgroundPurple text-white flex flex-col items-center justify-center px-4 text-center font-body">
      <div className="absolute top-6 right-6">
        <button className="bg-spotifyYellow text-black font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:opacity-90">
          HOME <img src={homeIcon} alt="Home" className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-6 mt-10">
        <img src={headphones} alt="Headphones" className="h-16 w-16" />

        <h1 className="text-white text-5xl font-title leading-tight tracking-wide">
          <div>DIVE BACK</div>
          <div className="mt-2">IN TIME</div>
        </h1>

        <p className="mt-2 text-lg max-w-md leading-relaxed">
          Mergulhe de volta no tempo <br />
          e redescubra os hits de maior sucesso <br />
          desde o seu nascimento
        </p>

        <button
          onClick={iniciarLogin}
          className="mt-6 bg-spotifyYellow text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90"
        >
          ENTRE COM SPOTIFY <img src={spotifyIcon} alt="Spotify" className="h-6 w-6" />
        </button>

        <p className="mt-6 text-sm text-white/90 max-w-sm">
          Se conecte com sua conta Premium do Spotify para criar a sua viagem no tempo
        </p>
      </div>
    </div>
  );
}

export default Home;