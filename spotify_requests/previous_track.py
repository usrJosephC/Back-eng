from .spotify_auth import sp

def previous_track(device_id):
    try:
        sp.previous_track(device_id=device_id)
        print("Previous track.")
    except Exception as e:
        print(f"Error going to previous track: {e}")