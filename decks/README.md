# Match decks

Static JSON for Match mode on [0xbn.github.io/study](https://0xbn.github.io/study).

- `cs6460-module-1.json` — Module 1 Honorlock terms (`faces[0]` = Know line; extra faces = paraphrases).
- Rebuild from omscs Know + paraphrases:

```bash
python scripts/build-m1-deck.py
```

Requires sibling checkout `../omscs` with `tldr/week-01-know.md` and `scripts/m1-extra-faces.json`.
