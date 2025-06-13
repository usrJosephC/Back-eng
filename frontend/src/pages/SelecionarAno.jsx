import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import homeIcon from '../assets/home.svg';
import calendarIcon from '../assets/calendar.svg';

const SelecionarAno = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const enviarAno = async () => {
    if (!selectedYear) {
      setErrorMessage('Por favor, digite um ano.');
      return;
    }

    setErrorMessage(''); 

    try {
      const tokenResponse = await fetch('https://divebackintime.onrender.com/api/token', {
        credentials: 'include'
      });
      if (!tokenResponse.ok) {
        throw new Error('Erro ao obter token');
      }
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      if (!accessToken) {
        throw new Error('Token inválido recebido do servidor')
      }

      const response = await fetch(
          `https://divebackintime.onrender.com/api/year?year=${selectedYear}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

      if (response.ok) {
        console.log('Ano enviado com sucesso!')
        navigate('/exibir', {state: {birthYear: parseInt(selectedYear)}});
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Erro ao enviar o ano para o servidor.');
        console.error('Erro ao enviar o ano: ', errorData);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setErrorMessage('Erro na conexão  com o servidor. Tente Novamente.');
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

      <div className="flex flex-col items-center gap-6 mt-10 text-center">
        <img src={calendarIcon} alt="Calendar" className="h-16 w-16" />

        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl mb-2"></div>

          <h1 className="text-5xl justify-center font-title font-bold text-[#FFFF] mb-4">
            Quando você nasceu?
          </h1>

          <p className="max-w-md text-base font-body text-[#FFFF]">
            Digite o ano do seu nascimento para começar
            a sua jornada musical através do tempo: <br />
          </p>

          <input
            type="number"
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="mt-4 w-48 px-4 py-2 text-center text-black font-medium rounded-full bg-[#FFD400] placeholder:text-black focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Ex: 1994"
            min="1946"
            max="2024"
          />

          <button
            type="button"
            onClick={enviarAno}
            className="mt-2 w-48 px-4 py-2 rounded-full bg-[#FFD400] text-black font-semibold hover:opacity-90"
          >
            Confirmar
          </button>

          <p className="mt-6 text-sm font-body text-[#FFF]">
            Anos disponíveis: 1946-2024
          </p>

          {errorMessage && (
            <p className="mt-2 text-sm font-body text-[#FFF]">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelecionarAno;
