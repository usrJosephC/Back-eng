import sys
import os


# Configurar caminhos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


from spotify_requests.get_device_id import get_device_id


if __name__ == "__main__":
    device_id = get_device_id()
    if device_id:
        print(f"\n✅ Device ID: {device_id}")
        # Salvar para uso futuro
        with open('.device_id', 'w') as f:
            f.write(device_id)
    else:
        print("\n❌ No devices found")