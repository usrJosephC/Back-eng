def get_device_id(sp):
    '''Obtém o primeiro dispositivo disponível do Spotify'''
    try:
        devices = sp.devices().get('devices', [])
        
        if not devices:
            print("⚠️ Nenhum dispositivo encontrado! Por favor:")
            print("1. Abra o Spotify Web Player")
            print("2. Comece a tocar qualquer música manualmente")
            print("3. Tente novamente em 10 segundos")
            return None
        
        # Tenta encontrar um dispositivo ativo primeiro
        active_devices = [d for d in devices if d.get('is_active')]
        if active_devices:
            return active_devices[0]['id']
        
        # Retorna o primeiro dispositivo disponível
        return devices[0]['id']
    
    except Exception as e:
        print(f"🚨 Erro ao buscar dispositivos: {e}")
        return None
    