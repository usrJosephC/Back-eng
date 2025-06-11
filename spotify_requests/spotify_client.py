import spotipy
from .auth_manager import auth_manager

def spotify_client():
    '''creates and returns a Spotipy client for Spotify API requests.'''

    auth = auth_manager()
    sp = spotipy.Spotify(auth_manager=auth)
    
    return sp
