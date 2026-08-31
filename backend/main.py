import os
import json
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

# Ensure backend directory is in sys.path for direct imports
sys.path.insert(0, str(Path(__file__).parent))

from models import ChatRequest, ChatResponse, LatencyMs, HealthResponse
from ollama_client import OllamaClient, OllamaServiceError

from contextlib import asynccontextmanager

ollama_client = OllamaClient()

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await ollama_client.aclose()

app = FastAPI(
    title="Spider-Man SLM Assistant API",
    description="Backend API for serving fine-tuned Qwen 2.5 1.5B Spider-Man model and comparison with base model.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"

# Static files for loss curve PNGs and metrics
if DATA_DIR.exists():
    app.mount("/data", StaticFiles(directory=str(DATA_DIR)), name="data")


@app.exception_handler(OllamaServiceError)
async def ollama_service_error_handler(request: Request, exc: OllamaServiceError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )


from fastapi.encoders import jsonable_encoder

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": jsonable_encoder(exc.errors())}
    )



@app.get("/api/health", response_model=HealthResponse)
async def get_health():
    reachable, models = await ollama_client.check_health()
    all_present = reachable and models.get("spiderman", False) and models.get("base", False)
    
    overall_status = "ok" if all_present else ("degraded" if reachable else "down")
    response_content = {
        "status": overall_status,
        "ollama_reachable": reachable,
        "models_available": models
    }

    if not all_present:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=response_content
        )

    return response_content


from guardrail import is_spiderman_related, REFUSAL_MESSAGE
from dialogues import (
    is_greeting,
    is_quotes_request,
    get_random_greeting_response,
    get_all_dialogues_formatted
)


BASE_GREETING_RESPONSE = "Hello! I'm a general-purpose AI assistant. How can I help you today?"


@app.post("/api/chat")
async def chat_endpoint(request_data: ChatRequest, request: Request, stream: bool = False):
    # Reject empty or whitespace-only messages per §6.1
    if not request_data.message or not request_data.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty or whitespace.")

    # 1. Greeting Handling (e.g. "Hi", "Hello", "Hey")
    if is_greeting(request_data.message):
        spidey_greeting = get_random_greeting_response()

        if request_data.compare:
            return ChatResponse(
                tuned=spidey_greeting,
                base=BASE_GREETING_RESPONSE,
                latency_ms=LatencyMs(tuned=0, base=0)
            )

        accept_header = request.headers.get("accept", "")
        if stream or "text/event-stream" in accept_header:
            greeting_text = spidey_greeting if request_data.model == "spiderman" else BASE_GREETING_RESPONSE
            async def stream_greeting():
                yield f"data: {json.dumps({'token': greeting_text, 'done': True})}\n\n"
            return StreamingResponse(stream_greeting(), media_type="text/event-stream")

        if request_data.model == "spiderman":
            return ChatResponse(
                tuned=spidey_greeting,
                base=None,
                latency_ms=LatencyMs(tuned=0, base=None)
            )
        else:
            return ChatResponse(
                tuned=None,
                base=BASE_GREETING_RESPONSE,
                latency_ms=LatencyMs(tuned=None, base=0)
            )

    # 2. Quotes Request Handling (e.g. "Give me the best Spider-Man dialogues")
    if is_quotes_request(request_data.message):
        all_quotes_text = get_all_dialogues_formatted()

        if request_data.compare:
            base_text, base_ms = await ollama_client.generate_single("base", request_data.message)
            return ChatResponse(
                tuned=all_quotes_text,
                base=base_text,
                latency_ms=LatencyMs(tuned=0, base=base_ms)
            )

        if request_data.model == "spiderman":
            return ChatResponse(
                tuned=all_quotes_text,
                base=None,
                latency_ms=LatencyMs(tuned=0, base=None)
            )

    # Convert history items to dict format if present
    history_list = [h.model_dump() for h in request_data.history] if request_data.history else None
    is_spidey_prompt = is_spiderman_related(request_data.message, history=history_list)

    # 3. Comparison Mode
    if request_data.compare:
        if is_spidey_prompt:
            result = await ollama_client.generate_compare(request_data.message, history=history_list)
            return ChatResponse(
                tuned=result["tuned"],
                base=result["base"],
                latency_ms=LatencyMs(
                    tuned=result["latency_ms"]["tuned"],
                    base=result["latency_ms"]["base"]
                )
            )
        else:
            # Fine-tuned model refuses non-Spider-Man query; Untuned base model answers normally
            base_text, base_ms = await ollama_client.generate_single("base", request_data.message, history=history_list)
            return ChatResponse(
                tuned=REFUSAL_MESSAGE,
                base=base_text,
                latency_ms=LatencyMs(
                    tuned=0,
                    base=base_ms
                )
            )

    # 4. Single Model Mode: spiderman model gets guardrail refusal if out-of-domain
    if request_data.model == "spiderman" and not is_spidey_prompt:
        accept_header = request.headers.get("accept", "")
        if stream or "text/event-stream" in accept_header:
            async def stream_refusal():
                yield f"data: {json.dumps({'token': REFUSAL_MESSAGE, 'done': True})}\n\n"
            return StreamingResponse(stream_refusal(), media_type="text/event-stream")

        return ChatResponse(
            tuned=REFUSAL_MESSAGE,
            base=None,
            latency_ms=LatencyMs(tuned=0, base=None)
        )

    # 5. Single Model Mode: normal execution for in-domain spiderman or base model queries
    accept_header = request.headers.get("accept", "")
    if stream or "text/event-stream" in accept_header:
        return StreamingResponse(
            ollama_client.stream_single(request_data.model, request_data.message, history=history_list),
            media_type="text/event-stream"
        )

    resp_text, latency = await ollama_client.generate_single(request_data.model, request_data.message, history=history_list)
    if request_data.model == "spiderman":
        return ChatResponse(
            tuned=resp_text,
            base=None,
            latency_ms=LatencyMs(tuned=latency, base=None)
        )
    else:
        return ChatResponse(
            tuned=None,
            base=resp_text,
            latency_ms=LatencyMs(tuned=None, base=latency)
        )


@app.get("/api/metrics")
async def get_metrics():
    metrics_files = ["metrics_A.json", "metrics_A2.json", "metrics_B.json"]
    result = []
    
    for fname in metrics_files:
        fpath = DATA_DIR / fname
        if fpath.exists():
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    result.append(json.load(f))
            except Exception:
                continue
                
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
