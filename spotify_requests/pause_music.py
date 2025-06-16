import spotipy

class SpotifyPauseError(Exception):
    '''Custom exception for Spotify pause errors'''

def pause_music(sp, device_id: str):
    '''pause the music on the Spotify device'''
    if not device_id:
        print("DEBUG: pause_music - missing device ID, cannot pause.")
        raise ValueError("No device ID found to pause playback.")

    try:
        print(f"DEBUG: pause_music - pausing playback on device_id: {device_id}")
        sp.pause_playback(device_id=device_id)

    except spotipy.SpotifyException as e:
        print(f"ERROR: pause_music - Spotify API error: {e}")

        if e.http_status == 403:
            print("ERROR: pause_music - Check scopes or Premium status.")
            raise SpotifyPauseError(f"Forbidden (403): {e.reason}") from e
        
        elif e.http_status == 404:
            print("ERROR: pause_music - Device not found or inactive.")
            raise SpotifyPauseError(f"Not Found (404): {e.reason}") from e
        
        else:
            raise SpotifyPauseError(f"Spotify API error {e.http_status}: {e.reason}") from e
        
    except Exception as e:
        print(f"ERROR: pause_music - Unexpected error: {e}")
        raise SpotifyPauseError(f"Unexpected error during pause: {e}") from e
