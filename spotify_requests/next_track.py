import spotipy

class SpotifyPlaybackError(Exception):
    """custom exception for Spotify playback errors."""

def next_track(sp, device_id: str):
    '''skips to the next track on the given Spotify device.'''
    
    if not device_id:
        print("DEBUG: next_track - Missing device ID.")
        raise ValueError("No device ID provided to skip to next track.")

    try:
        print(f"DEBUG: next_track - Attempting to skip to next track on device_id: {device_id}")
        sp.next_track(device_id=device_id)
        print("DEBUG: next_track - Successfully skipped to next track.")

    except spotipy.SpotifyException as e:
        print(f"ERROR: next_track - Spotify API error: {e}")

        if e.http_status == 403:
            print("ERROR: next_track - Forbidden. Check Premium status and playback permissions.")
            raise SpotifyPlaybackError(f"Spotify API Forbidden (403): {e.reason}") from e

        elif e.http_status == 404:
            print("ERROR: next_track - Device not found or inactive.")
            raise SpotifyPlaybackError(f"Spotify API Not Found (404): {e.reason}") from e

        else:
            raise SpotifyPlaybackError(f"Spotify API Error {e.http_status}: {e.reason}") from e

    except Exception as e:
        print(f"ERROR: next_track - Unexpected error: {e}")
        raise SpotifyPlaybackError(f"Unexpected error while skipping to next track: {e}") from e
