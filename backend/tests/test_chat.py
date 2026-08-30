from unittest.mock import AsyncMock, patch
import pytest
from ollama_client import OllamaServiceError

def test_chat_validation_empty_message(client):
    """Test /api/chat rejects empty or whitespace-only prompt with 400 Bad Request."""
    response = client.post("/api/chat", json={"message": "   ", "model": "spiderman", "compare": False})
    assert response.status_code == 400
    assert "empty" in str(response.json()["detail"]).lower()

def test_chat_single_model_spiderman(client):
    """Test /api/chat single-model non-streaming mode for spiderman model."""
    mock_resp = ("Venom is a symbiote.", 1200)
    with patch("main.ollama_client.generate_single", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_resp
        response = client.post("/api/chat", json={"message": "Who is Venom?", "model": "spiderman", "compare": False})
        assert response.status_code == 200
        data = response.json()
        assert data["tuned"] == "Venom is a symbiote."
        assert data["base"] is None
        assert data["latency_ms"]["tuned"] == 1200
        assert data["latency_ms"]["base"] is None

def test_chat_single_model_base(client):
    """Test /api/chat single-model non-streaming mode for base model."""
    mock_resp = ("Venom is a fictional character.", 1500)
    with patch("main.ollama_client.generate_single", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_resp
        response = client.post("/api/chat", json={"message": "Who is Venom?", "model": "base", "compare": False})
        assert response.status_code == 200
        data = response.json()
        assert data["tuned"] is None
        assert data["base"] == "Venom is a fictional character."
        assert data["latency_ms"]["tuned"] is None
        assert data["latency_ms"]["base"] == 1500

def test_chat_compare_mode(client):
    """Test /api/chat compare mode queries both models concurrently."""
    mock_compare_result = {
        "tuned": "Spider-Man response from tuned model.",
        "base": "Spider-Man response from base model.",
        "latency_ms": {
            "tuned": 1100,
            "base": 1400
        }
    }
    with patch("main.ollama_client.generate_compare", new_callable=AsyncMock) as mock_comp:
        mock_comp.return_value = mock_compare_result
        response = client.post("/api/chat", json={"message": "Who is Spider-Man?", "compare": True})
        assert response.status_code == 200
        data = response.json()
        assert data["tuned"] == "Spider-Man response from tuned model."
        assert data["base"] == "Spider-Man response from base model."
        assert data["latency_ms"]["tuned"] == 1100
        assert data["latency_ms"]["base"] == 1400

def test_chat_streaming_mode(client):
    """Test /api/chat streaming mode produces event-stream format."""
    async def mock_stream(model_key, prompt, history=None):
        yield 'data: {"token": "Spider-Man ", "done": false}\n\n'
        yield 'data: {"token": "is Peter Parker.", "done": true}\n\n'

    with patch("main.ollama_client.stream_single", side_effect=mock_stream):
        response = client.post(
            "/api/chat?stream=true",
            headers={"accept": "text/event-stream"},
            json={"message": "Who is Spider-Man?", "model": "spiderman", "compare": False}
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        assert "Spider-Man " in response.text
        assert "is Peter Parker." in response.text

def test_chat_ollama_unreachable_error(client):
    """Test /api/chat returns 503 when Ollama client raises OllamaServiceError."""
    with patch("main.ollama_client.generate_single", side_effect=OllamaServiceError("Ollama service unreachable", 503)):
        response = client.post("/api/chat", json={"message": "Who is Peter?", "model": "spiderman", "compare": False})
        assert response.status_code == 503
        assert "Ollama service unreachable" in response.json()["detail"]

def test_chat_timeout_error(client):
    """Test /api/chat returns 504 when Ollama generation times out."""
    with patch("main.ollama_client.generate_single", side_effect=OllamaServiceError("Model generation timed out (>60s).", 504)):
        response = client.post("/api/chat", json={"message": "Who is Peter?", "model": "spiderman", "compare": False})
        assert response.status_code == 504
        assert "timed out" in response.json()["detail"]

def test_chat_guardrail_refusal(client):
    """Test /api/chat tuned model refuses non-Spider-Man query like 'Who is Elon Musk?' while base model answers normally."""
    mock_base_resp = ("Elon Musk is an entrepreneur and CEO of Tesla.", 1500)
    with patch("main.ollama_client.generate_single", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_base_resp
        response = client.post("/api/chat", json={"message": "Who is Elon Musk?", "compare": True})
        assert response.status_code == 200
        data = response.json()
        assert "Spider-Man assistant" in data["tuned"]
        assert data["base"] == "Elon Musk is an entrepreneur and CEO of Tesla."
        assert data["latency_ms"]["tuned"] == 0
        assert data["latency_ms"]["base"] == 1500

def test_chat_greeting_response(client):
    """Test /api/chat greeting response includes Spider-Man quote for tuned model and general greeting for base model."""
    response = client.post("/api/chat", json={"message": "Hi", "compare": True})
    assert response.status_code == 200
    data = response.json()
    assert "Hey there!" in data["tuned"]
    assert "Spider-Man Assistant" in data["tuned"]
    assert "general-purpose AI assistant" in data["base"]

def test_chat_best_quotes_response(client):
    """Test /api/chat best quotes request returns all 38 dialogues for tuned model."""
    mock_base_resp = ("Here are some quotes...", 1200)
    with patch("main.ollama_client.generate_single", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_base_resp
        response = client.post("/api/chat", json={"message": "Give me the best Spider-Man dialogues", "compare": True})
        assert response.status_code == 200
        data = response.json()
        assert "38 most iconic Spider-Man dialogues" in data["tuned"]
        assert "With great power comes great responsibility." in data["tuned"]


