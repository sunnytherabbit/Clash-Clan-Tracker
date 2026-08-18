# Clash Clan Tracker

Python Flask backend and Vite + React frontend for tracking a single Clash
Royale clan: clan overview, full member list with search/sort, and individual
player profiles.

## Running locally

You can test the production build locally without waiting for Render. The
backend serves the built `frontend/dist` files.

1. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Start the backend:
   ```bash
   cd ../flask-server
   python3 -m venv venv
   ./venv/bin/pip install -r requirements.txt
   ./venv/bin/python app.py
   ```
   The full app runs on `http://127.0.0.1:5000`.

3. After any frontend change, run `npm run build` again and refresh your
   browser. The backend will serve the new `dist` files automatically.

## Local vs Render configuration

`flask-server/.env` is **ignored by Git**, so your local config does not affect
Render and vice versa.

- **Default (local and Render):** `https://proxy.royaleapi.dev/v1` with a
  token whitelisted for the static proxy IP `45.79.218.79`.
- **If you have a static public IP and want to test without the proxy:** switch
  `flask-server/.env` to `https://api.clashroyale.com/v1` and use a token
  whitelisted for your current IP.

`render.yaml` sets the proxy and `CLAN_TAG` by default. You only need to add
`CLASH_ROYALE_TOKEN` and `SETTINGS_PASSWORD` in the Render dashboard.

## Configuration

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

The **Settings** tab in the UI requires `SETTINGS_PASSWORD` to make any change.
If the password is not set on the server, the configuration cannot be updated
through the UI.

## Features

- **Overview** — clan details, stats, top members by trophies and donations
  (scrollable lists to view all members).
- **Members** — full searchable, sortable clan member list. Click a member to
  open their profile.
- **Player** — player profile and battle log. Accessed by clicking any player
  name or visiting `/player/<tag>`.
- **Settings** — update API key, clan tag and API endpoint (password-protected).

## Deploying online (Render — free)

A `render.yaml` blueprint is included at the repository root. It builds the
frontend, installs the Python dependencies, and runs everything from one Flask
service on a free Render web instance.

1. Push this project to a GitHub / GitLab repo.
2. In Render, click **New +** → **Blueprint**, connect the repo, and use the
   `render.yaml`.
3. In the service environment variables, set:
   - `CLASH_ROYALE_TOKEN` — your proxy token (whitelist `45.79.218.79`).
   - `SETTINGS_PASSWORD` — a strong password for the Settings tab.
4. Render will build and deploy a single public URL (e.g.
   `https://clash-clan-tracker.onrender.com`).
5. Share that link.

Because `.env` is not committed, you can override it locally to test with the
official API if you have a static IP. The GitHub/Render version will use the
proxy.

## Verification

- Backend health: `curl http://127.0.0.1:5000/api/health`
- Clan: `curl http://127.0.0.1:5000/api/clan`
- Clan members: `curl http://127.0.0.1:5000/api/clan/members`
- Player: `curl http://127.0.0.1:5000/api/player/%23RY8LY`
- Player battles: `curl http://127.0.0.1:5000/api/player/%23RY8LY/battles`
- Update config: `curl -X POST -H "Content-Type: application/json" -d '{"password":"dev","token":"...","clan_tag":"#RY8LY"}' http://127.0.0.1:5000/api/config`
- Frontend lint: `cd frontend && npm run lint`
- Frontend build: `cd frontend && npm run build`
- Production preview: `cd frontend && npm run preview`
