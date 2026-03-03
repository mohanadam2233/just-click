FROM python:3.12-slim

WORKDIR /app

# pg_isready + redis-cli
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    redis-tools \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -U pip \
 && pip install --no-cache-dir -r /app/requirements.txt

COPY pyproject.toml /app/pyproject.toml
COPY src /app/src
COPY migrations /app/migrations
COPY scripts/entrypoint.sh /app/scripts/entrypoint.sh

ENV PYTHONPATH=/app/src

RUN chmod +x /app/scripts/entrypoint.sh

EXPOSE 7000
ENTRYPOINT ["/app/scripts/entrypoint.sh"]