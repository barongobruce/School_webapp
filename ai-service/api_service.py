"""Authenticated FastAPI bridge for the SchoolWeb server."""

import hmac
import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

from app import (  # noqa: E402
    api_key,
    ask_ai_tutor,
    generate_flashcards,
    generate_lesson,
    generate_quiz,
    generate_study_plan,
)

app = FastAPI(title="AI Tutor Service", docs_url=None, redoc_url=None)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class StudentProfile(BaseModel):
    name: str = Field(default="Student", max_length=100)
    grade: str = Field(default="N/A", max_length=50)
    age: int | str = "N/A"
    language: Literal["English", "Kiswahili", "Sheng"] = "English"
    learning_style: str = Field(default="General", max_length=50)
    favorite_subject: str = Field(default="General", max_length=80)
    weak_subject: str = Field(default="General", max_length=160)
    subject: str = Field(default="General", max_length=160)
    strand: str = Field(default="General", max_length=100)
    sub_strand: str = Field(default="General", max_length=100)
    learning_outcome: str = Field(default="General", max_length=200)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    student: StudentProfile
    messages: list[ChatMessage] = Field(default_factory=list, max_length=12)


class ToolRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=160)
    student: StudentProfile
    difficulty: Literal["Easy", "Medium", "Hard"] = "Medium"
    stats: dict[str, int | float] = Field(default_factory=dict)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/internal/chat")
def chat(payload: ChatRequest, authorization: str | None = Header(default=None)):
    expected = os.environ.get("AI_TUTOR_SERVICE_TOKEN", "")
    supplied = authorization.removeprefix("Bearer ") if authorization else ""
    if not expected or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI provider is not configured")

    reply = ask_ai_tutor(
        question=payload.question.strip(),
        student=payload.student.model_dump(),
        messages=[message.model_dump() for message in payload.messages],
    )
    return {"reply": reply}


@app.post("/internal/tools/{kind}")
def learning_tool(
    kind: Literal["quiz", "lesson", "flashcards", "study-plan"],
    payload: ToolRequest,
    authorization: str | None = Header(default=None),
):
    expected = os.environ.get("AI_TUTOR_SERVICE_TOKEN", "")
    supplied = authorization.removeprefix("Bearer ") if authorization else ""
    if not expected or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI provider is not configured")

    student = payload.student.model_dump()
    topic = payload.topic.strip()
    if kind == "quiz":
        result = generate_quiz(topic, student, payload.difficulty)
        if (
            not isinstance(result, list)
            or len(result) != 5
            or any(
                not isinstance(item, dict)
                or not isinstance(item.get("question"), str)
                or not isinstance(item.get("options"), list)
                or item.get("answer") not in item.get("options", [])
                for item in result
            )
        ):
            raise HTTPException(status_code=502, detail="Could not generate the quiz")
    elif kind == "lesson":
        result = generate_lesson(topic, student)
    elif kind == "flashcards":
        result = generate_flashcards(topic, student)
        if (
            not isinstance(result, list)
            or len(result) != 10
            or any(
                not isinstance(card, dict)
                or not isinstance(card.get("question"), str)
                or not isinstance(card.get("answer"), str)
                or "jumbled" in card.get("answer", "").lower()
                or "try generating" in card.get("answer", "").lower()
                for card in result
            )
        ):
            raise HTTPException(status_code=502, detail="Could not generate flashcards")
    else:
        student["weak_subject"] = topic
        result = generate_study_plan(student, payload.stats)

    if isinstance(result, str) and (
        result.startswith("AI Tutor is having trouble")
    ):
        raise HTTPException(status_code=502, detail="Could not generate learning material")
    if result is None or result == "":
        raise HTTPException(status_code=502, detail="Could not generate learning material")

    return {"result": result}
