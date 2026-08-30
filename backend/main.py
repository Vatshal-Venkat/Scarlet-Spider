import os
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

from models import ChatRequest, ChatResponse, LatencyMs, HealthResponse
from ollama_client import OllamaClient, OllamaServiceError

app = FastAPI(
    title="Spider-Man SLM Assistant API",
    description="Backend API for serving fine-tuned Qwen 2.5 1.5B Spider-Man model and comparison with base model.",
    version="1.0.0"
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

ollama_client = OllamaClient()


@app.exception_handler(OllamaServiceError)
async def ollama_service_error_handler(request: Request, exc: OllamaServiceError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )


@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.errors()}
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


@app.post("/api/chat")
async def chat_endpoint(request_data: ChatRequest, request: Request, stream: bool = False):
    # Reject empty or whitespace-only messages per §6.1
    if not request_data.message or not request_data.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty or whitespace.")

    # 1. Comparison Mode (Both fine-tuned and base models concurrently)
    if request_data.compare:
        result = await ollama_client.generate_compare(request_data.message)
        return ChatResponse(
            tuned=result["tuned"],
            base=result["base"],
            latency_ms=LatencyMs(
                tuned=result["latency_ms"]["tuned"],
                base=result["latency_ms"]["base"]
            )
        )

    # 2. SSE Streaming Mode for Single Model
    accept_header = request.headers.get("accept", "")
    if stream or "text/event-stream" in accept_header:
        return StreamingResponse(
            ollama_client.stream_single(request_data.model, request_data.message),
            media_type="text/event-stream"
        )

    # 3. Single Model Non-Streaming Mode
    resp_text, latency = await ollama_client.generate_single(request_data.model, request_data.message)
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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
