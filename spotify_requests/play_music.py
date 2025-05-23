from .spotify_auth import sp
from .get_device_id import get_device_id

def play_music(uris: list, id: str):
    '''play music using the Spotify API'''
    try:
        sp.start_playback(device_id=id,
                          context_uri=None,
                          uris=uris,
                          offset=None,
                          position_ms=None)
        print("Playing music...")
    except Exception as e:
        print(f"An error occurred while trying to play music: {e}")

ids = [
    '0HPD5WQqrq7wPWR7P7Dw1i',
    '1c8gk2PeTE04A1pIDH9YMk',
    '60nZcImufyMA1MKQY3dcCH',
    '50kpGaPAhYJ3sGmk6vplg0'
]

uris = [f'spotify:track:{track_id}' for track_id in ids]

play_music(uris, get_device_id())
