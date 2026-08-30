from unittest.mock import AsyncMock, patch
from main import app

def test_health_endpoint_healthy(client):
    """Test /api/health returns 200 OK when Ollama is running and both models are available."""
    mock_health = (True, {"spiderman": True, "base": True})
    with patch("main.ollama_client.check_health", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = mock_health
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["ollama_reachable"] is True
        assert data["models_available"]["spiderman"] is True
        assert data["models_available"]["base"] is True

def test_health_endpoint_missing_model(client):
    """Test /api/health returns 503 Service Unavailable when a model is missing."""
    mock_health = (True, {"spiderman": True, "base": False})
    with patch("main.ollama_client.check_health", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = mock_health
        response = client.get("/api/health")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "degraded"
        assert data["models_available"]["base"] is False

def test_health_endpoint_ollama_down(client):
    """Test /api/health returns 503 Service Unavailable when Ollama is unreachable."""
    mock_health = (False, {"spiderman": False, "base": False})
    with patch("main.ollama_client.check_health", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = mock_health
        response = client.get("/api/health")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "down"
        assert data["ollama_reachable"] is False
