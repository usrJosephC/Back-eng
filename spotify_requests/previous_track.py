def previous_track(sp, device_id: str):
    '''go to the previous track on the Spotify device'''
    if not device_id:
        print("An error occurred: No device ID found.")
        return

    try:
        sp.previous_track(device_id=device_id)
    except Exception as e:
        print(f"Error while trying to go to the previous track: {e}")
