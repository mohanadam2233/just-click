from __future__ import annotations

from typing import Any, Dict
from jinja2 import Environment, FileSystemLoader, select_autoescape


def build_renderer(*, templates_dir: str) -> Environment:
    return Environment(
        loader=FileSystemLoader(templates_dir),
        autoescape=select_autoescape(["html", "xml"]),
    )


def render_template(env: Environment, template_name: str, payload: Dict[str, Any]) -> str:
    tmpl = env.get_template(template_name)
    return tmpl.render(**(payload or {}))