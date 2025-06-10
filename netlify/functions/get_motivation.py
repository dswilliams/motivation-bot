import os
import json
import requests
import markdown
import re
from dotenv import load_dotenv
import google.generativeai as genai
from openai import OpenAI
from huggingface_hub import InferenceClient
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

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

def handler(event, context):
    try:
        body = json.loads(event['body'])
        user_input = body.get('text', '')
        provider = body.get('provider', 'perplexity')
        api_key = body.get('api_key', '')

        # Set the API key for the selected provider
        # Note: In a real Netlify Function, it's better to use Netlify Environment Variables
        # for API keys rather than passing them in the request body.
        # For this example, we'll use the passed key for demonstration.
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

        response_text = get_motivational_response(user_input, provider)
        response_text = re.sub(r'\[\d+\]', '', response_text) # Remove reference markers

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', # CORS for local testing
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'text': response_text})
        }
    except Exception as e:
        logger.error(f"Error in Netlify function: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'error': str(e)})
        }
