# Dive Back In Time

Este é o backend de **Dive Back In Time**, uma aplicação que permite ao usuário escolher um ano entre 1946 e 2024 e fazer uma viagem no tempo para escutar todas as músicas mais famosas de cada ano, a partir do escolhido, usando a API do Spotify.



## Tecnologias Utilizadas

- [Flask](https://flask.palletsprojects.com/)
- [Flask-CORS](https://flask-cors.readthedocs.io/)
- [Spotipy](https://spotipy.readthedocs.io/) – cliente Python para a API do Spotify
- [Pandas](https://pandas.pydata.org/)
- [python-dotenv](https://github.com/theskumar/python-dotenv)
- [Gunicorn](https://gunicorn.org/) – para deploy em produção
- [Render](https://render.com) – hospedagem do backend



## Pré-requisitos

- Python 3.8 ou superior
- Conta de desenvolvedor Spotify (para obter client ID e client secret e adicionar uma redirect uri): [https://developer.spotify.com/](https://developer.spotify.com/dashboard)
- Um dispositivo ativo com Spotify aberto para reproduzir músicas
  

## Instruções de Uso

### 1. Clone o repositório

```bash
git clone https://github.com/usrJosephC/Back-eng.git
cd Back-eng
```

### 2. Crie e ative um ambiente virtual (recomendado)

#### No Windows
```bash
# Criação (Windows)
python -m venv venv

# Ativação (Windows)
venv\Scripts\activate
```

#### No Mac/Linux
```bash
# Criação (Mac/Linux)
python3 -m venv venv

# Ativação (Mac/Linux)
source venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Defina variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
SPOTIPY_CLIENT_ID=seu_spotify_client_id
SPOTIPY_CLIENT_SECRET=seu_spotify_client_secret
SPOTIPY_REDIRECT_URI=seu_redirect_uri
FLASK_SECRET_KEY=uma_chave_secreta_qualquer
```

### 5. Execute a aplicação

#### No Windows
```bash
python app.py
```

#### No Mac/Linux
```bash
python3 app.py
```

A aplicação será iniciada por padrão em: [http://localhost:5000](http://localhost:5000)



## Endpoints Principais

| Rota             | Método | Descrição                                 |
|------------------|--------|-------------------------------------------|
| `/`              | GET    | Testa se o servidor está rodando          |
| `/login`         | GET    | Redireciona para autenticação do Spotify  |
| `/callback`      | GET    | Callback após autenticação                |
| `/token`         | GET    | Retorna o token salvo na sessão           |
| `/device`        | POST   | Salva o `device_id` do frontend           |
| `/year`          | GET    | Retorna as músicas do ano informado       |
| `/play`          | GET    | Toca as músicas daquele ano no Spotify    |
| `/pause`         | GET    | Pausa a reprodução atual                  |
| `/previous`      | GET    | Volta para a música anterior              |
| `/next`          | GET    | Pula para a próxima música                |
| `/playlist`      | POST   | Cria uma playlist com músicas de anos específicos |



## Estrutura do Projeto

```
project/
│
├── app.py                      # Arquivo principal Flask
├── requirements.txt            # Lista de dependências
├── .env                        # Variáveis de ambiente (não versionar)
├── table/
│   ├── table.py                # Função que filtra a tabela de músicas
│   ├── music_table.csv         # Tabela com todas as músicas mais famosas por ano
└── spotify_requests/
    ├── auth_manager.py         # Gerencia autenticação com Spotify
    ├── create_playlist.py      # Criação de playlists
    ├── get_device_id.py        # Função para descobrir o id do dispositivo, se necessário
    ├── get_info.py             # Função que retorna um dicionário com as informações das músicas, como nome, artista, duração etc
    ├── get_song_id.py          # Busca ID das músicas
    ├── next_track.py           # Próxima música
    ├── pause_music.py          # Função para pausar
    ├── play_music.py           # Função para tocar música
    ├── previous_track.py       # Música anterior
    └── spotify_client.py       # Cliente principal de requisições Spotify
```



## Contato

Dúvidas, sugestões ou melhorias? Abra uma issue e entre em contato conosco.
