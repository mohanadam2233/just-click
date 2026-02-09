# wsgi.py
from cmcp import create_app

app = create_app()
application = app  # for gunicorn / hosting
