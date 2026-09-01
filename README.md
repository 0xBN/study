# CS6460 Quiz Drill

Phone reader for closed-book Honorlock quizzes. Live at [0xbn.github.io/study](https://0xbn.github.io/study/).

**CS6460 only.** Purpose is reinforcing Module 1 / 3 / 5 vocabulary so you can pass the quizzes without notes. CS6795 is open-notes — keep that in the private Know files, not here.

The on-screen cards keep arrows and slashes. Play mode rewrites those to spoken English so the voice does not say "slash" or "right arrow."

## Local

Open `index.html` over any static server (GitHub Pages, or `python -m http.server`). File URLs will fail `fetch`.

## Sync from omscs

From the omscs repo:

```bash
python scripts/sync-study-know.py --dest ../study
```

Then commit and push this repo.

Or from GitHub: omscs → Actions → **Sync study Pages** → Run workflow. Manual only; not on a schedule and not on every Know push. Needs secret `STUDY_DEPLOY_TOKEN` (PAT with `repo` on `0xBN/study`). Last sync is in Checkpoint on the site.
