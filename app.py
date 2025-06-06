import os
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from spotify_requests.create_playlist import create_playlist
from spotify_requests.get_info import get_info
from table.table import table
from spotify_requests.play_music import play_music
from spotify_requests.spotify_auth import spotify_auth
from spotify_requests.get_song_id import get_song_id
from spotify_requests.get_device_id import get_device_id
from spotify_requests.previous_track import previous_track
from spotify_requests.pause_music import pause_music
from spotify_requests.next_track import next_track

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.urandom(24)  # Generate a random secret key for session management

sp_auth = spotify_auth()

@app.route('/', methods=['GET'])
def index():
    '''returns a message to check if the server is running'''
    return jsonify({'message': 'Server is running!'}), 200

@app.route('/login', methods=['POST'])
def send_token(sp=sp_auth):
    '''sends the access token to the frontend so it can create the Spotify player'''
    try:
        token_info = sp.auth_manager.get_access_token()
        if token_info:
            return jsonify({'access_token': token_info['access_token']}), 201
        else:
            return jsonify({'error': 'Token could not be found.'}), 500
    except Exception as e:
        return jsonify({'error': f'An error {e} occurred while trying to get the token.'}), 500


@app.route('/device', methods=['POST'])
def receive_device_id():
    '''receives the device ID from the frontend and stores it for later use'''
    data = request.get_json()
    device_id = data.get('device_id')

    if not device_id:
        return jsonify({'error': 'Device ID not provided'}), 400
    
    # save the device ID in the session
    session['device_id'] = device_id
    return jsonify({'message': 'Device ID stored successfully'}), 200

@app.route('/year', methods=['POST'])
def receive_year():
    '''receives the year from the frontend and returns the songs from that year until the end of the table'''
    data = request.get_json()
    year = data.get('year')
    session['year'] = year

    if not year:
        return jsonify({'error': 'Year not provided'}), 400

    try:
        year = int(year)
    except ValueError:
        return jsonify({'error': 'Year must be an integer'}), 400

    # uses the get_info function to retrieve songs from the specified year
    if 1946 <= year <= 2024:
        result = get_info(sp_auth, year)
    else:
        return jsonify({'error': 'Year must be between 1946 and 2024'}), 400

    return jsonify(result)

@app.route('/play', methods=['GET'])
def play():
    '''plays the songs starting from the year provided by the user'''

    songs = get_song_id(session.get('year'))

    uris_list = [f'spotify:track:{track_id}' for track_id in songs.values()]
    # device_id = session.get('device_id')
    device_id = get_device_id(sp_auth)

    try:
        play_music(sp_auth, uris_list, device_id)
        return jsonify({'message': 'Music is playing!'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while trying to play music: {e}'}), 500
    
@app.route('/previous', methods=['GET'])
def play_previous():
    '''skips to the previous song in the list'''

    # device_id = session.get('device_id')
    device_id = get_device_id(sp_auth)
    try:
        previous_track(sp_auth, device_id)
        return jsonify({'message': 'Skipped to previous track'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while trying to skip to previous track: {e}'}), 500

@app.route('/pause', methods=['GET'])
def pause_current():
    '''pauses the currently playing song'''

    # device_id = session.get('device_id')
    device_id = get_device_id(sp_auth)
    try:
        pause_music(sp_auth, device_id)
        return jsonify({'message': 'Playback paused'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while trying to pause playback: {e}'}), 500
    
@app.route('/next', methods=['GET'])
def play_next():
    '''skips to the next song in the list'''
    
    # device_id = session.get('device_id')
    device_id = get_device_id(sp_auth)
    try:
        next_track(sp_auth, device_id)
        return jsonify({'message': 'Skipped to next track'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while trying to skip to next track: {e}'}), 500

@app.route('/playlist', methods=['POST'])
def make_playlist():
    '''receives the years of songs from the frontend and creates a playlist with those songs'''
    data = request.get_json()
    years_of_songs = data.get('chosen_years')
    if not years_of_songs:
        return jsonify({'error': 'No songs provided'}), 400

    filtered = table[table['YEAR'].isin(years_of_songs)]
    songs_uri = filtered['URI'].tolist()
    
    try:
        create_playlist(sp_auth, 'Your time travel', songs_uri)
        return jsonify({'message': 'Playlist created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
