from dialogues import (
    SPIDERMAN_DIALOGUES,
    is_greeting,
    is_quotes_request,
    get_random_greeting_response,
    get_all_dialogues_formatted
)

def test_dialogues_count():
    """Test registry contains all 39 curated dialogues."""
    assert len(SPIDERMAN_DIALOGUES) == 39
    for item in SPIDERMAN_DIALOGUES:
        assert "quote" in item
        assert "speaker" in item
        assert "source" in item

def test_is_greeting():
    """Test greeting detection logic."""
    assert is_greeting("Hi") is True
    assert is_greeting("Hello!") is True
    assert is_greeting("Hey") is True
    assert is_greeting("Good morning") is True
    assert is_greeting("Who is Venom?") is False

def test_is_quotes_request():
    """Test quotes request detection logic."""
    assert is_quotes_request("Give me the best Spider-Man dialogues") is True
    assert is_quotes_request("What are famous quotes?") is True
    assert is_quotes_request("Iconic Spider-Man dialogues") is True
    assert is_quotes_request("Who is Peter Parker?") is False

def test_get_random_greeting_response():
    """Test random greeting response formatting."""
    response = get_random_greeting_response()
    assert "Hey there, I'm your Spider AI Assistant" in response
    assert "You may ask me anything about Spider-Man!" in response

def test_get_all_dialogues_formatted():
    """Test formatted quotes list contains all entries."""
    formatted = get_all_dialogues_formatted()
    assert f"{len(SPIDERMAN_DIALOGUES)} most iconic Spider-Man dialogues" in formatted
    assert "1. \"With great power comes great responsibility.\"" in formatted
    assert "39. \"I believe, One person can make a difference\"" in formatted
