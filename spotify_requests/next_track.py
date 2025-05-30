from .spotify_auth import sp
from .get_device_id import get_device_id

def next_track(device_id: str):
    if not device_id:
        print("❌ Não foi possível encontrar dispositivo!")
        return

    try:
        sp.next_track(device_id)
        print(f"⏭️ Próxima música no dispositivo {device_id[:5]}")
    except Exception as e:
        print(f"🚨 Erro ao avançar: {e}")

next_track(get_device_id())
