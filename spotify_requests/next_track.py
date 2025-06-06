def next_track(sp, device_id: str):
    '''skip to the next track on the Spotify device'''
    if not device_id:
        print("An error occurred: No device ID found.")
        return

    try:
        sp.next_track(device_id)
    except Exception as e:
        print(f"An error occurred while trying to skip to the next track: {e}")
