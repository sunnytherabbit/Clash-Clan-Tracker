# Clash Clan Tracker

Python Flask backend and Vite + React frontend that fetches the Clash Royale
`currentriverrace` endpoint for clan `#RY8LY`, plus clan info, clan members and
individual player profiles.

## Running locally

1. Start the backend:
   ```bash
   cd flask-server
   python3 -m venv venv
   ./venv/bin/pip install -r requirements.txt
   ./venv/bin/python app.py
   ```
   The backend runs on `http://127.0.0.1:5000`.

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.

## Configuration

The app uses the **RoyaleAPI proxy** by default (`https://proxy.royaleapi.dev/v1`).
To use it, create a Clash Royale API key with the proxy IP whitelisted:
`45.79.218.79`.

Settings are stored in `flask-server/.env`:

```env
CLASH_ROYALE_TOKEN=your_bearer_token
CLASH_ROYALE_BASE_URL=https://proxy.royaleapi.dev/v1
CLAN_TAG=%23RY8LY
SETTINGS_PASSWORD=a_strong_password
```

The default `flask-server/.env` is already populated and is ignored by Git. The
local default password is `dev` — **change it for production**.

### Settings page security

The **Settings** tab in the UI now requires `SETTINGS_PASSWORD` to make any
change. If the password is not set on the server, the configuration cannot be
updated through the UI. This prevents visitors from changing your API key, clan
or endpoint.

## Features

- **Overview** — current river race, top participants, race leaderboard.
- **Participants** — full river race participant table.
- **Race** — full race leaderboard.
- **Clan** — clan details and member list. Click a member to open their profile.
- **Player** — player profile, upcoming chests and battle log. Accessed by
  clicking any player name or visiting `/player/<tag>`.
- **Settings** — update API key, clan tag and API endpoint (password-protected).

## Deploying online (Render — free)

A `render.yaml` blueprint is included at the repository root. It builds the
frontend, installs the Python dependencies, and runs everything from one Flask
service on a free Render web instance.

1. Push this project to a GitHub / GitLab repo.
2. In Render, click **New +** → **Blueprint**, connect the repo, and use the
   `render.yaml`.
3. In the service environment variables, set:
   - `CLASH_ROYALE_TOKEN` — your bearer token (whitelist `45.79.218.79` in the
     Clash Royale dev portal for the proxy).
   - `SETTINGS_PASSWORD` — a strong password for the Settings tab.
4. Render will build and deploy a single public URL (e.g.
   `https://clash-clan-tracker.onrender.com`).
5. Share that link — it serves the React app and the `/api/*` routes from the
   same host.

## Verification

- Backend health: `curl http://127.0.0.1:5000/api/health`
- River race: `curl http://127.0.0.1:5000/api/riverrace`
- Clan: `curl http://127.0.0.1:5000/api/clan`
- Clan members: `curl http://127.0.0.1:5000/api/clan/members`
- Player: `curl http://127.0.0.1:5000/api/player/%23RY8LY`
- Player chests: `curl http://127.0.0.1:5000/api/player/%23RY8LY/chests`
- Player battles: `curl http://127.0.0.1:5000/api/player/%23RY8LY/battles`
- Update config: `curl -X POST -H "Content-Type: application/json" -d '{"password":"dev","token":"...","clan_tag":"#RY8LY"}' http://127.0.0.1:5000/api/config`
- Frontend lint: `cd frontend && npm run lint`
- Frontend build: `cd frontend && npm run build`
- Production preview: `cd frontend && npm run preview`
