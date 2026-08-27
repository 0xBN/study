# Study

Phone reader for OMSCS weekly Know files. Live at [0xbn.github.io/study](https://0xbn.github.io/study/).

Source of truth stays in the private `omscs` repo (`tldr/week-NN-know.md`). This repo is a public static copy plus the reader.

## Local

Open `index.html` over any static server (GitHub Pages, or `python -m http.server`). File URLs will fail `fetch`.

## Sync from omscs

From the omscs repo:

```bash
python scripts/sync-study-know.py --dest ../study
```

Then commit and push this repo.

Or from GitHub: omscs → Actions → **Sync study Pages** → Run workflow. Manual only; not on a schedule and not on every Know push. Needs secret `STUDY_DEPLOY_TOKEN` (PAT with `repo` on `0xBN/study`). Last sync is in Checkpoint on the site.
