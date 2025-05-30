from .spotify_auth import sp
from .get_device_id import get_device_id

def pause_music(device_id: str):
    if not device_id:
        print("❌ Dispositivo não encontrado!")
        return

    try:
        sp.pause_playback(device_id)
        print(f"⏸️ Música pausada")
    except Exception as e:
        print(f"🚨 Erro ao pausar: {e}")

pause_music(get_device_id())
