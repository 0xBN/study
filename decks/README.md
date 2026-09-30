# Decks

- `cs6460-module-1-quiz.json` — Module 1 scene quiz (sessionSize 5).
- `cs6460-module-3-quiz.json` / `cs6460-module-5-quiz.json` — Know + alt faces + `from source` samples; sessionSize 5; layman explains that kill each wrong.
- Module 5 also carries the 90-question practice bank as `source: "practice-bank"` (raw: `omscs/cs6460-educational-technology/raw/week-05-module-05-practice-bank.md`).

Rebuild 3/5:

```bash
python scripts/ingest-m5-practice-bank.py   # raw bank + whys -> scripts/m5-practice-bank.json
python scripts/build-m3-m5-quiz.py          # writes both decks
```

Match decks are retired.

