import os
import sys
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyOAuth
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def auth_manager():
    '''creates and returns a SpotifyOAuth object for authentication.'''
    load_dotenv()

    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    redirect_uri = os.getenv('REDIRECT_URI')
    scope = (
        "playlist-modify-public "
        "user-read-playback-state "
        "user-modify-playback-state "
        "user-library-read "
        "user-library-modify "
        "user-read-currently-playing "
        "user-read-playback-position "
        "user-read-recently-played "
        "streaming"
    )

    return SpotifyOAuth(client_id=client_id,
                        client_secret=client_secret,
                        redirect_uri=redirect_uri,
                        scope=scope,
                        cache_path=None)
