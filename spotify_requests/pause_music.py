def pause_music(sp, device_id: str):
    '''pause the music on the Spotify device'''
    if not device_id:
        print("An error occurred: No device ID found.")
        return

    try:
        sp.pause_playback(device_id)
    except Exception as e:
        print(f"An error occurred while trying to pause the music: {e}")
