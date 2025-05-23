from flask import Flask, jsonify, request
from flask_cors import CORS
from spotify_requests.get_info import get_info

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
    
if __name__ == '__main__':
    app.run(debug=True)
    