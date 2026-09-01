# PRD — Spider-Man SLM Assistant

**Owner:** Tarun Kappala
**Status:** Ready for build
**Target IDE:** Antigravity
**Model:** Spider-Man Persona & Base Assistant powered by Google Gemini API (`gemini-2.5-flash`)

---

## 1. Purpose

Serve a fine-tuned / persona-guided small language model assistant through a web app, so the
model can be demonstrated interactively and its known limitations can be observed rather than described.

This is the deployment half of a fine-tuning assignment. The model is
already trained. Nothing in this document involves training.

## 2. Background

| Run | r | lr | Train rows | Best eval loss | Perplexity | Outcome |
|-----|---|-----|-----------|----------------|------------|---------|
| A | 32 | 2e-4 | 257 | 1.9295 | 6.89 | Overfit at epoch 1 (train loss 0.033) |
| A2 | 8 | 5e-5 | 257 | 1.9554 | 7.07 | Stable, undertrained |
| B | 8 | 5e-5 | 890 | 1.9394 | 6.95 | **Selected** — clean minimum |

Untrained baseline: eval loss 2.7832, perplexity 16.17.

**Known limitation, and a required feature of this app:** perplexity improved
57% while factual accuracy degraded. The tuned model produces fluent,
confidently-worded answers that are frequently wrong, and it lost the base
model's willingness to refuse unanswerable questions. The UI must make this
visible rather than hide it.

## 3. Scope

### In scope
- Google Gemini API integration for model serving (`gemini-2.5-flash`)
- FastAPI backend exposing a chat endpoint
- Single-page web frontend
- Side-by-side comparison mode (tuned vs base assistant)
- Static metrics page rendering the results table and loss curves

### Out of scope
- Authentication, user accounts, persistence across sessions
- Cloud deployment
- Any retraining or RAG retrieval
- Mobile-specific layout

## 4. Prerequisites

### 4.1 Configure Gemini API Key

Set `GEMINI_API_KEY` in environment variable:

```bash
export GEMINI_API_KEY="AIzaSyBKC7dkaG1SlcRwzU76C-HiAKPJuEqbh6Y"
```

## 5. Architecture

```
Browser (localhost:5173)
    |  POST /api/chat
    v
FastAPI (localhost:8000)
    |  POST /api/chat
    v
Google Gemini API (gemini-2.5-flash)
    |
    +-- spiderman model    (fine-tuned persona, Run B)
    +-- base model         (general assistant, comparison)
```

The backend exists to hold the model-selection logic, the comparison
fan-out, and CORS handling. The frontend never calls Gemini API directly.

## 6. Backend requirements

**Stack:** Python 3.11+, FastAPI, `httpx` (async), Uvicorn.

### 6.1 `POST /api/chat`

