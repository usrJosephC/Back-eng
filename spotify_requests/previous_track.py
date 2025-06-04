from .spotify_auth import sp
from .get_device_id import get_device_id

def previous_track(device_id: str):
    if not device_id:
        print("Device not found!")
        return

    try:
        sp.previous_track(device_id=device_id)
        print(f"Returning to the last music")
    except Exception as e:
        print(f"Error to return: {e}")

previous_track(get_device_id())
