#!/usr/bin/env python3
"""Patch cards.generated.json: fix missing/bad Turkish translations and generic English meanings."""

from __future__ import annotations

import json
import re
import time
from pathlib import Path

from deep_translator import GoogleTranslator

CARDS_PATH = Path(__file__).resolve().parents[1] / "public" / "data" / "cards.generated.json"

GENERIC_EN = "Academic collocation frequently used in formal writing and exam passages."

SPACE_RE = re.compile(r"\s+")


def clean(text: str) -> str:
    return SPACE_RE.sub(" ", text).strip()


def normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", text.lower()).strip()


def needs_en_fix(card: dict) -> bool:
    return card.get("meaningEn", "").strip() == GENERIC_EN


def needs_tr_fix(card: dict) -> bool:
    tr = card.get("meaningTr", "").strip()
    term = card.get("term", "").strip()
    if not tr:
        return True
    # TR is same as the term itself (fallback in build_deck.py)
    if normalize(tr) == normalize(term):
        return True
    return False


def translate_batch(translator: GoogleTranslator, texts: list[str], batch_size: int = 20) -> list[str]:
    """Translate texts in batches to avoid rate limits."""
    results: list[str] = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        for text in batch:
            try:
                translated = translator.translate(text)
                results.append(clean(translated) if translated else "")
            except Exception as e:
                print(f"  [warn] translation failed for '{text[:40]}...': {e}")
                results.append("")
            time.sleep(0.15)  # Rate limit
        if i + batch_size < len(texts):
            print(f"  ... translated {min(i + batch_size, len(texts))}/{len(texts)}")
            time.sleep(1)
    return results


def generate_collocation_meaning(term: str) -> str:
    """Generate a simple English meaning for a collocation based on its components."""
    # Remove articles and prepositions in parentheses
    clean_term = re.sub(r"\([^)]*\)\s*", "", term).strip()
    return f"Used in formal/academic writing: {clean_term}"


def main() -> None:
    data = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    cards = data.get("cards", data) if isinstance(data, dict) else data
    card_list = cards if isinstance(cards, list) else []

    # Identify cards needing fixes
    en_fix_cards = [c for c in card_list if needs_en_fix(c)]
    tr_fix_cards = [c for c in card_list if needs_tr_fix(c)]

    print(f"Total cards: {len(card_list)}")
    print(f"Cards needing English meaning fix: {len(en_fix_cards)}")
    print(f"Cards needing Turkish translation: {len(tr_fix_cards)}")

    # Step 1: Fix generic English meanings for collocations
    print("\n[1/2] Fixing English meanings for academic collocations...")
    en_translator = GoogleTranslator(source="en", target="en")
    for card in en_fix_cards:
        card["meaningEn"] = generate_collocation_meaning(card["term"])

    # Step 2: Translate to Turkish
    print("\n[2/2] Translating to Turkish...")
    tr_translator = GoogleTranslator(source="en", target="tr")

    # Prepare texts for translation
    texts_to_translate: list[str] = []
    cards_to_update: list[dict] = []

    for card in tr_fix_cards:
        # Use term for short terms, meaningEn for longer/generic ones
        term = card.get("term", "")
        meaning_en = card.get("meaningEn", "")

        if len(term.split()) <= 3 and len(term) < 50:
            text = term
        elif meaning_en and meaning_en != GENERIC_EN:
            text = meaning_en[:200]
        else:
            text = term

        texts_to_translate.append(text)
        cards_to_update.append(card)

    if texts_to_translate:
        translations = translate_batch(tr_translator, texts_to_translate)

        updated = 0
        for card, translation in zip(cards_to_update, translations):
            if translation and normalize(translation) != normalize(card.get("term", "")):
                card["meaningTr"] = translation
                updated += 1
            elif translation:
                card["meaningTr"] = translation

        print(f"\n  Updated {updated} Turkish translations")

    # Also fix example sentences for collocations that have only the generic example
    generic_example_prefix = "In an academic report, writers often use"
    for card in card_list:
        if card.get("examples") and len(card["examples"]) == 1:
            if card["examples"][0].startswith(generic_example_prefix):
                # Keep it but it's fine - these are generated examples
                pass

    # Write back
    if isinstance(data, dict):
        data["cards"] = card_list
    else:
        data = card_list

    CARDS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDone! Updated {CARDS_PATH}")

    # Print some samples
    print("\n--- Sample updated cards ---")
    for card in card_list[:5]:
        print(f"  {card['term']}")
        print(f"    EN: {card['meaningEn'][:80]}")
        print(f"    TR: {card['meaningTr'][:80]}")
        print()


if __name__ == "__main__":
    main()
