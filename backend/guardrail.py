import re

REFUSAL_MESSAGE = (
    "I am a Spider-Man assistant. I can only answer questions related to Spider-Man, "
    "his characters, comics, films, and lore."
)

# Comprehensive list of Spider-Man related keywords, characters, villains, allies, creators, locations, and media
SPIDERMAN_KEYWORDS = [
    # Main hero & aliases
    "spider-man", "spiderman", "peter parker", "miles morales", "gwen stacy", "spider-gwen",
    "ghost-spider", "spider-woman", "spider-noir", "spider-ham", "penni parker", "spider-man 2099",
    "miguel o'hara", "silk", "cindy moon", "ben reilly", "scarlet spider", "kaine", "spider-verse",
    "web-slinger", "wall-crawler", "arachnid", "spider-sense", "web shooter", "web shooters",
    
    # Supporting cast & allies
    "mary jane", "mj", "aunt may", "uncle ben", "ned leeds", "flash thompson", "harry osborn",
    "norman osborn", "j. jonah jameson", "jameson", "daily bugle", "robbie robertson", "george stacy",
    "felicia hardy", "black cat", "ezekiel", "madame web", "captain stacy", "prowler", "jefferson davis",
    
    # Villains
    "venom", "carnage", "green goblin", "hobgoblin", "doctor octopus", "doc ock", "otto octavius",
    "electro", "sandman", "rhino", "lizard", "dr. connors", "curt connors", "mysterio", "quentin beck",
    "vulture", "adrian toomes", "kraven", "kraven the hunter", "chameleon", "shocker", "scorpion",
    "mac gargan", "kingpin", "wilson fisk", "tombstone", "hammerhead", "hydro-man", "jackal",
    "miles warren", "morbius", "morlun", "inheritors", "symbiote", "symbiotes", "riot", "scream",
    "toxin", "knull", "spot", "dr. jonathan ohnn", "sinister six", "sinister 6",
    
    # Locations, Orgs & Lore
    "oscorp", "alchemax", "horizon labs", "empire state university", "esu", "ravencroft",
    "queens", "forest hills", "midtown high", "web of life", "multiverse", "canon event", "spider-cave",
    
    # Creators & Actors & Media
    "stan lee", "steve ditko", "john romita", "toby maguire", "tobey maguire", "andrew garfield",
    "tom holland", "shameik moore", "hailee steinfeld", "oscar isaac", "sam raimi", "marc webb",
    "spider-man 2", "spider-man 3", "amazing spider-man", "homecoming", "far from home",
    "no way home", "into the spider-verse", "across the spider-verse", "beyond the spider-verse",
    "marvel's spider-man", "insomniac"
]

from typing import Optional, List, Dict, Any

# Regex pattern matching any of the Spider-Man keywords as whole words or sub-words
SPIDERMAN_PATTERN = re.compile(
    r"\b(" + "|".join(re.escape(k) for k in SPIDERMAN_KEYWORDS) + r")\b",
    re.IGNORECASE
)

# Explicit out-of-domain entities (celebrities, companies, countries, general topics)
OUT_OF_DOMAIN_ENTITIES = re.compile(
    r"\b(jeff bezos|bezos|elon musk|musk|bill gates|steve jobs|mark zuckerberg|barack obama|trump|biden|putin|"
    r"amazon|tesla|spacex|google|apple|microsoft|facebook|twitter|instagram|tiktok|bitcoin|crypto|ethereum|"
    r"france|germany|china|russia|japan|india|python|java|c\+\+|javascript|sql|html|css|quantum|calculus|physics|chemistry)\b",
    re.IGNORECASE
)

# Referential follow-up phrases that explicitly refer to previous topic details
REFERENTIAL_FOLLOWUP_PATTERN = re.compile(
    r"\b(that crash|that fight|that battle|that death|that scene|that movie|that film|that comic|that suit|that villain|that character|"
    r"his death|his origin|his powers|his story|his suit|her death|her origin|her story|their fight|"
    r"how did that happen|why did he|how did he|why did she|how did she|what happened to him|what happened to her|what happened next|tell me more about that|tell me more about him|tell me more about her)\b",
    re.IGNORECASE
)


def is_spiderman_related(prompt: str, history: Optional[List[Dict[str, Any]]] = None) -> bool:
    """
    Classifies whether a user prompt is related to Spider-Man lore.
    Requires explicit Spider-Man entity/term or an explicit referential follow-up phrase
    preceded by Spider-Man context in history.
    """
    if not prompt or not prompt.strip():
        return False

    prompt_clean = prompt.strip()

    # 1. Reject if prompt contains an explicit non-Spider-Man entity and NO Spider-Man keyword
    if OUT_OF_DOMAIN_ENTITIES.search(prompt_clean) and not SPIDERMAN_PATTERN.search(prompt_clean):
        return False

    # 2. Direct keyword match in current prompt
    if SPIDERMAN_PATTERN.search(prompt_clean):
        return True

    # 3. Generic keyword check
    lower_p = prompt_clean.lower()
    if "spider" in lower_p or "symbiote" in lower_p or "peter" in lower_p:
        return True

    # 4. History-aware referential follow-up check
    if history:
        # Check if previous history has Spider-Man context
        has_spidey_context = False
        for msg in reversed(history[-4:]):
            content = msg.get("content", "") if isinstance(msg, dict) else getattr(msg, "content", "")
            if content and SPIDERMAN_PATTERN.search(content):
                has_spidey_context = True
                break

        # Follow-up must contain an explicit referential phrase (e.g. "that crash", "his death", "how did that happen")
        if has_spidey_context and REFERENTIAL_FOLLOWUP_PATTERN.search(prompt_clean):
            return True

    return False
