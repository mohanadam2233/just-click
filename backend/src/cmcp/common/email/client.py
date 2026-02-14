from __future__ import annotations

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional


class SMTPEmailClient:
    def __init__(self, *, host: str, port: int, username: str, password: str, use_tls: bool = True):
        self.host = host
        self.port = int(port)
        self.username = username
        self.password = password
        self.use_tls = bool(use_tls)

    def send_html(
        self,
        *,
        from_email: str,
        from_name: Optional[str],
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
    ) -> None:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{from_email}>" if from_name else from_email
        msg["To"] = to_email

        if text_body:
            msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP(self.host, self.port, timeout=30) as server:
            server.ehlo()
            if self.use_tls:
                server.starttls()
                server.ehlo()
            server.login(self.username, self.password)
            server.sendmail(from_email, [to_email], msg.as_string())