Request:
```json
{ "message": "Who is Venom?", "model": "spiderman", "compare": false }
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `message` | string | yes | 1–2000 chars, rejected if empty or whitespace |
| `model` | string | no | `"spiderman"` (default) or `"base"` |
| `compare` | bool | no | When true, query both models |

Response:
```json
{
  "tuned": "Venom has been Spider-Man's enemy, rival, anti-hero...",
  "base": null,
  "latency_ms": { "tuned": 840, "base": null }
}
```

When `compare` is true, both models are queried **concurrently** via
`asyncio.gather`, and both fields are populated.

### 6.2 `GET /api/health`

Returns Ollama reachability and which of the two required models are
registered. Non-200 if either is missing — the frontend uses this to show a
setup banner rather than failing on first message.

### 6.3 `GET /api/metrics`

Serves the contents of `metrics_A.json`, `metrics_A2.json`, `metrics_B.json`
as a single array, for the metrics page.

### 6.4 Error handling

| Condition | Status | Behaviour |
|-----------|--------|-----------|
| Ollama unreachable | 503 | Message naming the likely cause (service not started) |
| Model not registered | 503 | Message naming the missing model and the `ollama create` command |
| Generation timeout (>60s) | 504 | Partial output discarded |
| Empty / oversized message | 400 | Field-level validation error |

No unhandled exception may reach the client as a stack trace.

### 6.5 Streaming

Ollama supports token streaming. Use it for single-model mode via
Server-Sent Events, so first token appears in ~1s rather than the user waiting
for the full response. Comparison mode may return complete responses.

## 7. Frontend requirements

**Stack:** React + Vite, plain CSS or Tailwind. No component library required.

### 7.1 Chat view (default)

- Message list, user right / assistant left, newest at bottom
- Input with send button; Enter sends, Shift+Enter newlines
- Streaming tokens render as they arrive
- Model toggle: **Fine-tuned** / **Base** / **Compare both**
- In compare mode, responses render in two labelled columns
- Per-response latency shown in small text

### 7.2 Accuracy disclaimer — required

A persistent, non-dismissible banner above the chat:

> This model was fine-tuned on 890 examples and frequently states incorrect
> facts with confidence. Answers should not be trusted without verification.

This is not decoration. The measured behaviour includes inventing
non-existent film titles, wrong first-appearance issues, and fabricated
answers to questions with no valid answer. A demo that hides this
misrepresents the result.

### 7.3 Sample questions panel

Six preset buttons that populate the input, drawn from the evaluation set:

**Answerable (in training data):**
- "Who is Venom?"
- "What year did Miles Morales first appear?"
- "Where did Peter Parker go to school?"

**Unanswerable probes (no valid answer exists):**
- "Who directed the Spider-Man film released in 2031?"
- "Name the three members of the Spider-Squad."
- "Which issue introduced the Spider-Man villain Glasswing?"

The second group is the point. In compare mode the base model tends to refuse
these while the tuned model invents answers — the clearest live demonstration
of the calibration regression.

### 7.4 Metrics view

Second route (`/metrics`). Static, read-only:
- The results table from section 2
- `loss_curve_A2.png` and `loss_curve_B.png`
- Trainable parameters: 9,232,384 of 1,552,946,688 (0.59%)
- One paragraph stating the perplexity-vs-accuracy finding

### 7.5 States

Loading (typing indicator), error (inline retry), empty (sample questions
prominent), Ollama-down (setup banner with the exact commands from §4.2).

## 8. Project structure

```
spiderman-app/
├── backend/
│   ├── main.py
│   ├── ollama_client.py
│   ├── models.py            # pydantic schemas
│   ├── requirements.txt
│   └── data/                # metrics_*.json, loss_curve_*.png
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── ChatView.jsx
│   │   │   ├── CompareView.jsx
│   │   │   ├── MetricsView.jsx
│   │   │   └── SampleQuestions.jsx
│   │   └── api.js
│   ├── package.json
│   └── vite.config.js
├── model/
│   ├── qwen2.5-1.5b-instruct.Q4_K_M.gguf
│   └── Modelfile
└── README.md
```

## 9. Acceptance criteria

- [ ] `ollama list` shows `spiderman:latest` and `qwen2.5:1.5b`
- [ ] `GET /api/health` returns 200 with both models present
- [ ] Single-model chat streams first token in under 2s
- [ ] Compare mode returns both responses; latency is roughly that of the
      slower model, not the sum (confirms concurrency)
- [ ] Stopping Ollama produces the setup banner, not a crash
- [ ] Disclaimer banner is visible without scrolling
- [ ] All six sample questions populate and send
- [ ] Metrics page renders both loss curves and the results table
- [ ] Empty message is rejected client-side and server-side
- [ ] README documents setup from a clean machine

## 10. Build order

1. Install Ollama, register both models, confirm via `ollama run spiderman`
2. Backend: `/api/health` only, verify against live Ollama
3. Backend: `/api/chat` non-streaming, single model, verify with curl
4. Frontend: minimal chat against the working endpoint
5. Add streaming
6. Add compare mode (backend fan-out, then two-column UI)
7. Add sample questions and disclaimer
8. Metrics page
9. README

Each step is independently verifiable. Do not proceed to the next until the
current one works.

## 11. Open questions

- Should conversation history be sent to the model as multi-turn context?
  The model was fine-tuned on single-turn pairs only, so multi-turn behaviour
  is untested and likely degrades. **Default: single-turn, no history.**
- Should temperature be user-adjustable? A slider would let a demo show how
  fabrication worsens at higher temperature — useful, but adds surface area.
  **Default: fixed at 0.7 to match evaluation conditions.**
