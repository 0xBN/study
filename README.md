# CS6460 Quiz Drill

Phone reader for closed-book Honorlock quizzes. Live at [0xbn.github.io/study](https://0xbn.github.io/study/).

**CS6460 only.** Path: **Read** (lecture-context init) → **Quiz** (scene MC + explainer) → Honorlock practice → graded. No Match. CS6795 stays in private Know files.

## Local

Open `index.html` over any static server (GitHub Pages, or `python -m http.server`). File URLs will fail `fetch`.

## Sync from omscs

From the omscs repo:

```bash
python scripts/sync-study-know.py --dest ../study
```

Then commit and push this repo.

Or from GitHub: omscs → Actions → **Sync study Pages** → Run workflow. Manual only; not on a schedule and not on every Know push. Needs secret `STUDY_DEPLOY_TOKEN` (PAT with `repo` on `0xBN/study`). Last sync is in Checkpoint on the site.
