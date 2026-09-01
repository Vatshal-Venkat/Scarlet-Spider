# 🕷️ Spider-Man SLM Assistant & Evaluation Suite

**Owner:** Venkat Vatshal
**Model Base:** Qwen2.5-1.5B-Instruct (QLoRA Fine-tuned, Run B)  
**Serving Engine:** Ollama (GGUF Q4_K_M)  
**Backend:** FastAPI (Python 3.11+)  
**Frontend:** React + Vite  

---

## 📌 Executive Summary

The **Spider-Man SLM Assistant** is an interactive web application designed to demonstrate and evaluate a small language model (1.5B parameters) fine-tuned on Spider-Man lore (comics, films, games, and media). 

Rather than presenting fine-tuning purely as an optimization tool, this project explicitly demonstrates the **Perplexity vs. Factual Calibration Trade-off**—a critical limitation observed during fine-tuning.

### 🔬 Experimental Results & Key Findings

| Run | LoRA Rank ($r$) | Learning Rate ($lr$) | Training Rows | Best Eval Loss | Perplexity (PPL) | Status / Outcome |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **Untrained Baseline** | — | — | — | 2.7832 | 16.17 | Base Qwen2.5-1.5B |
| **Run A** | 32 | $2 \times 10^{-4}$ | 257 | 1.9295 | 6.89 | Overfit at Epoch 1 (Train loss 0.033) |
| **Run A2** | 8 | $5 \times 10^{-5}$ | 257 | 1.9554 | 7.07 | Stable, but undertrained |
| **Run B (Selected)** | 8 | $5 \times 10^{-5}$ | 890 | **1.9394** | **6.95** | **Selected Model** — Clean global minimum |

> ⚠️ **Key Finding: Calibration Loss**: Fine-tuning improved perplexity by **57%** (from 16.17 to 6.95), producing highly fluent, confidently-worded answers. However, factual calibration degraded—the model often hallucinates non-existent comic issues, wrong film release dates, or fabricated characters while losing the base model's willingness to refuse unanswerable queries.

---

## 🏗️ System Architecture

```
                       ┌───────────────────────────────┐
                       │   React + Vite Single-Page    │
                       │    Web Frontend (Port 5173)   │
                       └──────────────┬────────────────┘
                                      │  POST /api/chat (SSE / JSON)
                                      ▼
                       ┌───────────────────────────────┐
                       │     FastAPI Async Backend     │
                       │      (Uvicorn - Port 8000)    │
                       └──────────────┬────────────────┘
                                      │  Connection Pool (HTTPX)
                                      ▼
                       ┌───────────────────────────────┐
                       │    Ollama Engine (Port 11434)  │
                       ├──────────────┬────────────────┤
                       │              │                │
                       ▼              ▼                ▼
             spiderman:latest   qwen2.5:1.5b    /api/tags (Health)
             (Fine-Tuned Run B) (Untuned Base)
```

- **Backend Role**: Handles domain guardrails, context processing, dialogue shortcuts, CORS headers, concurrent comparison fan-out via `asyncio.gather`, and Ollama HTTP connection pooling.
- **Frontend Role**: Single-page React application providing streaming single-model chat, dual-column model comparison, non-dismissible accuracy disclaimers, sample question probes, and interactive metrics charts.

---

## ⚙️ Prerequisites & Setup

### 1. Install Ollama
Download and install Ollama from [ollama.com/download](https://ollama.com/download). Ensure the Ollama service is running on `http://localhost:11434`.

Verify installation:
```bash
ollama --version
curl http://localhost:11434
```

### 2. Register Fine-Tuned Model
Place `qwen2.5-1.5b-instruct.Q4_K_M.gguf` and `Modelfile` in the project root and register the model with Ollama:

```bash
# Register fine-tuned model
ollama create spiderman -f Modelfile

# Pull untuned base model for comparison mode
ollama pull qwen2.5:1.5b

# Verify both models are registered
ollama list
```
Both `spiderman:latest` and `qwen2.5:1.5b` must appear in the list.

---

## 🚀 Running the Project

### Backend Setup (FastAPI)

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   python main.py
   ```
   *The backend will start at `http://localhost:8000`.*

### Frontend Setup (React + Vite)

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Checks Ollama reachability and verifies registration of both `spiderman` and `base` models (returns 503 if unreachable). |
| `POST` | `/api/chat` | Main generation endpoint. Supports single-model streaming (SSE), comparison fan-out, greetings, and domain guardrails. |
| `GET` | `/api/metrics` | Returns training run data (`metrics_A.json`, `metrics_A2.json`, `metrics_B.json`) for the metrics view. |

### Sample Chat Request
```json
{
  "message": "Who is Venom?",
  "model": "spiderman",
  "compare": true,
  "history": []
}
```

---

## 🧪 Verification & Unit Testing

The backend includes a comprehensive `pytest` suite testing health checks, dialogue detection, domain guardrails, single model execution, comparison concurrency, streaming response format, and error handling.

To run tests:
```bash
python -m pytest backend/tests
```

All 24 test cases pass cleanly with 100% success.

---

## 📜 License & Acknowledgments

- **Model Base**: Qwen2.5-1.5B-Instruct by Alibaba Cloud.
- **Serving Engine**: Ollama.
- **Fine-Tuning Method**: QLoRA (Unsloth / Hugging Face PEFT).
