#!/usr/bin/env python3
"""Ingest the Module 5 practice bank into deck items (source=practice-bank).

Raw bank: omscs cs6460-educational-technology/raw/week-05-module-05-practice-bank.md
Sidecar:  scripts/m5-practice-bank-whys.json -> "<question>": {"tag", "explain"}
Output:   scripts/m5-practice-bank.json, consumed by scripts/build-m3-m5-quiz.py

Run order: python scripts/ingest-m5-practice-bank.py
           python scripts/build-m3-m5-quiz.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = (
    ROOT.parent
    / "omscs"
    / "cs6460-educational-technology"
    / "raw"
    / "week-05-module-05-practice-bank.md"
)
WHYS = ROOT / "scripts" / "m5-practice-bank-whys.json"
OUT = ROOT / "scripts" / "m5-practice-bank.json"

LESSON = {
    "5.1": "5.1 Measurement",
    "5.2": "5.2 Taxonomies",
    "5.3": "5.3 Assessment styles",
    "5.4": "5.4 Grading",
    "5.5": "5.5 Feedback",
    "5.6": "5.6 Rubrics",
    "5.7": "5.7 Peer assessment",
    "5.8": "5.8 Research ethics",
    "5.9": "5.9 Assessment ethics",
    "MX": "Mixed review",
}

SECTION = re.compile(r"^## (5\.\d)\b")
MIXED = re.compile(r"^# Mixed\b")
Q_START = re.compile(r"^### Question (\d+)\s*$")
CHOICE = re.compile(r"^([A-D])\. (.+?)\s*$")
ANSWER = re.compile(r"^\*\*Answer: ([A-D])")
WHY = re.compile(r"^\*\*Why:\*\* (.+?)\s*$")


def blocks(text):
    """Yield (section, question, body lines) in file order."""
    section = None
    num = None
    body: list[str] = []
    for line in text.splitlines():
        if MIXED.match(line):
            if num is not None:
                yield section, num, body
                num, body = None, []
            section = "MX"
            continue
        found = SECTION.match(line)
        if found:
            if num is not None:
                yield section, num, body
                num, body = None, []
            section = found.group(1)
            continue
        found = Q_START.match(line)
        if found:
            if num is not None:
                yield section, num, body
            num, body = int(found.group(1)), []
            continue
        if num is not None:
            body.append(line)
    if num is not None:
        yield section, num, body


def parse(body):
    """Pull stem, choices, answer letter, and bank why out of one question."""
    stem: list[str] = []
    choices: list[tuple[str, str]] = []
    answer = None
    bank_why = ""
    for raw_line in body:
        line = raw_line.rstrip()
        if not line or line == "---":
            continue
        found = ANSWER.match(line)
        if found:
            answer = found.group(1)
            continue
        found = WHY.match(line)
        if found:
            bank_why = found.group(1)
            continue
        found = CHOICE.match(line)
        if found:
            choices.append((found.group(1), found.group(2)))
            continue
        if choices:
            continue
        stem.append(line)
    return " ".join(stem).strip(), choices, answer, bank_why


def build():
    if not RAW.exists():
        raise SystemExit(f"raw bank missing: {RAW}")
    whys = json.loads(WHYS.read_text(encoding="utf-8"))
    items = []
    seen_ids: set[str] = set()
    used: set[str] = set()

    for section, num, body in blocks(RAW.read_text(encoding="utf-8")):
        if section not in LESSON:
            raise SystemExit(f"question {num}: unknown section {section!r}")
        stem, choices, answer, bank_why = parse(body)
        entry = whys.get(str(num))
        if entry is None:
            raise SystemExit(f"question {num}: no sidecar entry in {WHYS.name}")
        used.add(str(num))
        tag = entry["tag"]
        explain = entry["explain"]
        letters = [letter for letter, _ in choices]
        if letters != ["A", "B", "C", "D"]:
            raise SystemExit(f"question {num}: choices {letters} != A-D")
        if answer not in letters:
            raise SystemExit(f"question {num}: bad answer {answer!r}")
        if len(explain) <= 80:
            raise SystemExit(f"question {num}: explain too short")
        item_id = f"pb-m5-{num:02d}-{tag}"
        if item_id in seen_ids:
            raise SystemExit(f"duplicate id {item_id}")
        seen_ids.add(item_id)
        items.append(
            {
                "id": item_id,
                "lesson": LESSON[section],
                "tag": tag,
                "source": "practice-bank",
                "stem": stem,
                "choices": [
                    {
                        "id": letter.lower(),
                        "text": text,
                        "correct": letter == answer,
                    }
                    for letter, text in choices
                ],
                "explain": explain,
                "bankWhy": bank_why,
            }
        )

    stale = sorted(set(whys) - used, key=int)
    if stale:
        raise SystemExit(f"sidecar entries with no question: {stale}")

    OUT.write_text(json.dumps(items, indent=2) + "\n", encoding="utf-8")
    counts: dict[str, int] = {}
    for it in items:
        counts[it["lesson"]] = counts.get(it["lesson"], 0) + 1
    print(f"{OUT.name}: {len(items)} items from {RAW.name}")
    for lesson in sorted(counts):
        print(f"  {lesson}: {counts[lesson]}")
    return items


if __name__ == "__main__":
    build()
