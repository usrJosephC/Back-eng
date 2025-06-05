from flask import Flask, jsonify, request
from flask_cors import CORS
from spotify_requests.create_playlist import create_playlist
from spotify_requests.get_info import get_info
from table.table import table
from spotify_requests.play_music import play_music
from spotify_requests.spotify_auth import sp

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

@app.route('/send_token', methods=['POST'])
def send_token():
    '''sends the token to the frontend'''
    token = sp.auth_manager.get_cached_token()

    if not token:
        return jsonify({'error': 'No token cached'}), 401
    
    return jsonify({'token': token['access_token']}), 200

@app.route('/play', methods=['POST'])
def play():
    '''play music using the Spotify API'''
    data = request.get_json()
    device_id = data.get('device_id')

    if not device_id:
        return jsonify({'error': 'Device ID não encontrado para este usuário'}), 404

    try:
        play_music('spotify:track:50kpGaPAhYJ3sGmk6vplg0', device_id)
        return jsonify({'status': 'Playback iniciado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
    