import os
from flask import Flask, jsonify, request, session, redirect
from flask_cors import CORS

from table.table import table

from spotify_requests.auth_manager import auth_manager
from spotify_requests.spotify_client import spotify_client
from spotify_requests.get_info import get_info
# from spotify_requests.get_device_id import get_device_id
from spotify_requests.get_song_id import get_song_id
from spotify_requests.play_music import play_music
from spotify_requests.previous_track import previous_track
from spotify_requests.pause_music import pause_music
from spotify_requests.next_track import next_track
from spotify_requests.create_playlist import create_playlist

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'https://divebackintime.onrender.com'], 
                    supports_credentials=True)
app.secret_key = os.getenv('FLASK_SECRET_KEY')
app.config.update(
    SESSION_COOKIE_NAME='spotify_session', # name of the session cookie
    SESSION_COOKIE_HTTPONLY=True, # prevents JavaScript access to the cookie
    SESSION_COOKIE_SECURE=True,  # true since we use HTTPS, is secure
    SESSION_COOKIE_SAMESITE='None'  # since our frontend and backend are on different domains
)

@app.route('/', methods=['GET'])
def index():
    '''returns a message to check if the server is running'''
    return jsonify({'message': 'Server is running!'}), 200

@app.route('/login', methods=['GET'])
def login():
    '''redirects the user to Spotify's authentication page'''
    sp_oauth = auth_manager()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/callback', methods=['GET'])
def callback():
    '''handles the callback from Spotify after user authentication'''
    code = request.args.get('code')
    if not code:
        return jsonify({'error': 'No code provided'}), 400

    try:
        sp_oauth = auth_manager()
        token_info = sp_oauth.get_access_token(code)
        session['token_info'] = token_info
        return redirect('https://divebackintime.onrender.com')  # redirect to the frontend after successful authentication
    except Exception as e:
        return jsonify({'error': f'An error occurred during authentication: {e}'}), 500
    
# @app.route('/success', methods=['GET'])
# def success():
#     '''returns a success message after successful authentication'''
#     return jsonify({'message': 'Authentication successful! You can now close this tab.'}), 200
    
@app.route('/token', methods=['GET'])
def send_token():
    '''returns the access token to the frontend if it exists in the session'''
    token_info = session.get('token_info', None)
    if token_info and 'access_token' in token_info:
        return jsonify({'access_token': token_info['access_token']}), 200
    else:
        return jsonify({'error': 'No valid token found.'}), 401

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

@app.route('/year', methods=['GET'])
def receive_year():
    '''receives the year from the frontend and returns the songs from that year until the end of the table'''
    year = request.args.get('year')
    session['year'] = year

    if not year:
        return jsonify({'error': 'Year not provided'}), 400

    try:
        year = int(year)
    except ValueError:
        return jsonify({'error': 'Year must be an integer'}), 400
    
    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info

    # uses the get_info function to retrieve songs from the specified year
    if 1946 <= year <= 2024:
        result = get_info(sp_client, year)
    else:
        return jsonify({'error': 'Year must be between 1946 and 2024'}), 400

    return jsonify(result)

@app.route('/play', methods=['GET'])
def play():
    '''plays the songs starting from the year provided by the user'''

    songs = get_song_id(session.get('year'))

    uris_list = [f'spotify:track:{track_id}' for track_id in songs.values()]
    
    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info

    device_id = session.get('device_id')
    # device_id = get_device_id(sp_client)

    try:
        play_music(sp_client, uris_list, device_id)
        return jsonify({'message': 'Music is playing!'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while trying to play music: {e}'}), 500
    
@app.route('/previous', methods=['GET'])
def previous():
    '''skips to the previous song in the list'''

    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info

    device_id = session.get('device_id')
    # device_id = get_device_id(sp_client)

    try:
        previous_track(sp_client, device_id)
        return jsonify({'message': 'Skipped to previous track'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while trying to skip to previous track: {e}'}), 500

@app.route('/pause', methods=['GET'])
def pause():
    '''pauses the currently playing song'''

    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info

    device_id = session.get('device_id')
    # device_id = get_device_id(sp_client)

    try:
        pause_music(sp_client, device_id)
        return jsonify({'message': 'Playback paused'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while trying to pause playback: {e}'}), 500
    
@app.route('/next', methods=['GET'])
def play_next():
    '''skips to the next song in the list'''
    
    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info

    device_id = session.get('device_id')
    # device_id = get_device_id(sp_client)

    try:
        next_track(sp_client, device_id)
        return jsonify({'message': 'Skipped to next track'}), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred while trying to skip to next track: {e}'}), 500

@app.route('/playlist', methods=['POST'])
def make_playlist():
    '''receives the years of songs from the frontend and creates a playlist with those songs'''
    data = request.get_json()
    years_of_songs = data.get('years')
    if not years_of_songs:
        return jsonify({'error': 'No songs provided'}), 400

    filtered = table[table['YEAR'].isin(years_of_songs)]
    songs_uri = filtered['URI'].tolist()

    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info
    
    try:
        create_playlist(sp_client, 'Your time travel', songs_uri)
        return jsonify({'message': 'Playlist created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
