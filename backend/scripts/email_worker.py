# scripts/email_worker.py

import os

os.environ.setdefault("CMCP_SKIP_CHATBOT_WARMUP", "1")
os.environ.setdefault("ANONYMIZED_TELEMETRY", "False")
os.environ.setdefault("CHROMA_TELEMETRY", "FALSE")

from cmcp.common.email.email_worker import run_email_worker_forever


if __name__ == "__main__":
    run_email_worker_forever()
