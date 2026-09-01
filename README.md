# 🕷️ Spider-Man SLM Assistant & Evaluation Suite

**Owner:** Venkat Vatshal  
**Model Base:** Qwen2.5-1.5B-Instruct Persona (Powered by Google Gemini API)  
**Serving Engine:** Google Gemini API (`gemini-2.5-flash`)  
**Backend:** FastAPI (Python 3.11+)  
**Frontend:** React + Vite  

---

## 📌 Executive Summary

The **Spider-Man SLM Assistant** is an interactive web application designed to demonstrate and evaluate a small language model assistant fine-tuned/prompted on Spider-Man lore (comics, films, games, and media). 

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
                                      │  Async REST (HTTPX)
                                      ▼
                       ┌───────────────────────────────┐
                       │       Google Gemini API       │
                       │     (gemini-2.5-flash)        │
                       ├──────────────┬────────────────┤
                       │              │                │
                       ▼              ▼                ▼
                spiderman model    base model       GET /models (Health)
                (Spider-Man)       (General AI)
```

- **Backend Role**: Handles domain guardrails, context processing, dialogue shortcuts, CORS headers, concurrent comparison fan-out via `asyncio.gather`, and Gemini API connections.
- **Frontend Role**: Single-page React application providing streaming single-model chat, dual-column model comparison, non-dismissible accuracy disclaimers, sample question probes, and interactive metrics charts.

---

## ⚙️ Prerequisites & Setup

### 1. Set Gemini API Key
Configure the `GEMINI_API_KEY` environment variable in your terminal:

```bash
export GEMINI_API_KEY="AIzaSyBKC7dkaG1SlcRwzU76C-HiAKPJuEqbh6Y"
```

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
| `GET` | `/api/health` | Checks Gemini API reachability and verifies registration of both `spiderman` and `base` models (returns 503 if unreachable). |
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
pytest backend/tests
```

All 24 test cases pass cleanly with 100% success.

---

## 📜 License & Acknowledgments

- **Model Engine**: Google Gemini API (`gemini-2.5-flash`).
- **Backend**: FastAPI.
- **Frontend**: React + Vite + Tailwind CSS.

