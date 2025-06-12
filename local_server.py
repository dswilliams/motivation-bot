from flask import Flask, request, jsonify
from flask_cors import cross_origin # Import cross_origin
from netlify.functions.get_motivation import handler
import os
import json
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/api/get_motivation', methods=['POST', 'OPTIONS']) # Add OPTIONS for preflight requests
@cross_origin() # Enable CORS for this specific route
def get_motivation_api():
    print("get_motivation_api function called!") # Debug print statement
    try:
        # Mock Netlify event object
        event = {
            'body': request.data.decode('utf-8'),
            'headers': dict(request.headers)
        }
        context = {} # Not used by our handler, but required by Netlify signature

        response = handler(event, context)
        
        # Flask expects a tuple (response_body, status_code, headers)
        return jsonify(json.loads(response['body'])), response['statusCode'], response['headers']
    except Exception as e:
        logger.error(f"Error in local Flask server: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Ensure the virtual environment's Python is used
    # This might be tricky to enforce directly in the script,
    # but the user should activate the venv before running this script.
    app.run(debug=True, port=5000) # Run on a different port to avoid conflict with Next.js
