import os
from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
import requests
import markdown
from datetime import datetime
from gtts import gTTS
import tempfile
from dotenv import load_dotenv
import google.generativeai as genai
from openai import OpenAI
from huggingface_hub import InferenceClient
import logging
import re
import threading
from uuid import uuid4
from pydub import AudioSegment

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Create a directory for audio files if it doesn't exist
AUDIO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'audio')
os.makedirs(AUDIO_DIR, exist_ok=True)

# API configurations
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')

# Initialize clients
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
genai.configure(api_key=GOOGLE_API_KEY) if GOOGLE_API_KEY else None
huggingface_client = InferenceClient(token=HUGGINGFACE_API_KEY) if HUGGINGFACE_API_KEY else None

def get_motivational_response(user_input, provider):
    """Get a motivational response from the selected LLM provider"""
    prompt = f"""Please provide a motivational and actionable response to the following situation, limited to 500 words:
    {user_input}
    
    Requirements:
    1. Be motivational and uplifting
    2. Include specific, actionable steps
    3. End with a fun "This Day in History" fact
    4. Use markdown formatting for better readability
    5. Keep the tone positive and encouraging
    """
    
    try:
        if provider == 'perplexity':
            headers = {
                "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "sonar",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000
            }
            response = requests.post("https://api.perplexity.ai/chat/completions", headers=headers, json=data)
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        elif provider == 'openai':
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000
            )
            return response.choices[0].message.content
        elif provider == 'gemini':
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text
        elif provider == 'huggingface':
            response = huggingface_client.text_generation(
                prompt,
                max_new_tokens=1000,
                temperature=0.7,
                return_full_text=False
            )
            return response
        else:
            return "Invalid provider selected"
    except Exception as e:
        logger.error(f"Error getting response from {provider}: {str(e)}")
        return f"Error getting response from {provider}: {str(e)}"

def text_to_speech(text, lang='en'):
    """Convert text to speech using gTTS"""
    try:
        # Create a unique filename based on timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"motivation_{timestamp}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)
        
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(filepath)
        logger.debug(f"Audio file saved to: {filepath}")
        return filename
    except Exception as e:
        logger.error(f"Error in text-to-speech: {str(e)}")
        return None

def markdown_to_plain_text(md):
    # Convert markdown to HTML, then strip HTML tags
    html = markdown.markdown(md)
    # Remove HTML tags
    text = re.sub('<[^<]+?>', '', html)
    return text

def split_text(text, max_length=900):
    # Split text into chunks without breaking words
    words = text.split()
    chunks = []
    current = ""
    for word in words:
        if len(current) + len(word) + 1 > max_length:
            chunks.append(current)
            current = word
        else:
            if current:
                current += " "
            current += word
    if current:
        chunks.append(current)
    return chunks

def text_to_speech_async(text, lang, audio_id):
    """Background TTS generation for long texts."""
    try:
        plain_text = markdown_to_plain_text(text)
        chunks = split_text(plain_text, max_length=900)
        audio_segments = []
        for i, chunk in enumerate(chunks):
            tts = gTTS(text=chunk, lang=lang, slow=False)
            temp_path = os.path.join(AUDIO_DIR, f"{audio_id}_part{i}.mp3")
            tts.save(temp_path)
            audio_segments.append(AudioSegment.from_file(temp_path))
            os.remove(temp_path)  # Clean up temp file

        combined = audio_segments[0]
        for seg in audio_segments[1:]:
            combined += seg

        final_path = os.path.join(AUDIO_DIR, f"{audio_id}.mp3")
        combined.export(final_path, format="mp3")
        logger.debug(f"Audio file saved to: {final_path}")
    except Exception as e:
        logger.error(f"Error in async text-to-speech: {str(e)}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_motivation', methods=['POST'])
def get_motivation():
    user_input = request.json.get('text', '')
    provider = request.json.get('provider', 'perplexity')
    api_key = request.json.get('api_key', '')

    # Set the API key for the selected provider
    if provider == 'perplexity':
        global PERPLEXITY_API_KEY
        PERPLEXITY_API_KEY = api_key
    elif provider == 'openai':
        global OPENAI_API_KEY
        OPENAI_API_KEY = api_key
        global openai_client
        openai_client = OpenAI(api_key=api_key)
    elif provider == 'gemini':
        global GOOGLE_API_KEY
        GOOGLE_API_KEY = api_key
        genai.configure(api_key=api_key)
    elif provider == 'huggingface':
        global HUGGINGFACE_API_KEY
        HUGGINGFACE_API_KEY = api_key
        global huggingface_client
        huggingface_client = InferenceClient(token=api_key)

    try:
        response = get_motivational_response(user_input, provider)
    except Exception as e:
        response = f"Error: {str(e)}"

    # Remove reference markers like [1], [2], etc.
    response = re.sub(r'\[\d+\]', '', response)

    # No audio generation here!
    return jsonify({
        'text': response
    })

@app.route('/generate_audio', methods=['POST'])
def generate_audio():
    text = request.json.get('text', '')
    audio_id = str(uuid4())
    threading.Thread(target=text_to_speech_async, args=(text, 'en', audio_id), daemon=True).start()
    return jsonify({'audio_id': audio_id})

@app.route('/audio_status/<audio_id>')
def audio_status(audio_id):
    filepath = os.path.join(AUDIO_DIR, f"{audio_id}.mp3")
    if os.path.exists(filepath):
        return jsonify({'ready': True})
    else:
        return jsonify({'ready': False})

@app.route('/audio/<audio_id>.mp3')
def serve_audio(audio_id):
    try:
        filename = f"{audio_id}.mp3"
        logger.debug(f"Attempting to serve audio file: {filename}")
        return send_from_directory(AUDIO_DIR, filename)
    except Exception as e:
        logger.error(f"Error serving audio file: {str(e)}")
        return str(e), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001)