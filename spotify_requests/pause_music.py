import spotipy

def pause_music(sp, device_id: str):
    '''pause the music on the Spotify device'''
    if not device_id:
        print("DEBUG: pause_music - Device ID is missing, cannot pause playback.")
        raise ValueError("No device ID found to pause playback.")

    try:
        print(f"DEBUG: pause_music - Attempting to pause playback on device_id: {device_id}")
        sp.pause_playback(device_id=device_id)
        print("DEBUG: pause_music - sp.pause_playback() called successfully.")
    except spotipy.SpotifyException as e:
        print(f"ERROR: pause_music - Spotify API error during pause: {e}")
        if e.http_status == 403:
            print("ERROR: pause_music - Check Spotify scopes (user-modify-playback-state) or Premium status.")
            raise Exception(f"Spotify API Forbidden (403): {e.reason}")
        elif e.http_status == 404:
            print("ERROR: pause_music - Device not found or not active for playback.")
            raise Exception(f"Spotify API Not Found (404): {e.reason}")
        else:
            raise Exception(f"Spotify API Error: {e.http_status} - {e.reason}")
    except Exception as e:
        print(f"ERROR: pause_music - An unexpected error occurred: {e}")
        raise Exception(f"Unexpected error during pause: {e}")