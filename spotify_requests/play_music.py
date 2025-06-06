from .spotify_auth import spotify_auth
from .get_device_id import get_device_id

def play_music(sp, uris: list, device: str):
    '''play music using the Spotify API'''
    try:
        sp.start_playback(device_id=device,
                          context_uri=None,
                          uris=uris,
                          offset=None,
                          position_ms=None)
        print("Playing music...")
    except Exception as e:
        print(f"An error occurred while trying to play music: {e}")
