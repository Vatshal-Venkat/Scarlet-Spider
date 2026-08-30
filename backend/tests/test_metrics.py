def test_get_metrics(client):
    """Test /api/metrics endpoint returns metrics data for all runs."""
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3

    # Verify structure of metrics objects
    for entry in data:
        assert "run" in entry
        assert "r" in entry
        assert "lr" in entry
        assert "train_rows" in entry
        assert "best_eval_loss" in entry
        assert "best_ppl" in entry
