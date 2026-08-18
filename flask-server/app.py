import os
import re
import time
import threading
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import quote
from flask import jsonify, request, send_from_directory
import requests
import config

CACHE_TTL = 60
ASSET_DATA_BASE = "https://royaleapi.github.io/cr-api-data/json"
ASSET_IMG_BASE = "https://royaleapi.github.io/cr-api-assets"


class _Cache:
    def __init__(self, ttl=CACHE_TTL):
        self._store = {}
        self._ttl = ttl
        self._lock = threading.Lock()

    def get(self, key):
        with self._lock:
            entry = self._store.get(key)
            if entry and time.time() < entry["expires"]:
                return entry["data"]
            return None

    def set(self, key, data, ttl=None):
        with self._lock:
            self._store[key] = {
                "data": data,
                "expires": time.time() + (ttl if ttl is not None else self._ttl),
            }

    def clear(self):
        with self._lock:
            self._store.clear()


_cache = _Cache()


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


def _cr_url(endpoint):
    return f"{config.CLASH_ROYALE_BASE_URL}{endpoint}"


def _auth_headers():
    if not config.CLASH_ROYALE_TOKEN:
        raise RuntimeError("CLASH_ROYALE_TOKEN is not configured")
    return {"Authorization": f"Bearer {config.CLASH_ROYALE_TOKEN}"}


def _cr_get(endpoint, params=None, cache_key=None, cache_ttl=CACHE_TTL, use_cache=True):
    if use_cache and cache_key:
        cached = _cache.get(cache_key)
        if cached is not None:
            return cached

    headers = _auth_headers()
    response = requests.get(_cr_url(endpoint), headers=headers, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()

    if use_cache and cache_key:
        _cache.set(cache_key, data, cache_ttl)
    return data


def _cr_get_paginated(endpoint, params=None, cache_key=None):
    cached = _cache.get(cache_key) if cache_key else None
    if cached is not None:
        return cached

    headers = _auth_headers()
    merged_params = dict(params or {})
    merged_params.setdefault("limit", 100)
    all_items = []
    after = None

    while True:
        if after:
            merged_params["after"] = after
        elif "after" in merged_params and not after:
            del merged_params["after"]

        response = requests.get(_cr_url(endpoint), headers=headers, params=merged_params, timeout=10)
        response.raise_for_status()
        data = response.json()

        items = data.get("items") or []
        all_items.extend(items)

        paging = data.get("paging") or {}
        cursors = paging.get("cursors") or {}
        after = cursors.get("after")
        if not after or not items:
            break

    result = {"items": all_items}
    if cache_key:
        _cache.set(cache_key, result)
    return result


def clear_cache():
    _cache.clear()


def _fetch_asset_json(name):
    url = f"{ASSET_DATA_BASE}/{name}.json"
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    return response.json()


def _build_badge_map():
    cached = _cache.get("assets:badges")
    if cached is not None:
        return cached

    data = _fetch_asset_json("alliance_badges")
    mapping = {}
    for badge in data:
        if "id" in badge and "name" in badge:
            mapping[str(badge["id"])] = f"{ASSET_IMG_BASE}/badges/{badge['name']}.png"

    _cache.set("assets:badges", mapping, ttl=86400)
    return mapping


def _build_arena_map():
    cached = _cache.get("assets:arenas")
    if cached is not None:
        return cached

    data = _fetch_asset_json("arenas")
    mapping = {}
    for arena in data:
        if "id" in arena and "arena" in arena:
            mapping[str(arena["id"])] = f"{ASSET_IMG_BASE}/arenas/arena{arena['arena']}.png"

    _cache.set("assets:arenas", mapping, ttl=86400)
    return mapping


def _build_cards_map():
    cached = _cache.get("assets:cards")
    if cached is not None:
        return cached

    data = _fetch_asset_json("cards")
    mapping = {}
    for card in data:
        if "id" in card:
            mapping[str(card["id"])] = card.get("iconUrls", {}).get("medium", "")

    _cache.set("assets:cards", mapping, ttl=86400)
    return mapping


def _build_league_map():
    cached = _cache.get("assets:leagues")
    if cached is not None:
        return cached

    base_paths = [
        os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "leagues"),
        os.path.join(_dist_dir(), "leagues"),
    ]

    name_to_num = {
        "Master I": "1",
        "Master II": "2",
        "Master III": "3",
        "Champion": "4",
        "Grand Champion": "5",
        "Royal Champion": "6",
        "Ultimate Champion": "7",
    }

    mapping = {}
    seen = set()
    numbered_pattern = re.compile(r"^League(\d+)\.(?:webp|png|jpg|jpeg)$", re.IGNORECASE)

    for base in base_paths:
        if not os.path.isdir(base):
            continue
        for filename in os.listdir(base):
            if not os.path.isfile(os.path.join(base, filename)):
                continue
            if filename in seen:
                continue
            seen.add(filename)

            number = None
            number_match = numbered_pattern.match(filename)
            if number_match:
                number = number_match.group(1)
            else:
                stem = os.path.splitext(filename)[0]
                number = name_to_num.get(stem)

            if number:
                safe_name = quote(filename)
                mapping[number] = f"/leagues/{safe_name}"

    _cache.set("assets:leagues", mapping, ttl=86400)
    return mapping


