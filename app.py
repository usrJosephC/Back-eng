import os
from flask import Flask, jsonify, request, session, redirect, send_from_directory

from table.table import table

from spotify_requests.auth_manager import auth_manager
from spotify_requests.spotify_client import spotify_client
from spotify_requests.get_info import get_info
from spotify_requests.get_song_id import get_song_id
from spotify_requests.play_music import play_music
from spotify_requests.previous_track import previous_track
from spotify_requests.pause_music import pause_music
from spotify_requests.next_track import next_track
from spotify_requests.create_playlist import create_playlist

app = Flask(__name__, static_folder='frontend/build', static_url_path='')

app.secret_key = os.getenv('FLASK_SECRET_KEY')
app.config.update(
    SESSION_COOKIE_NAME='spotify_session', # name of the session cookie
    SESSION_COOKIE_HTTPONLY=True, # prevents JavaScript access to the cookie
    SESSION_COOKIE_SECURE=True,  # true since we use HTTPS, is secure
    SESSION_COOKIE_SAMESITE='Lax'  # prevents CSRF attacks
)

# custom error handlers
@app.errorhandler(ValueError)
def handle_value_error(error):
    '''handles ValueError exceptions and returns a JSON response'''
    return jsonify({'error': str(error), 'type': 'ValueError'}), 400

@app.errorhandler(KeyError)
def handle_key_error(error):
    '''handles KeyError exceptions and returns a JSON response'''
    return jsonify({'error': f'Missing key: {str(error)}', 'type': 'KeyError'}), 400

@app.errorhandler(Exception)
def handle_exception(error):
    '''generic error handler for unexpected errors'''
    return jsonify({'error': 'An unexpected error occurred', 'type': str(type(error).__name__)}), 500

# flask routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    '''serves the React app for any route that is not an API endpoint or a static file'''
    full_path = os.path.join(app.static_folder, path)

    if path != "" and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    else:
        # for every route that is not an API endpoint, serve the index.html file
        return send_from_directory(app.static_folder, 'index.html')
    
@app.route('/status', methods=['GET'])
def status():
    '''returns a simple status message to check if the server is running'''
    return jsonify({'status': 'Server is running'}), 200

@app.route('/api/login', methods=['GET'])
def login():
    '''redirects the user to Spotify's authentication page'''
    sp_oauth = auth_manager()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/api/callback', methods=['GET'])
def callback():
    '''handles the callback from Spotify after user authentication'''
    code = request.args.get('code')
    if not code:
        raise ValueError('No code provided in the callback request.')
 
    sp_oauth = auth_manager()
    token_info = sp_oauth.get_access_token(code)
    session['token_info'] = token_info

    # redirect to the frontend after successful authentication
    return redirect('https://divebackintime.onrender.com/#/selecionar')
    
@app.route('/api/token', methods=['GET'])
def send_token():
    '''returns the access token to the frontend if it exists in the session'''
    token_info = session.get('token_info', None)
    if token_info and 'access_token' in token_info:
        return jsonify(token_info), 200
    else:
        return jsonify({'error': 'No valid token found.'}), 401

@app.route('/api/device', methods=['POST'])
def receive_device_id():
    '''receives the device ID from the frontend and stores it for later use'''
    data = request.get_json()
    if not data:
        raise ValueError('No JSON body provided.')
    
    device_id = data.get('device_id')
    if not device_id:
        raise ValueError('No device ID provided in the request body.')
    
    # save the device ID in the session
    session['device_id'] = device_id
    print(f'DEBUG: Device ID stored in session: {device_id}')
    return jsonify({'message': 'Device ID stored successfully'}), 200

@app.route('/api/year', methods=['GET'])
def receive_year():
    '''receives the year from the frontend and returns the songs from that year until the end of the table'''
    year = request.args.get('year')
    if not year:
        raise ValueError('Year not provided')

    try:
        year_int = int(year)
    except ValueError as e:
        raise ValueError('Year must be an integer') from e

    if not (1946 <= year_int <= 2024):
        raise ValueError('Year must be between 1946 and 2024')

    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401

    _, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info

    result = get_info(year_int)
    session['year'] = year_int
    return jsonify(result)

@app.route('/api/play', methods=['GET'])
def play():
    '''plays the songs starting from the year provided by the user'''
    print(f'DEBUG: {session}')

    year_string = session.get('year')
    if year_string is None:
        raise ValueError('Year not set in session. Please select a year first.')
    
    try:
        chosen_year = int(year_string)
    except ValueError:
        return jsonify({'error': 'Year must be an integer'}), 400
    
    uris_list = get_song_id(chosen_year)
    
    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info

    device_id = session.get('device_id')
    if not device_id:
        return jsonify({'error': 'Device ID not set. Please set the device ID first.'}), 400
    # device_id = get_device_id(sp_client)

    play_music(sp_client, uris_list, device_id)
    return jsonify({'message': 'Music is playing!'}), 200
    
@app.route('/api/previous', methods=['GET'])
def previous():
    '''skips to the previous song in the list'''

    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info

    device_id = session.get('device_id')
    if not device_id:
        return jsonify({'error': 'Device ID not set. Please set the device ID first.'}), 400
    # device_id = get_device_id(sp_client)
  
    previous_track(sp_client, device_id)
    return jsonify({'message': 'Skipped to previous track'}), 200

@app.route('/api/pause', methods=['GET'])
def pause():
    '''pauses the currently playing song'''

    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info

    device_id = session.get('device_id')
    if not device_id:
        return jsonify({'error': 'Device ID not set. Please set the device ID first.'}), 400
    # device_id = get_device_id(sp_client)
    
    pause_music(sp_client, device_id)
    return jsonify({'message': 'Playback paused'}), 200
    
@app.route('/api/next', methods=['GET'])
def play_next():
    '''skips to the next song in the list'''
    
    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info

    device_id = session.get('device_id')
    if not device_id:
        return jsonify({'error': 'Device ID not set. Please set the device ID first.'}), 400
    # device_id = get_device_id(sp_client)

    next_track(sp_client, device_id)
    return jsonify({'message': 'Skipped to next track'}), 200

@app.route('/api/playlist', methods=['POST'])
def make_playlist():
    '''receives the years of songs from the frontend and creates a playlist with those songs'''

    data = request.get_json()
    if not data:
        raise ValueError('No JSON body provided.')
    
    years_of_songs = data.get('years')
    if not years_of_songs:
        raise ValueError('No years provided in the request body.')

    filtered = table[table['YEAR'].isin(years_of_songs)]
    songs_uri = filtered['URI'].tolist()

    # default code block to guarantee that the user is authenticated
    token_info = session.get('token_info')
    if not token_info:
        return jsonify({'error': 'User not authenticated. Please log in.'}), 401
    
    sp_client, new_token_info = spotify_client(token_info)
    session['token_info'] = new_token_info
    
    create_playlist(sp_client, 'Your time travel', songs_uri)
    return jsonify({'message': 'Playlist created successfully'}), 201

if __name__ == '__main__':
    app.run()
