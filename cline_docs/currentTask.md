# Current Task

## Objective
Implement the API key input field and resolve the `react-markdown` dependency error.

## Context
The user identified that an API key input field was missing from the frontend. Additionally, there was a `Module not found: Can't resolve 'react-markdown'` error when running the site locally.

## Next Steps
- All identified issues have been addressed.

## Completed Tasks
- Implemented API key input field in `web/components/ProviderSelector.tsx`.
- Updated `web/src/app/page.tsx` to manage and pass the API key.
- Updated `web/components/MotivationForm.tsx` to accept and use the API key in API calls.
- Modified `netlify/functions/get_motivation.py` to dynamically use the passed API key and handle the Mistral provider.
- Installed `react-markdown` in the `web/` directory to resolve the dependency error.
