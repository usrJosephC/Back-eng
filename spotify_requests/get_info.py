import os
import sys
import spotipy
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyOAuth
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from table.table import filtered_table


load_dotenv()

client_id = os.getenv('CLIENT_ID')
client_secret = os.getenv('CLIENT_SECRET')
redirect_uri = os.getenv('REDIRECT_URI')

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=client_id,
                                               client_secret=client_secret,
                                               redirect_uri=redirect_uri,
                                               scope="user-library-read"))

info = {}
year = int(filtered_table['YEAR'][0])

for uri in filtered_table['URI']:
    track = sp.track(uri)

    artist_name = track['artists'][0]['name']
    song_name = track['name']
    song_img = track['album']['images'][0]['url']

    info[year] = {
        'artist_name': artist_name,
        'song_name': song_name,
        'song_img': song_img
    }

    year += 1
