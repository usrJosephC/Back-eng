from flask import Flask, jsonify, request
from flask_cors import CORS
from spotify_requests.create_playlist import create_playlist
from spotify_requests.get_info import get_info
from table.table import table
from spotify_requests.play_music import play_music
from spotify_requests.spotify_auth import sp

app = Flask(__name__)
CORS(app)

device_id_storage = {id: None}

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Servidor está rodando!'}), 200

@app.route('/auth-token', methods=['GET'])
def get_auth_token():
    """Envia o token de acesso para o frontend criar o Web Playback SDK"""
    try:
        token_info = sp.auth_manager.get_access_token()
        if token_info:
            return jsonify({'access_token': token_info['access_token']}), 200
        else:
            return jsonify({'error': 'Não foi possível obter o token'}), 500
    except Exception as e:
        return jsonify({'error': f'Erro ao obter token: {str(e)}'}), 500


@app.route('/device', methods=['POST'])
def set_device_id():
    """Recebe o device ID do frontend"""
    data = request.get_json()
    device_id = data.get('device_id')

    if not device_id:
        return jsonify({'error': 'Device ID not provided'}), 400

    device_id_storage["id"] = device_id
    return jsonify({'message': 'Device ID stored successfully'}), 200

@app.route('/year', methods=['POST'])
def receive_year():
    """Recebe o ano do usuário e retorna informações das músicas do ano até 2024"""
    data = request.get_json()
    year = data.get('year')

    if not year:
        return jsonify({'error': 'Year not provided'}), 400

    try:
        year = int(year)
    except ValueError:
        return jsonify({'error': 'Year must be an integer'}), 400

    # Usa a função original get_info que já filtra do ano até o final
    result = get_info(year)
    return jsonify(result)

@app.route('/playlist', methods=['POST'])
def make_playlist():
    """Recebe as músicas do usuário e cria uma playlist"""
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
