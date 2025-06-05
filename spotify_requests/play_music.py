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

songs = [
    '0HPD5WQqrq7wPWR7P7Dw1i',
    '1c8gk2PeTE04A1pIDH9YMk',
    '60nZcImufyMA1MKQY3dcCH',
    '50kpGaPAhYJ3sGmk6vplg0'
]

# calling the necessary functions to authenticate and play music
sp_auth = spotify_auth()
uris_list = [f'spotify:track:{track_id}' for track_id in songs]
device_id = get_device_id(sp_auth)

play_music(sp_auth, uris_list, device_id)
