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

# Regex pattern matching any of the Spider-Man keywords as whole words or sub-words
SPIDERMAN_PATTERN = re.compile(
    r"\b(" + "|".join(re.escape(k) for k in SPIDERMAN_KEYWORDS) + r")\b",
    re.IGNORECASE
)


def is_spiderman_related(prompt: str) -> bool:
    """
    Classifies whether a user prompt is related to Spider-Man lore.
    Returns True if the prompt contains Spider-Man terms/entities, False otherwise.
    """
    if not prompt or not prompt.strip():
        return False

    prompt_clean = prompt.strip()

    # Direct keyword match
    if SPIDERMAN_PATTERN.search(prompt_clean):
        return True

    # Generic check for 'spider' or 'wall crawler'
    lower_p = prompt_clean.lower()
    if "spider" in lower_p or "symbiote" in lower_p or "peter" in lower_p:
        return True

    return False
