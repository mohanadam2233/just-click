FROM python:3.12-slim

WORKDIR /app

# system deps (psycopg2-binary usually fine, but keep build essentials minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
  && rm -rf /var/lib/apt/lists/*

# install python deps first (better caching)
COPY requirements.txt /app/requirements.txt
COPY pyproject.toml /app/pyproject.toml

RUN pip install --no-cache-dir -U pip \
 && pip install --no-cache-dir -r requirements.txt \
 && pip install --no-cache-dir -e .

# copy source (in dev compose we mount anyway, but keep for build correctness)
COPY src /app/src

EXPOSE 9000

# DEV-friendly: run gunicorn (stable) and bind all interfaces
# If you use flask-socketio/eventlet, we can swap command later
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:9000", "cmcp:create_app()"]
