from guardrail import is_spiderman_related, REFUSAL_MESSAGE

def test_guardrail_in_domain_queries():
    """Test Spider-Man related queries return True."""
    assert is_spiderman_related("Who is Venom?") is True
    assert is_spiderman_related("Tell me about Peter Parker") is True
    assert is_spiderman_related("What year did Miles Morales appear?") is True
    assert is_spiderman_related("Who is Green Goblin?") is True
    assert is_spiderman_related("What is the Web of Life?") is True
    assert is_spiderman_related("Who directed No Way Home?") is True

def test_guardrail_out_of_domain_queries():
    """Test non-Spider-Man queries return False."""
    assert is_spiderman_related("Who is Elon Musk?") is False
    assert is_spiderman_related("What is the capital of France?") is False
    assert is_spiderman_related("How do I sort a list in Python?") is False
    assert is_spiderman_related("Explain quantum entanglement") is False
    assert is_spiderman_related("Who won the 2022 World Cup?") is False

def test_refusal_message_content():
    """Test refusal message constant contains Spider-Man assistant scope statement."""
    assert "Spider-Man assistant" in REFUSAL_MESSAGE
