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

def test_guardrail_followup_query_with_history():
    """Test follow-up questions without explicit keywords pass guardrail when history contains Spider-Man context."""
    history = [
        {"role": "user", "content": "How did Harry Osborn die?"},
        {"role": "assistant", "content": "Harry Osborn died in a glider crash during a battle."}
    ]
    assert is_spiderman_related("How did that crash happen?", history=history) is True
    assert is_spiderman_related("Tell me more about his death.", history=history) is True

def test_guardrail_unrelated_entity_with_history():
    """Test non-Spider-Man entity queries (e.g. Jeff Bezos) are refused even when history contains Spider-Man context."""
    history = [
        {"role": "user", "content": "How did Harry Osborn die?"},
        {"role": "assistant", "content": "Harry Osborn died in a glider crash during a battle."}
    ]
    assert is_spiderman_related("How did Jeff Bezos become so rich", history=history) is False
    assert is_spiderman_related("Who is Elon Musk?", history=history) is False

