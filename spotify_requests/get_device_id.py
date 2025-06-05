def get_device_id(sp):
    '''get the device id using the Spotify API'''
    try:
        devices = sp.devices()
        if devices['devices']:
            device_id = devices['devices'][0]['id']
            print(f"Device ID: {device_id}")
            return device_id
        else:
            print("No devices found.")
            return None
    except Exception as e:
        print(f"An error occurred while trying to get the device ID: {e}")
        return None
