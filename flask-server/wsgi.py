"""WSGI entry point for Render / Gunicorn.

Importing `app` registers the routes; `application` is the Flask app object.
"""
import app as _  # noqa: F401
import config

application = config.app
