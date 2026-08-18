# Clash Clan Tracker

Python Flask backend and Vite + React frontend that fetches the Clash Royale
`currentriverrace` endpoint for clan `#RY8LY`.

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

The API key and clan tag can be changed from the **Settings** tab in the UI or
by editing `flask-server/.env`:

```env
CLASH_ROYALE_TOKEN=your_bearer_token
CLAN_TAG=%23RY8LY
```

The default `flask-server/.env` is already populated and is ignored by Git.

## Deploying online (Render — free)

A `render.yaml` blueprint is included at the repository root. It builds the
frontend, installs the Python dependencies, and runs everything from one Flask
service on a free Render web instance.

1. Push this project to a GitHub / GitLab repo.
2. In Render, click **New +** → **Blueprint**, connect the repo, and use the
   `render.yaml`.
3. In the service environment variables, set `CLASH_ROYALE_TOKEN` to your
   bearer token.
4. Render will build and deploy a single public URL (e.g.
   `https://clash-clan-tracker.onrender.com`).
5. Share that link — it serves the React app and the `/api/*` routes from the
   same host.

### Important: IP whitelisting

The Clash Royale API key is IP-restricted. Render free services use a shared
outbound IP range. You must either:

- Add Render's outbound IP range for your chosen region to the API key's
  allowed IPs in the Clash Royale developer portal, or
- Use a token that already allows the Render server's outbound IP.

If you want a dedicated, static IP, Google Cloud's Always Free `e2-micro` VM is
another free option; you can reserve a free static IP and run the same Flask app
behind Caddy for HTTPS.

## Verification

- Backend health: `curl http://127.0.0.1:5000/api/health`
- Backend river race: `curl http://127.0.0.1:5000/api/riverrace`
- Update config: `curl -X POST -H "Content-Type: application/json" -d '{"token":"...","clan_tag":"#RY8LY"}' http://127.0.0.1:5000/api/config`
- Frontend lint: `cd frontend && npm run lint`
- Frontend build: `cd frontend && npm run build`
- Production preview: `cd frontend && npm run preview`
