from .spotify_auth import sp

def play_music(uris: list):
    '''play music using the Spotify API'''
    try:
        sp.start_playback(uris=uris)
        print("Playing music...")
    except Exception as e:
        print(f"An error occurred while trying to play music: {e}")
