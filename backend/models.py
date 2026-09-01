from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_validator


class MessageItem(BaseModel):
    role: str = Field(..., description="Message sender role: 'user' or 'assistant'")
    content: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User prompt message")
    model: str = Field(default="spiderman", description="Selected model: 'spiderman' or 'base'")
    compare: bool = Field(default=False, description="Whether to query both fine-tuned and base models concurrently")
    history: Optional[List[MessageItem]] = Field(default=None, description="Previous conversation turns")

    @field_validator("message")
    @classmethod
    def validate_message_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be empty or contain only whitespace.")
        return stripped

    @field_validator("model")
    @classmethod
    def validate_model_name(cls, v: str) -> str:
        if v not in ("spiderman", "base"):
            raise ValueError("Model must be 'spiderman' or 'base'.")
        return v


class LatencyMs(BaseModel):
    tuned: Optional[int] = None
    base: Optional[int] = None


class ChatResponse(BaseModel):
    tuned: Optional[str] = None
    base: Optional[str] = None
    latency_ms: LatencyMs


class HealthResponse(BaseModel):
    status: str
    gemini_reachable: bool = True
    ollama_reachable: Optional[bool] = True
    models_available: Dict[str, bool]
