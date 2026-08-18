import os
from dotenv import load_dotenv, set_key
from flask import Flask
from flask_cors import CORS

DOTENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(DOTENV_PATH)

app = Flask(__name__)
CORS(app, supports_credentials=True)

CLASH_ROYALE_TOKEN = os.environ.get("CLASH_ROYALE_TOKEN", "")
CLASH_ROYALE_BASE_URL = "https://api.clashroyale.com/v1"
CLAN_TAG = os.environ.get("CLAN_TAG", "%23RY8LY")


def _encode_tag(tag):
    """Ensure a clan tag is URL-encoded (%23) for the Clash Royale API."""
    if tag.startswith("%23"):
        return tag
    if tag.startswith("#"):
        return "%23" + tag[1:]
    return "%23" + tag


def set_config(token=None, clan_tag=None):
    """Update the in-memory config and persist changes to .env."""
    global CLASH_ROYALE_TOKEN, CLAN_TAG

    if token is not None:
        CLASH_ROYALE_TOKEN = token
        set_key(DOTENV_PATH, "CLASH_ROYALE_TOKEN", token)

    if clan_tag is not None:
        CLAN_TAG = _encode_tag(clan_tag)
        set_key(DOTENV_PATH, "CLAN_TAG", CLAN_TAG)
