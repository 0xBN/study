"""Build decks/cs6460-module-1.json from omscs Know + paraphrase extras."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OMSCS_KNOW = ROOT.parent / "omscs" / "tldr" / "week-01-know.md"
OUT = ROOT / "decks" / "cs6460-module-1.json"
INDEX = ROOT / "decks" / "index.json"

ID = {
    "constructivism-piaget": "constructivism",
    "assimilation-piaget": "assimilation",
    "accommodation-piaget": "accommodation",
    "disequilibrium-piaget": "disequilibrium",
    "more-knowledgeable-other-mko-vygotsky": "mko",
    "zone-of-proximal-development-zpd-vygotsky": "zpd",
    "kirschner-sweller-and-clark-2006": "kirschner-2006",
    "constructionism-papert": "constructionism",
    "constructivism-vs-constructionism": "constructivism-vs-constructionism",
    "instructionism-papert": "instructionism",
    "wide-walls-resnick": "wide-walls",
    "low-floor-high-ceiling-resnick-papert": "low-floor-high-ceiling",
    "four-p-s-resnick": "four-ps",
    "body-syntonic-papert": "body-syntonic",
    "lecture-etymology": "lecture",
    "direct-instruction-vs-discovery": "di-vs-discovery",
    "faultless-communication-engelmann": "faultless-communication",
    "lowercase-di-vs-capital-d-direct-instruction": "di-vs-di",
    "gradual-release-pearson-and-gallagher": "gradual-release",
    "operant-conditioning-skinner": "operant",
    "classical-conditioning-pavlov": "classical",
    "positive-reinforcement": "positive-reinforcement",
    "negative-reinforcement": "negative-reinforcement",
    "positive-punishment": "positive-punishment",
    "negative-punishment": "negative-punishment",
    "reinforcement-vs-punishment": "reinforcement-vs-punishment",
    "why-cognitivism-displaced-behaviorism": "cognitivism-displaced-behaviorism",
    "immediate-reinforcement": "immediate-reinforcement",
    "ecological-cognition-neisser": "ecological-cognition",
    "newell-and-simon": "newell-simon",
    "cognitivist-feedback": "cognitivist-feedback",
    "cognitive-load-sweller": "cognitive-load",
    "image-principle-mayer": "image-principle",
    "coherence-principle-mayer": "coherence-principle",
    "self-reflection-zimmerman": "self-reflection",
    "fluency-illusion": "fluency-illusion",
    "monitoring-needs-capacity": "monitoring-capacity",
    "guided-participation-rogoff": "guided-participation",
    "legitimate-peripheral-participation-lave-and-wenger": "lpp",
    "honor-cultural-variation": "cultural-variation",
    "zpd-vs-scaffolding": "zpd-vs-scaffolding",
    "mastery-oriented-goal-orientation": "mastery-oriented",
    "espn-top-10-not-top-10": "espn-top-10",
    "belonging-walton-and-cohen": "belonging",
    "self-determination-deci-and-ryan": "self-determination",
    "remote-proctoring-lesson-cite": "remote-proctoring",
    "ai-feedback-and-demographics": "ai-feedback-demographics",
    "edtech-matthew-effect-reich": "matthew-effect",
    "learning-styles-visual-auditory-kinesthetic": "learning-styles",
    "assessment": "assessment",
    "evaluation": "evaluation",
}

SIBLINGS = {
    "constructivism": ["constructionism", "assimilation", "accommodation"],
    "assimilation": ["accommodation", "disequilibrium", "constructivism"],
    "accommodation": ["assimilation", "disequilibrium", "constructivism"],
    "disequilibrium": ["assimilation", "accommodation", "constructivism"],
    "mko": ["zpd", "zpd-vs-scaffolding"],
    "zpd": ["mko", "zpd-vs-scaffolding"],
    "kirschner-2006": ["di-vs-discovery", "constructivism"],
    "constructionism": [
        "constructivism",
        "constructivism-vs-constructionism",
        "instructionism",
    ],
    "constructivism-vs-constructionism": ["constructivism", "constructionism"],
    "instructionism": ["constructionism", "di-vs-discovery"],
    "wide-walls": ["low-floor-high-ceiling", "four-ps"],
    "low-floor-high-ceiling": ["wide-walls", "four-ps"],
    "four-ps": ["wide-walls", "low-floor-high-ceiling", "body-syntonic"],
    "body-syntonic": ["constructionism", "four-ps"],
    "lecture": ["di-vs-discovery", "di-vs-di"],
    "di-vs-discovery": ["kirschner-2006", "gradual-release", "di-vs-di"],
    "faultless-communication": ["di-vs-di", "gradual-release"],
    "di-vs-di": ["faultless-communication", "di-vs-discovery"],
    "gradual-release": ["di-vs-discovery", "faultless-communication"],
    "operant": ["classical", "reinforcement-vs-punishment"],
    "classical": ["operant", "immediate-reinforcement"],
    "positive-reinforcement": [
        "negative-reinforcement",
        "positive-punishment",
        "reinforcement-vs-punishment",
    ],
    "negative-reinforcement": [
        "positive-reinforcement",
        "negative-punishment",
        "reinforcement-vs-punishment",
    ],
    "positive-punishment": [
        "negative-punishment",
        "positive-reinforcement",
        "reinforcement-vs-punishment",
    ],
    "negative-punishment": [
        "positive-punishment",
        "negative-reinforcement",
        "reinforcement-vs-punishment",
    ],
    "reinforcement-vs-punishment": [
        "positive-reinforcement",
        "negative-reinforcement",
        "positive-punishment",
        "negative-punishment",
    ],
    "cognitivism-displaced-behaviorism": [
        "operant",
        "newell-simon",
        "cognitivist-feedback",
    ],
    "immediate-reinforcement": [
        "operant",
        "positive-reinforcement",
        "cognitivist-feedback",
    ],
    "ecological-cognition": ["newell-simon", "cognitive-load"],
    "newell-simon": ["cognitivism-displaced-behaviorism", "ecological-cognition"],
    "cognitivist-feedback": ["immediate-reinforcement", "cognitive-load"],
    "cognitive-load": [
        "image-principle",
        "coherence-principle",
        "cognitivist-feedback",
    ],
    "image-principle": ["coherence-principle", "cognitive-load"],
    "coherence-principle": ["image-principle", "cognitive-load"],
    "self-reflection": ["fluency-illusion", "monitoring-capacity"],
    "fluency-illusion": ["self-reflection", "monitoring-capacity"],
    "monitoring-capacity": ["fluency-illusion", "self-reflection"],
    "guided-participation": ["lpp", "cultural-variation"],
    "lpp": ["guided-participation", "zpd-vs-scaffolding"],
    "cultural-variation": ["guided-participation", "lpp"],
    "zpd-vs-scaffolding": ["zpd", "mko"],
    "mastery-oriented": ["espn-top-10", "self-determination"],
    "espn-top-10": ["mastery-oriented", "belonging"],
    "belonging": ["self-determination", "mastery-oriented"],
    "self-determination": ["belonging", "mastery-oriented"],
    "remote-proctoring": ["ai-feedback-demographics", "matthew-effect"],
    "ai-feedback-demographics": ["remote-proctoring", "matthew-effect"],
    "matthew-effect": ["learning-styles", "ai-feedback-demographics"],
    "learning-styles": ["matthew-effect", "cultural-variation"],
    "assessment": ["evaluation"],
    "evaluation": ["assessment"],
}

EXTRA = json.loads(
    (Path(__file__).with_name("m1-extra-faces.json")).read_text(encoding="utf-8")
)


def extract() -> list[dict]:
    md = OMSCS_KNOW.read_text(encoding="utf-8")
    block = re.search(r"## CS6460[\s\S]*?(?=\n## CS6795|\Z)", md).group(0)
    raw = []
    section = None
    for line in block.splitlines():
        m = re.match(r"^### (.+)$", line)
        if m:
            section = m.group(1).strip()
            continue
        bm = re.match(
            r"^- \*\*([^*]+)\*\*((?:\s*\([^)]+\))?)\s*:?\s*(.*)$",
            line.strip(),
        )
        if not bm or section == "Honorlock":
            continue
        title = (bm.group(1) + (bm.group(2) or "")).replace(":", "").strip()
        claim = (bm.group(3) or "").strip()
        if not claim:
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        if slug.startswith("legitimate-peripheral"):
            slug = "legitimate-peripheral-participation-lave-and-wenger"
        raw.append({"slug": slug, "term": title, "canonical": claim})
    return raw


def main() -> None:
    items = []
    for r in extract():
        sid = ID.get(r["slug"])
        if not sid:
            raise SystemExit(f"unmapped slug: {r['slug']}")
        faces = [r["canonical"]] + list(EXTRA.get(sid, []))
        while len(faces) < 5:
            faces.append(r["canonical"])
        items.append(
            {
                "id": sid,
                "term": r["term"],
                "siblings": [],
                "faces": faces[:5],
            }
        )
    ids = {i["id"] for i in items}
    for i in items:
        i["siblings"] = [
            s for s in SIBLINGS.get(i["id"], []) if s in ids and s != i["id"]
        ]
    deck = {
        "id": "cs6460-m1",
        "title": "CS6460 Module 1",
        "weekId": "01",
        "clearsNeeded": 5,
        "sessionSize": 10,
        "items": items,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(deck, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    INDEX.write_text(
        json.dumps(
            {
                "decks": [
                    {
                        "id": "cs6460-m1",
                        "file": "decks/cs6460-module-1.json",
                        "title": "CS6460 Module 1",
                        "weekId": "01",
                    }
                ]
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    missing = [i["id"] for i in items if i["id"] not in EXTRA]
    print(f"wrote {len(items)} items -> {OUT}")
    if missing:
        print("missing EXTRA for", missing)


if __name__ == "__main__":
    main()
