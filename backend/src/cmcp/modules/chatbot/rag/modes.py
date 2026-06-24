from __future__ import annotations

import re

RE_QNA = re.compile(
    r"\b(generate[\s_]questions?[\s_]and[\s_]answers?|questions?[\s_]and[\s_]answers?|q\s*(?:&|and)\s*a)\b",
    re.IGNORECASE,
)
RE_QUIZ = re.compile(
    r"\b(quiz+(?:e|z)?|generate[\s_]quiz+(?:e|z)?|make[\s_]quiz+(?:e|z)?|test[\s_]me|mcq|practice[\s_](?:test|questions?))\b",
    re.IGNORECASE,
)
RE_SUMMARY = re.compile(
    r"\b(summar(?:y|ize|ise|ized?)|overview|recap|brief|chapter[\s_]summary)\b",
    re.IGNORECASE,
)


def detect_mode(question: str) -> str:
    if RE_QNA.search(question):
        return "qna"
    if RE_QUIZ.search(question):
        return "quiz"
    if RE_SUMMARY.search(question):
        return "summary"
    return "chat"
