# Codebase Summary

## Key Components and Their Interactions
- **`web/` directory**: Contains the Next.js frontend application.
  - `web/src/app/page.tsx`: Main page component.
  - `web/components/MotivationForm.tsx`: Component for user input.
  - `web/components/ProviderSelector.tsx`: Component for selecting LLM providers.
- **`netlify/functions/` directory**: Contains Netlify serverless functions.
  - `netlify/functions/get_motivation.py`: Python function to interact with LLMs.
- **`motivation_bot.py`**: Likely a core Python script for motivation generation logic.
- **`app.py`**: Potentially a Flask or similar Python application, or related to local development/testing.
- **`netlify.toml`**: Netlify configuration file for deployment.

## Data Flow
1. User interacts with the Next.js frontend (`web/`).
2. Frontend makes API calls to Netlify functions (e.g., `get_motivation.py`).
3. Netlify functions interact with external LLM providers.
4. LLM responses are processed and sent back to the frontend.
5. Frontend displays motivation and handles audio playback.

## External Dependencies
- **Node.js/npm**: For the Next.js frontend (managed via `package.json` in `web/`).
- **Python/pip**: For Netlify functions and `motivation_bot.py` (managed via `requirements.txt`).
- **LLM Provider APIs**: External APIs like OpenAI, Anthropic, etc.

## Recent Significant Changes
- Initial project setup.

## User Feedback Integration and Its Impact on Development
- N/A (No user feedback integrated yet)
