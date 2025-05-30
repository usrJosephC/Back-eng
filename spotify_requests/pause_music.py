from .spotify_auth import sp
from .get_device_id import get_device_id
from .player_state import ensure_active_playback  # 👈 Novo

def pause_music(device_id: str = None):
    device_id = device_id or get_device_id()
    if not device_id:
        print("❌ Dispositivo não encontrado!")
        return

    try:
        # Só pausa se estiver tocando
        if ensure_active_playback():
            sp.pause_playback(device_id=device_id)
            print(f"⏸️ Música pausada")
    except Exception as e:
        print(f"🚨 Erro ao pausar: {e}")