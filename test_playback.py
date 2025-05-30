from spotify_requests import play_music, pause_music, next_track, previous_track
import time

# Configuração
TEST_URIS = [
    "spotify:track:0VjIjW4GlUZAMYd2vXMi3b",  # Blinding Lights
    "spotify:track:39LLxExYz6ewLAcYrzQQyP",   # Levitating
    "spotify:track:3USxtqRwSYz57Ewm6wWRMp"    # Heat Waves
]

def main():
    print("🚀 Iniciando teste de playback completo...")
    
    # 1. Teste play - agora com verificação de estado
    print("\n1. Testando play...")
    play_music.play_music(TEST_URIS[:1])
    time.sleep(5)  # Espera adicional
    
    # 2. Teste next
    print("\n2. Testando next track...")
    next_track.next_track()
    time.sleep(5)
    
    # 3. Teste previous - agora com lógica inteligente
    print("\n3. Testando previous track...")
    previous_track.previous_track()
    time.sleep(5)
    
    # 4. Teste pause - só funciona se estiver tocando
    print("\n4. Testando pause...")
    pause_music.pause_music()
    time.sleep(2)
    
    # 5. Teste play com múltiplas URIs
    print("\n5. Testando playlist...")
    play_music.play_music(TEST_URIS)
    time.sleep(5)
    
    # 6. Teste next durante playlist
    print("\n6. Testando next em playlist...")
    next_track.next_track()
    
    print("\n✅ Todos os testes completados!")