def fetch_riverrace():
    """Fetch the current river race, with a short in-memory cache."""
    return _cr_get(
        f"/clans/{config.CLAN_TAG}/currentriverrace",
        cache_key="riverrace",
    )


def fetch_clan():
    return _cr_get(
        f"/clans/{config.CLAN_TAG}",
        cache_key="clan",
        cache_ttl=300,
    )


def fetch_clan_members():
    return _cr_get_paginated(
        f"/clans/{config.CLAN_TAG}/members",
        cache_key="clan_members",
    )


def _extract_member_elo(player):
    pol = player.get("currentPathOfLegendSeasonResult") or {}
    arena = pol.get("arena") or player.get("arena") or {}
    return {
        "elo": pol.get("trophies"),
        "leagueNumber": pol.get("leagueNumber"),
        "leagueName": arena.get("name"),
        "trophies": player.get("trophies"),
    }


def fetch_member_elos():
    cached = _cache.get("clan_members:elo")
    if cached is not None:
        return cached

    members = fetch_clan_members()
    tags = [m["tag"] for m in members.get("items", []) if m.get("tag")]

    result = {}

    def fetch_one(tag):
        try:
            player = fetch_player(tag)
            result[tag] = _extract_member_elo(player)
        except Exception:
            result[tag] = {
                "elo": None,
                "leagueNumber": None,
                "leagueName": None,
                "trophies": None,
            }

    with ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(fetch_one, tags)

    _cache.set("clan_members:elo", result, ttl=300)
    return result


def fetch_player(tag):
    encoded = config._encode_tag(tag)
    return _cr_get(
        f"/players/{encoded}",
        cache_key=f"player:{encoded}:profile",
        cache_ttl=300,
    )


def fetch_player_battles(tag):
    encoded = config._encode_tag(tag)
    return _cr_get(
        f"/players/{encoded}/battlelog",
        cache_key=f"player:{encoded}:battles",
        cache_ttl=60,
    )


@config.app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@config.app.route("/api/assets/badges", methods=["GET"])
def assets_badges():
    try:
        return jsonify(_build_badge_map()), 200
    except Exception as e:
        return jsonify({"error": "Asset error", "message": str(e)}), 502


@config.app.route("/api/assets/arenas", methods=["GET"])
def assets_arenas():
    try:
        return jsonify(_build_arena_map()), 200
    except Exception as e:
        return jsonify({"error": "Asset error", "message": str(e)}), 502


@config.app.route("/api/assets/cards", methods=["GET"])
def assets_cards():
    try:
        return jsonify(_build_cards_map()), 200
    except Exception as e:
        return jsonify({"error": "Asset error", "message": str(e)}), 502


@config.app.route("/api/assets/leagues", methods=["GET"])
def assets_leagues():
    try:
        return jsonify(_build_league_map()), 200
    except Exception as e:
        return jsonify({"error": "Asset error", "message": str(e)}), 502


@config.app.route("/api/config", methods=["POST", "PUT"])
def update_config():
    body = request.get_json(silent=True) or {}
    password = body.get("password")
    token = body.get("token")
    clan_tag = body.get("clan_tag")
    base_url = body.get("base_url")

    try:
        config.set_config(
            password=password,
            token=token if token != "" else None,
            clan_tag=clan_tag if clan_tag != "" else None,
            base_url=base_url if base_url != "" else None,
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


@config.app.route("/api/clan", methods=["GET"])
def clan():
    try:
        data = fetch_clan()
        return jsonify(data), 200
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        message = e.response.text or str(e)
        return jsonify({"error": "Clash Royale API error", "message": message}), status
    except RuntimeError as e:
        return jsonify({"error": "Configuration error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Server error", "message": str(e)}), 500


@config.app.route("/api/clan/members", methods=["GET"])
def clan_members():
    try:
        data = fetch_clan_members()
        return jsonify(data), 200
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        message = e.response.text or str(e)
        return jsonify({"error": "Clash Royale API error", "message": message}), status
    except RuntimeError as e:
        return jsonify({"error": "Configuration error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Server error", "message": str(e)}), 500


@config.app.route("/api/clan/members/elo", methods=["GET"])
def clan_members_elo():
    try:
        data = fetch_member_elos()
        return jsonify(data), 200
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        message = e.response.text or str(e)
        return jsonify({"error": "Clash Royale API error", "message": message}), status
    except RuntimeError as e:
        return jsonify({"error": "Configuration error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Server error", "message": str(e)}), 500


@config.app.route("/api/player/<string:tag>", methods=["GET"])
def player(tag):
    try:
        data = fetch_player(tag)
        return jsonify(data), 200
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        message = e.response.text or str(e)
        return jsonify({"error": "Clash Royale API error", "message": message}), status
    except RuntimeError as e:
        return jsonify({"error": "Configuration error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Server error", "message": str(e)}), 500


@config.app.route("/api/player/<string:tag>/battles", methods=["GET"])
def player_battles(tag):
    try:
        data = fetch_player_battles(tag)
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
