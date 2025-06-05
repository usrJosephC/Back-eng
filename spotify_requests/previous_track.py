from .spotify_auth import sp
from .get_device_id import get_device_id

def previous_track(device_id: str):
    if not device_id:
        print("❌ Dispositivo não encontrado!")
        return

    try:
        sp.previous_track(device_id=device_id)
        print(f"⏮️ Voltando para música anterior")
    except Exception as e:
        print(f"🚨 Erro ao voltar: {e}")

previous_track(get_device_id())
