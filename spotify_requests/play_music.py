import spotipy

class SpotifyPlaybackError(Exception):
    """Custom exception for Spotify playback errors."""
    pass

def play_music(sp, uris: list[str], device_id: str):
    '''Plays music on the given Spotify device using the specified URIs.'''
    if not device_id:
        print("DEBUG: play_music - Missing device ID.")
        raise ValueError("No device ID provided for playback.")

    if not uris:
        print("DEBUG: play_music - No URIs provided.")
        raise ValueError("No track URIs provided to play.")

    try:
        print(f"DEBUG: play_music - Starting playback on device_id: {device_id}")
        sp.start_playback(
            device_id=device_id,
            context_uri=None,
            uris=uris,
            offset=None,
            position_ms=None
        )
        print("DEBUG: play_music - Playback started.")

    except spotipy.SpotifyException as e:
        print(f"ERROR: play_music - Spotify API error: {e}")

        if e.http_status == 403:
            print("ERROR: play_music - Forbidden. Check Premium status and playback permissions.")
            raise SpotifyPlaybackError(f"Spotify API Forbidden (403): {e.reason}") from e
        
        elif e.http_status == 404:
            print("ERROR: play_music - Device not found or inactive.")
            raise SpotifyPlaybackError(f"Spotify API Not Found (404): {e.reason}") from e
        
        else:
            raise SpotifyPlaybackError(f"Spotify API Error {e.http_status}: {e.reason}") from e
        
    except Exception as e:
        print(f"ERROR: play_music - Unexpected error: {e}")
        raise SpotifyPlaybackError(f"Unexpected error during playback: {e}") from e
