from .spotify_auth import sp

def ensure_active_playback():
    """Garante que há uma reprodução ativa antes de enviar comandos"""
    try:
        state = sp.current_playback()
        
        if not state or not state['is_playing']:
            print("⚠️ Nenhuma reprodução ativa. Iniciando uma temporária...")
            sp.start_playback(uris=["spotify:track:0VjIjW4GlUZAMYd2vXMi3b"])
            return False
        return True
    except Exception as e:
        print(f"🚨 Erro ao verificar estado: {e}")
        return False