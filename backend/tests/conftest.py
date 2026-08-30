import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    """Returns a FastAPI TestClient instance for testing API endpoints."""
    with TestClient(app) as test_client:
        yield test_client
