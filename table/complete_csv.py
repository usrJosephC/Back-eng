import pandas as pd
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Autenticação básica
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id="452f64a938674d4fbb2f2a7ce3e69ec5",
    client_secret="ece255fb10cd4eeea5eccc454f92405f"
))

# Carrega o CSV atual
df = pd.read_csv('music_table.csv')

# Corrige o URI (se necessário)
df['URI'] = df['URI'].apply(lambda x: f'spotify:track:{x}' if not x.startswith('spotify:track:') else x)

# Novas colunas
df['SONG_IMG'] = ''
df['TRACK_DURATION'] = 0

# Preenche os dados faltantes
for idx, row in df.iterrows():
    try:
        track = sp.track(row['URI'])

        df.at[idx, 'SONG_IMG'] = track['album']['images'][0]['url']
        df.at[idx, 'TRACK_DURATION'] = track['duration_ms']
    except Exception as e:
        print(f"Erro com URI {row['URI']}: {e}")
        continue

# Salva tabela completa
df.to_csv('tabela_completa.csv', index=False)
