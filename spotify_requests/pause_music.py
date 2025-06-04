from .spotify_auth import sp
from .get_device_id import get_device_id

def pause_music(device_id: str):
    if not device_id:
        print("Device not found")
        return

    try:
        sp.pause_playback(device_id)
        print(f"Paused Music")
    except Exception as e:
        print(f"🚨 Error to pause: {e}")

pause_music(get_device_id())
