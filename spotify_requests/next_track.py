from .spotify_auth import sp

def next_track(device_id):
    try:
        sp.next_track(device_id=device_id)
        print("Next track.")
    except Exception as e:
        print(f"Error skipping to next track: {e}")