from .spotify_auth import sp

def pause_music(device_id):
    try:
        sp.pause_playback(device_id=device_id)
        print("Music paused.")
    except Exception as e:
        print(f"Error pausing music: {e}")