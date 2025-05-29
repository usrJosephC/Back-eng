from flask import Flask, jsonify, request
from flask_cors import CORS
from spotify_requests.create_playlist import create_playlist
from spotify_requests.get_info import get_info
from table.table import table
from spotify_requests.play_music import play_music
from spotify_requests.pause_music import pause_music
from spotify_requests.next_track import next_track
from spotify_requests.previous_track import previous_track

app = Flask(__name__)
CORS(app)

@app.route('/year', methods=['POST'])
def receive_year():
    '''receives the year from the user and returns a dictionary with the song'''
    data = request.get_json()
    year = data.get('year')

    if not year:
        return jsonify({'error': 'Year not provided'}), 400

    try:
        year = int(year)
    except ValueError:
        return jsonify({'error': 'Year must be an integer'}), 400

    result = get_info(year)
    return jsonify(result)

@app.route('/playlist', methods=['POST'])
def make_playlist():
    '''receives the songs from the user and creates a playlist'''
    data = request.get_json()
    years_of_songs = data.get('chosen_years')
    if not years_of_songs:
        return jsonify({'error': 'No songs provided'}), 400

    filtered = table[table['YEAR'].isin(years_of_songs)]
    songs_uri = filtered['URI'].tolist()
    
    try:
        create_playlist('Your time travel', songs_uri)
        return jsonify({'message': 'Playlist created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)

# rota pra receber o ID do dispositivo do front

device_id_storage = {"id": None}

@app.route('/device', methods=['POST'])
def set_device_id():
    data = request.get_json()
    device_id = data.get('device_id')

    if not device_id:
        return jsonify({'error': 'Device ID not provided'}), 400

    device_id_storage["id"] = device_id
    return jsonify({'message': 'Device ID stored successfully'})

# rota para tocar música



@app.route('/play', methods=['POST'])
def play():
    data = request.get_json()
    uris = data.get('uris')

    if not uris or not isinstance(uris, list):
        return jsonify({'error': 'URIs must be provided as a list'}), 400

    device_id = device_id_storage.get("id")
    if not device_id:
        return jsonify({'error': 'No device ID registered'}), 400

    play_music(uris, device_id)
    return jsonify({'message': 'Playback started'})

# rota para pausar a musica

@app.route('/pause', methods=['POST'])
def pause():
    device_id = device_id_storage.get("id")
    if not device_id:
        return jsonify({'error': 'No device ID registered'}), 400

    pause_music(device_id)
    return jsonify({'message': 'Playback paused'})

#rota pra passar ou voltar a música

@app.route('/next', methods=['POST'])
def next_song():
    device_id = device_id_storage.get("id")
    if not device_id:
        return jsonify({'error': 'No device ID registered'}), 400

    next_track(device_id)
    return jsonify({'message': 'Skipped to next track'})

@app.route('/previous', methods=['POST'])
def previous_song():
    device_id = device_id_storage.get("id")
    if not device_id:
        return jsonify({'error': 'No device ID registered'}), 400

    previous_track(device_id)
    return jsonify({'message': 'Returned to previous track'})

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Servidor está rodando!'}), 200