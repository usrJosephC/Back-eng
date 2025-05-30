from .spotify_auth import sp
from .get_device_id import get_device_id
from .player_state import ensure_active_playback  

def previous_track(device_id: str = None):
    device_id = device_id or get_device_id()
    if not device_id:
        print("❌ Dispositivo não encontrado!")
        return

    try:
        # Verifica estado antes de agir
        if not ensure_active_playback():
            return
            
        # Obtém a posição atual
        playback = sp.current_playback()
        position_ms = playback['progress_ms']
        
        # Se estiver nos primeiros 3 segundos, volta para a anterior
        if position_ms < 3000:
            sp.previous_track(device_id=device_id)
            print(f"⏮️ Voltando para música anterior")
        else:
            # Reinicia a atual
            sp.seek_track(0, device_id=device_id)
            print(f"⏪ Reiniciando música atual")
            
    except Exception as e:
        print(f"🚨 Erro ao voltar: {e}")