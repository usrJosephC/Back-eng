from flask import Flask, jsonify
from flask_cors import CORS
from spotify_requests.get_image import dict

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify(dict)

if __name__ == '__main__':
    app.run(debug=True)
    