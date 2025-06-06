from flask import Flask, jsonify, request, session
from flask_cors import CORS
# from spotify_requests.create_playlist import create_playlist
# from spotify_requests.get_info import get_info
# from table.table import table
from spotify_requests.play_music import play_music
from spotify_requests.spotify_auth import spotify_auth

app = Flask(__name__)
CORS(app, supports_credentials=True)

sp_auth = spotify_auth()

@app.route('/', methods=['GET'])
def index():
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
def get_device_id():
    '''receives the device ID from the frontend and stores it for later use'''
    data = request.get_json()
    device_id = data.get('device_id')

    if not device_id:
        return jsonify({'error': 'Device ID not provided'}), 400
    
    # save the device ID in the session
    session['device_id'] = device_id
    return jsonify({'message': 'Device ID stored successfully'}), 200

# @app.route('/year', methods=['POST'])
# def receive_year():
#     """Recebe o ano do usuário e retorna informações das músicas do ano até 2024"""
#     data = request.get_json()
#     year = data.get('year')

#     if not year:
#         return jsonify({'error': 'Year not provided'}), 400

#     try:
#         year = int(year)
#     except ValueError:
#         return jsonify({'error': 'Year must be an integer'}), 400

#     # Usa a função original get_info que já filtra do ano até o final
#     result = get_info(year)
#     return jsonify(result)

@app.route('/play', methods=['POST'])
def play():
    '''receives a list of song URIs and plays them on the specified device'''
   
    songs = [
    '0HPD5WQqrq7wPWR7P7Dw1i',
    '1c8gk2PeTE04A1pIDH9YMk',
    '60nZcImufyMA1MKQY3dcCH',
    '50kpGaPAhYJ3sGmk6vplg0'
    ]

    uris_list = [f'spotify:track:{track_id}' for track_id in songs]
    device_id = session.get('device_id')

    try:
        play_music(sp_auth, uris_list, device_id)
    except Exception as e:
        return jsonify({'error': f'An error occurred while trying to play music: {e}'}), 500

# @app.route('/playlist', methods=['POST'])
# def make_playlist():
#     """Recebe as músicas do usuário e cria uma playlist"""
#     data = request.get_json()
#     years_of_songs = data.get('chosen_years')
#     if not years_of_songs:
#         return jsonify({'error': 'No songs provided'}), 400

#     filtered = table[table['YEAR'].isin(years_of_songs)]
#     songs_uri = filtered['URI'].tolist()
    
#     try:
#         create_playlist('Your time travel', songs_uri)
#         return jsonify({'message': 'Playlist created successfully'}), 201
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
