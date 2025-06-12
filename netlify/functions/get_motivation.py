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

# API configurations (These will now be passed dynamically)
# PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')
# OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
# GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
# HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')

# Initialize clients (These will be initialized with passed API keys)
# openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
# genai.configure(api_key=GOOGLE_API_KEY) if GOOGLE_API_KEY else None
# huggingface_client = InferenceClient(token=HUGGINGFACE_API_KEY) if HUGGINGFACE_API_KEY else None

def get_motivational_response(user_input, provider, api_key):
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
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "sonar",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000
            }
            logger.debug(f"Perplexity API request headers: {headers}")
            logger.debug(f"Perplexity API request data: {data}")
            response = requests.post("https://api.perplexity.ai/chat/completions", headers=headers, json=data)
            response.raise_for_status()
            logger.debug(f"Perplexity API response: {response.json()}")
            return response.json()['choices'][0]['message']['content']
        elif provider == 'openai':
            openai_client = OpenAI(api_key=api_key)
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000
            )
            return response.choices[0].message.content
        elif provider == 'mistral':
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "mistral-tiny", # or appropriate model for mistral
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000
            }
            response = requests.post("https://api.mistral.ai/v1/chat/completions", headers=headers, json=data)
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        elif provider == 'gemini':
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text
        elif provider == 'huggingface':
            huggingface_client = InferenceClient(token=api_key)
            response = huggingface_client.text_generation(
                prompt,
                max_new_tokens=1000,
                temperature=0.7,
                return_full_text=False
            )
            return response
        else:
            return "Invalid provider selected"
    except requests.exceptions.HTTPError as http_err:
        logger.error(f"HTTP error for {provider}: {http_err}")
        logger.error(f"Response status code: {http_err.response.status_code}")
        logger.error(f"Response body: {http_err.response.text}")
        return f"HTTP error from {provider}: {http_err.response.text}"
    except Exception as e:
        logger.error(f"Error getting response from {provider}: {str(e)}")
        return f"Error getting response from {provider}: {str(e)}"

def handler(event, context):
    try:
        body = json.loads(event['body'])
        user_input = body.get('text', '')
        provider = body.get('provider', 'perplexity')
        api_key = body.get('apiKey', '')
        logger.debug(f"Received request for provider: {provider}, API Key (first 5 chars): {api_key[:5]}...")
        logger.debug(f"User input: {user_input}")

        response_text = get_motivational_response(user_input, provider, api_key)
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
