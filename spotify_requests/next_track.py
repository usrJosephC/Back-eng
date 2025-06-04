from .spotify_auth import sp
from .get_device_id import get_device_id

def next_track(device_id: str):
    if not device_id:
        print("Device not found")
        return

    try:
        sp.next_track(device_id)
        print(f"Next Track{device_id[:5]}")
    except Exception as e:
        print(f"🚨 Erro to advance: {e}")

next_track(get_device_id())
