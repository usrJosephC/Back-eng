import os
import sys
import spotipy
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyOAuth
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def spotify_auth():
    load_dotenv()

    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    redirect_uri = os.getenv('REDIRECT_URI')

    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=client_id,
                                                client_secret=client_secret,
                                                redirect_uri=redirect_uri,
                                                scope="playlist-modify-public " \
                                                        "user-read-playback-state " \
                                                        "user-modify-playback-state " \
                                                        "user-library-read " \
                                                        "user-library-modify " \
                                                        "user-read-currently-playing " \
                                                        "user-read-playback-position " \
                                                        "user-read-recently-played " \
                                                        "streaming"))
    
    return sp
