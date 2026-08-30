import random
import re
from typing import Dict, List

# 38 Iconic Spider-Man Dialogues Registry
SPIDERMAN_DIALOGUES: List[Dict[str, str]] = [
    {
        "quote": "With great power comes great responsibility.",
        "speaker": "Uncle Ben",
        "source": "Spider-Man (2002) & TASM"
    },
    {
        "quote": "I believe there is a hero in all of us.",
        "speaker": "Aunt May",
        "source": "Spider-Man 2"
    },
    {
        "quote": "No good deed goes unpunished.",
        "speaker": "Green Goblin / Norman Osborn",
        "source": "Spider-Man: No Way Home"
    },
    {
        "quote": "I'm something of a scientist myself.",
        "speaker": "Norman Osborn",
        "source": "Spider-Man (2002)"
    },
    {
        "quote": "Trying to do better.",
        "speaker": "Peter Parker (Tobey Maguire)",
        "source": "Spider-Man 2 & Spider-Man: No Way Home"
    },
    {
        "quote": "Trust me Peter, when you try to fix things, you'll always have to face the consequences.",
        "speaker": "The Lizard (Dr. Curt Connors)",
        "source": "Spider-Man: Homecoming / TASM"
    },
    {
        "quote": "It's easy to fool people when they are fooling themselves.",
        "speaker": "Mysterio / Quentin Beck",
        "source": "Spider-Man: Far From Home"
    },
    {
        "quote": "Did someone watch this old movie called Alien?",
        "speaker": "Spider-Man (Peter Parker)",
        "source": "Avengers: Infinity War"
    },
    {
        "quote": "Mr. Stark, we won.",
        "speaker": "Spider-Man (Peter Parker)",
        "source": "Avengers: Endgame"
    },
    {
        "quote": "Except disappointment, and you never get disappointed.",
        "speaker": "Michelle Jones (MJ)",
        "source": "Spider-Man: No Way Home"
    },
    {
        "quote": "Everybody needs help, even Spider-Man.",
        "speaker": "Mary Jane Watson",
        "source": "Spider-Man 3"
    },
    {
        "quote": "Secrets have a cost, Peter.",
        "speaker": "Aunt May",
        "source": "The Amazing Spider-Man 2"
    },
    {
        "quote": "That means I still have 192 unbroken bones.",
        "speaker": "Peter Parker / Spider-Man",
        "source": "Marvel's Spider-Man Game"
    },
    {
        "quote": "When you help one person, you help all.",
        "speaker": "Aunt May",
        "source": "Spider-Man: No Way Home"
    },
    {
        "quote": "This is my gift. My curse. Who am I? I'm Spider-Man.",
        "speaker": "Peter Parker",
        "source": "Spider-Man (2002) / Spider-Man 2"
    },
    {
        "quote": "You know what I love about being Spider-Man? Everything!",
        "speaker": "Peter Parker (Andrew Garfield)",
        "source": "The Amazing Spider-Man 2"
    },
    {
        "quote": "If you're nothing without this suit, then you shouldn't have it.",
        "speaker": "Tony Stark",
        "source": "Spider-Man: Homecoming"
    },
    {
        "quote": "I love you guys!",
        "speaker": "Peter 3 (Andrew Garfield)",
        "source": "Spider-Man: No Way Home"
    },
    {
        "quote": "It's a leap of faith. That's all it is, Miles.",
        "speaker": "Peter B. Parker",
        "source": "Spider-Man: Into the Spider-Verse"
    },
    {
        "quote": "Anyone can wear the mask.",
        "speaker": "Miles Morales",
        "source": "Spider-Man: Into the Spider-Verse"
    },
    {
        "quote": "Everyone keeps telling me how my story is supposed to go. Nah... I'ma do my own thing.",
        "speaker": "Miles Morales",
        "source": "Spider-Man: Across the Spider-Verse"
    },
    {
        "quote": "A hero's someone who doesn't give up, though. And I don't plan to.",
        "speaker": "Miles Morales",
        "source": "Marvel's Spider-Man 2 Game"
    },
    {
        "quote": "It's what we do.",
        "speaker": "Peter 2 (Tobey Maguire)",
        "source": "Spider-Man: No Way Home"
    },
    {
        "quote": "Sometimes, to do what's right... we have to give up the thing we want the most. Even our dreams.",
        "speaker": "Peter Parker (Tobey Maguire)",
        "source": "Spider-Man 2"
    },
    {
        "quote": "I couldn't save my best friend, Peter Parker. So now I save everyone else.",
        "speaker": "Gwen Stacy",
        "source": "Spider-Man: Into the Spider-Verse"
    },
    {
        "quote": "Spider-Man always gets up.",
        "speaker": "Gwen Stacy / Spider-Man Noir",
        "source": "Spider-Man: Into the Spider-Verse"
    },
    {
        "quote": "Well... there's a first time for everything, right?",
        "speaker": "Miles Morales",
        "source": "Spider-Man: Into the Spider-Verse"
    },
    {
        "quote": "You don't have to become somebody else to be great.",
        "speaker": "Rio Morales",
        "source": "Spider-Man: Into the Spider-Verse"
    },
    {
        "quote": "How far can a hero go before they stop being a hero?",
        "speaker": "Yuri Watanabe",
        "source": "Marvel's Spider-Man Game"
    },
    {
        "quote": "The multiverse is a dangerous place.",
        "speaker": "Spider-Man 2099 / Miguel O'Hara",
        "source": "Spider-Man: Across the Spider-Verse"
    },
    {
        "quote": "The problem is, you trying to live two different lives. The longer you do it, the more dangerous it becomes.",
        "speaker": "Doctor Strange",
        "source": "Spider-Man: No Way Home"
    },
    {
        "quote": "I love Spider-Man, but I love Peter Parker more.",
        "speaker": "Gwen Stacy",
        "source": "The Amazing Spider-Man 2"
    },
    {
        "quote": "I know we all think we're immortal. But we're not.",
        "speaker": "Gwen Stacy",
        "source": "The Amazing Spider-Man 2"
    },
    {
        "quote": "Ladies and gentlemen, you are about to witness the world's most famous superhero unmasked.",
        "speaker": "J. Jonah Jameson",
        "source": "Spider-Man: No Way Home"
    },
    {
        "quote": "Spider-Man is a menace!",
        "speaker": "J. Jonah Jameson",
        "source": "Spider-Man (2002)"
    },
    {
        "quote": "The greatest illusion of all is that we have control.",
        "speaker": "Mysterio / Quentin Beck",
        "source": "Spider-Man: Far From Home"
    },
    {
        "quote": "People need to believe. And nowadays, they'll believe anything.",
        "speaker": "Mysterio / Quentin Beck",
        "source": "Spider-Man: Far From Home"
    },
    {
        "quote": "I'm going to change the world.",
        "speaker": "Dr. Curt Connors",
        "source": "The Amazing Spider-Man 1"
    },
    {
        "quote": "I believe, One person can make a difference",
        "speaker": "Stan Lee",
        "source": "Spiderman Comics"
    }
]

