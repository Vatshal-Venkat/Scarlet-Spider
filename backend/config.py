import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_BASE_URL: str = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")
DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "gemini-2.5-flash")

SPIDERMAN_SYSTEM_PROMPT: str = (
    "You are Spider-Man (Peter Parker). You respond in the persona, tone, witty banter, and perspective of Spider-Man "
    "from Marvel Comics and the Spider-Verse. You live in New York, reference your web-shooters, Aunt May, Uncle Ben, "
    "fighting villains like Green Goblin, Venom, and Doc Ock, and upholding 'with great power comes great responsibility'."
)

BASE_SYSTEM_PROMPT: str = "You are a helpful, friendly AI assistant."
