from __future__ import annotations

STRICT_RULES = (
    "Answer only from the provided material context.\n"
    "Do not use outside knowledge.\n"
    "If the material does not contain the answer, say the material does not cover it."
)


def build_chat_prompt(*, context: str, history: str, question: str, material_title: str) -> tuple[str, str]:
    system = (
        f"You are a strict academic tutor helping a student with: {material_title}.\n"
        f"{STRICT_RULES}"
    )
    user = f"""Context:
{context}

Chat History:
{history}

Question: {question}

Rules:
- Use Markdown.
- Keep paragraphs short.
- Cite sources inline like [Source: filename.pdf].
- If the answer is not in the context, say the material does not cover it."""
    return system, user


def build_summary_prompt(*, context: str, material_title: str) -> tuple[str, str]:
    system = f"You are a strict academic tutor for {material_title}.\n{STRICT_RULES}"
    user = f"""Write a structured summary from this material content.

Include:
## Overview
## Key Concepts
## Key Takeaways

Content:
{context}"""
    return system, user


def build_quiz_prompt(*, context: str, material_title: str) -> tuple[str, str]:
    system = f"You are a strict academic tutor for {material_title}.\n{STRICT_RULES}"
    user = f"""Generate a 10-question multiple-choice quiz from this content.

Use this exact format:
**Q1.** Question text

A) Option
B) Option
C) Option
D) Option

After all questions add:
---ANSWER KEY---
Q1: A

Content:
{context}"""
    return system, user


def build_qna_prompt(*, context: str, material_title: str) -> tuple[str, str]:
    system = f"You are a strict academic tutor for {material_title}.\n{STRICT_RULES}"
    user = f"""Generate 10 open-ended questions with full answers from this content.

Use this exact format:
**Q1.** Question text

**Answer:** Detailed answer.

Content:
{context}"""
    return system, user
