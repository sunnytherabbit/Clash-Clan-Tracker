import os
import time
from flask import jsonify, request, send_from_directory
import requests
import config

CACHE_TTL = 60
_cache = {"data": None, "expires": 0}


def _dist_dir():
    return os.environ.get(
        "FRONTEND_DIST",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    )


def _serve_index():
    dist = _dist_dir()
    index = os.path.join(dist, "index.html")
    if os.path.exists(index):
        return send_from_directory(dist, "index.html")
    return jsonify({"status": "ok", "mode": "api"}), 200


def get_riverrace_url():
    return f"{config.CLASH_ROYALE_BASE_URL}/clans/{config.CLAN_TAG}/currentriverrace"


def clear_cache():
    _cache["data"] = None
    _cache["expires"] = 0


def fetch_riverrace():
    """Fetch the current river race, with a short in-memory cache."""
    now = time.time()
    if now < _cache["expires"] and _cache["data"] is not None:
        return _cache["data"]

    if not config.CLASH_ROYALE_TOKEN:
        raise RuntimeError("CLASH_ROYALE_TOKEN is not configured")

    headers = {"Authorization": f"Bearer {config.CLASH_ROYALE_TOKEN}"}
    response = requests.get(get_riverrace_url(), headers=headers, timeout=10)
    response.raise_for_status()

    data = response.json()
    _cache["data"] = data
    _cache["expires"] = now + CACHE_TTL
    return data


@config.app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@config.app.route("/api/config", methods=["POST", "PUT"])
def update_config():
    body = request.get_json(silent=True) or {}
    token = body.get("token")
    clan_tag = body.get("clan_tag")

    try:
        config.set_config(
            token=token if token != "" else None,
            clan_tag=clan_tag if clan_tag != "" else None,
        )
        clear_cache()
        return jsonify({
            "status": "ok",
            "clan_tag": config.CLAN_TAG,
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to save config", "message": str(e)}), 500


@config.app.route("/api/riverrace", methods=["GET"])
def riverrace():
    try:
        data = fetch_riverrace()
        return jsonify(data), 200
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        message = e.response.text or str(e)
        return jsonify({"error": "Clash Royale API error", "message": message}), status
    except RuntimeError as e:
        return jsonify({"error": "Configuration error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Server error", "message": str(e)}), 500


# Serve the built Vite frontend. Must be defined after all API routes.
@config.app.route("/", defaults={"path": ""}, methods=["GET"])
@config.app.route("/<path:path>", methods=["GET"])
def catch_all(path):
    dist = _dist_dir()
    requested = os.path.join(dist, path)
    if path and os.path.exists(requested) and os.path.isfile(requested):
        return send_from_directory(dist, path)
    return _serve_index()


if __name__ == "__main__":
    config.app.run(debug=True, port=5000)
