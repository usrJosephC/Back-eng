import spotipy
from .auth_manager import auth_manager

def spotify_client(token_info):
    '''creates and returns a Spotipy client for Spotify API requests.
    If the access token is expired, it refreshes the token using the refresh token.'''

    sp_oauth = auth_manager()

    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])

    access_token = token_info['access_token']

    sp = spotipy.Spotify(auth=access_token)
    
    return sp, token_info