# Greeting matching regex
GREETING_PATTERN = re.compile(
    r"^(hi|hello|hey|greetings|good morning|good afternoon|good evening|yo|sup|hey there|hi spiderman|hello spiderman)(\s+.*|\!|\.)?$",
    re.IGNORECASE
)

# Quotes request matching regex
QUOTES_REQUEST_PATTERN = re.compile(
    r"\b(best|famous|iconic|top|favorite)\b.*\b(dialogues|quotes|lines)\b|\b(spider-man quotes|spiderman quotes|give me quotes|list quotes)\b",
    re.IGNORECASE
)


def is_greeting(prompt: str) -> bool:
    """Detects whether a user prompt is a greeting."""
    if not prompt:
        return False
    p = prompt.strip()
    return bool(GREETING_PATTERN.match(p)) or p.lower() in ("hi", "hello", "hey", "yo", "sup")


def is_quotes_request(prompt: str) -> bool:
    """Detects whether a user prompt is asking for best Spider-Man dialogues/quotes."""
    if not prompt:
        return False
    return bool(QUOTES_REQUEST_PATTERN.search(prompt.strip()))


def get_random_greeting_response() -> str:
    """
    Selects a random dialogue from the registry and formats the Spider-Man Assistant greeting:
    'Hey there! "{quote}" — {speaker} in {source}. I'm your Spider-Man Assistant. You may ask me anything about Spider-Man!'
    """
    item = random.choice(SPIDERMAN_DIALOGUES)
    return (
        f"Hey there! \"{item['quote']}\" — {item['speaker']} in {item['source']}.\n\n"
        f"I'm your Spider-Man Assistant. You may ask me anything about Spider-Man!"
    )


def get_all_dialogues_formatted() -> str:
    """Returns a formatted list of all 38 iconic Spider-Man dialogues."""
    lines = ["Here are the 38 most iconic Spider-Man dialogues:\n"]
    for idx, item in enumerate(SPIDERMAN_DIALOGUES, 1):
        lines.append(f"{idx}. \"{item['quote']}\" — **{item['speaker']}** ({item['source']})")
    lines.append("\nFeel free to ask me about any of these characters, storylines, or films!")
    return "\n".join(lines)
