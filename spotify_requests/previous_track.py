import spotipy

class SpotifyPlaybackError(Exception):
    """custom exception for Spotify playback errors."""

def previous_track(sp, device_id: str):
    '''skips to the previous track on the given Spotify device.'''
    
    if not device_id:
        print("DEBUG: previous_track - Missing device ID.")
        raise ValueError("No device ID provided to skip to previous track.")

    try:
        print(f"DEBUG: previous_track - Attempting to skip to previous track on device_id: {device_id}")
        sp.previous_track(device_id=device_id)
        print("DEBUG: previous_track - Successfully skipped to previous track.")

    except spotipy.SpotifyException as e:
        print(f"ERROR: previous_track - Spotify API error: {e}")

        if e.http_status == 403:
            print("ERROR: previous_track - Forbidden. Check Premium status and playback permissions.")
            raise SpotifyPlaybackError(f"Spotify API Forbidden (403): {e.reason}") from e

        elif e.http_status == 404:
            print("ERROR: previous_track - Device not found or inactive.")
            raise SpotifyPlaybackError(f"Spotify API Not Found (404): {e.reason}") from e

        else:
            raise SpotifyPlaybackError(f"Spotify API Error {e.http_status}: {e.reason}") from e

    except Exception as e:
        print(f"ERROR: previous_track - Unexpected error: {e}")
        raise SpotifyPlaybackError(f"Unexpected error while skipping to previous track: {e}") from e
