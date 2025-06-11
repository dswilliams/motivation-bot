# Key Commands

## Prerequisites
- Node.js and npm installed.
- Python and pip installed.

## Steps to run the project
### Frontend (Next.js)
1. Navigate to the `web/` directory: `cd web/`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
   - The site will typically be available at `http://localhost:3000`.

### Backend (Netlify Functions - Local Emulation)
- Netlify functions can be tested locally using the Netlify CLI.
1. Install Netlify CLI: `npm install netlify-cli -g`
2. From the project root, run: `netlify dev`
   - This will start a local development server that emulates Netlify's environment, including functions.

## Steps to keep the project up to date on Github
1. Commit your changes: `git commit -m "Your commit message"`
2. Push to the remote repository: `git push origin main` (or your branch name)

## Dependencies
- Frontend dependencies are listed in `web/package.json`.
- Backend (Python) dependencies are listed in `requirements.txt`.

## Troubleshooting
- If `npm install` fails, try `npm cache clean --force` and then `npm install` again.
- If the Next.js server doesn't start, check for port conflicts or errors in the terminal output.
- For Netlify functions, ensure the Netlify CLI is correctly installed and authenticated.
