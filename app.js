const LS_KEY = "omscs-study";
const QUIZ_LS_PREFIX = "omscs-study-quiz:";
const COURSE = "6460";
/** Bump with index.html ?v= so mobile can confirm a fresh load. */
const APP_BUILD = 32;

const state = {
  weeks: [],
  currentWeekId: "01",
  chunkId: null,
  parsed: new Map(),
  syncedAt: null,
  quiz: null,
  collapsed: {},
  cursorByView: {},
  scrollByView: {},
  face: "term",
  showSections: true,
  mode: "read",
  quizBank: null,
  quizProgress: {},
  quizSession: null,
};

let deadlineTimer = 0;

function $(id) {
  return document.getElementById(id);
}

function on(id, event, fn) {
  const el = $(id);
  if (!el) return;
  el.addEventListener(event, fn);
}

function formatRemain(ms) {
  if (ms <= 0) return "closed";
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / (60 * 24));
  const h = Math.floor((totalMin % (60 * 24)) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function localDuePhrase(dueAt) {
  const d = new Date(dueAt);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderDeadline() {
  const el = $("deadline");
  const detail = $("quiz-detail");
  const quiz = state.quiz;
  if (!el) return;
  if (!quiz || !quiz.dueAt) {
    el.hidden = true;
    el.textContent = "";
    if (detail) detail.textContent = "";
    return;
  }
  const due = new Date(quiz.dueAt);
  const ms = due.getTime() - Date.now();
  const label = quiz.label || "Quiz";
  const dueLabel = quiz.dueLabel || "";
  const local = localDuePhrase(quiz.dueAt);
  el.hidden = false;
  el.classList.toggle("warn", ms > 0 && ms < 24 * 60 * 60 * 1000);
  el.classList.toggle("closed", ms <= 0);
  if (ms <= 0) {
    el.textContent = local
      ? `${label} · closed · ${local}`
      : `${label} · closed`;
  } else {
    el.textContent = local
      ? `${label} · ${formatRemain(ms)} · ${local}`
      : `${label} · ${formatRemain(ms)}`;
  }
  if (detail) {
    detail.textContent =
      ms <= 0
        ? `${label} closed. Canvas date ${dueLabel || "—"}; wall clock was ${local}.`
        : `${label} due ${dueLabel || "—"}. Anywhere on Earth (AOE) = last timezone still on that calendar day. On your clock that is ${local}. Study until then; submit before it flips.`;
  }
}

function loadLs() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLs() {
  localStorage.setItem(
    LS_KEY,
    JSON.stringify({
      weekId: state.currentWeekId,
      chunkId: state.chunkId,
      collapsed: state.collapsed,
      cursorByView: state.cursorByView,
      scrollByView: state.scrollByView,
      face: state.face,
      showSections: state.showSections,
      mode: state.mode === "quiz" ? "quiz" : "read",
    }),
  );
}

function quizLsKey(bankId) {
  return QUIZ_LS_PREFIX + (bankId || state.quizBank?.id || "cs6460-m1-quiz");
}

function loadQuizProgress(bankId) {
  try {
    const raw = JSON.parse(localStorage.getItem(quizLsKey(bankId)) || "{}");
    return raw.items && typeof raw.items === "object" ? raw.items : {};
  } catch {
    return {};
  }
}

function saveQuizProgress() {
  if (!state.quizBank) return;
  localStorage.setItem(
    quizLsKey(state.quizBank.id),
    JSON.stringify({
      bankId: state.quizBank.id,
      v: 1,
      updatedAt: new Date().toISOString(),
      items: state.quizProgress,
    }),
  );
}

function ensureQuizItemProgress(id) {
  if (!state.quizProgress[id]) {
    state.quizProgress[id] = { seen: 0, correct: 0, wrong: 0 };
  }
  return state.quizProgress[id];
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}

function quizStats() {
  const items = state.quizBank?.items || [];
  const total = items.length;
  let seen = 0;
  let correct = 0;
  let wrong = 0;
  items.forEach((it) => {
    const p = state.quizProgress[it.id];
    if (!p) return;
    if (p.seen > 0) seen += 1;
    correct += p.correct || 0;
    wrong += p.wrong || 0;
  });
  const percent = total ? Math.round((seen / total) * 100) : 0;
  return { total, seen, correct, wrong, percent };
}

function viewKey(weekId) {
  return (weekId || state.currentWeekId) + "-" + COURSE;
}

function viewLookup(map, weekId) {
  const id = weekId || state.currentWeekId;
  if (map[id] != null) return map[id];
  return map[id + "-" + COURSE];
}

function stashView() {
  state.scrollByView[viewKey()] = window.scrollY;
  if (state.chunkId) state.cursorByView[viewKey()] = state.chunkId;
}

function cardTerm(c) {
  return c.title && c.title !== c.section ? c.title : "Overview";
}

function cardDef(c) {
  if (c.raw && String(c.raw).trim()) return String(c.raw).trim();
  return (c.bands || []).map((b) => b.text).join(" ").trim();
}

function cardClosed(id) {
  if (id === state.chunkId) return state.collapsed[id] === true;
  return state.collapsed[id] !== false;
}

function setCurrent(id) {
  if (state.chunkId && state.chunkId !== id) {
    state.collapsed[state.chunkId] = true;
  }
  delete state.collapsed[id];
  state.chunkId = id;
}

function parseHash() {
  const raw = location.hash.replace(/^#/, "");
  if (!raw) return {};
  const weekPart = raw.split("/")[0];
  const weekId = weekPart.replace(/^w/i, "").padStart(2, "0");
  const out = {};
  if (/^\d{2}$/.test(weekId)) out.weekId = weekId;
  return out;
}

function writeHash() {
  const next = "#w" + state.currentWeekId;
  if (location.hash !== next) history.replaceState(null, "", next);
}

function inlineHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function parseBands(text) {
  const bands = [];
  let current = null;
  text.split("\n").forEach((line) => {
    const labeled = line.match(
      /^- \*\*(Plain|Quiz voice|Trap):\*\*\s*(.*)$/i,
    );
    if (labeled) {
      if (current) bands.push(current);
      const key = labeled[1].toLowerCase();
      const kind = key.startsWith("plain")
        ? "plain"
        : key.startsWith("trap")
          ? "trap"
          : "quiz";
      current = { kind, text: labeled[2] };
      return;
    }
    if (current) {
      const extra = line.replace(/^- /, "").trim();
      if (extra) current.text += " " + extra;
    }
  });
  if (current) bands.push(current);
  if (bands.length) return bands;
  const leftover = text
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("|") && l.trim() !== "---")
    .join("\n")
    .trim();
  return leftover ? [{ kind: "body", text: leftover }] : [];
}

function parseTermBullet(line) {
  const m = line
    .trim()
    .match(/^- \*\*([^*]+)\*\*((?:\s*\([^)]+\))?)\s*:?\s*(.*)$/);
  if (!m) return null;
  const title = (m[1] + m[2]).replace(/:$/, "").trim();
  const def = (m[3] || "").replace(/^:\s*/, "").trim();
  if (!title || !def) return null;
  return { title, def };
}

function parseKnow(md, weekId) {
  const parts = md.split(/^## /m);
  const header = parts[0] || "";
  const dates =
    (header.match(/\*\*([^*]*\d{4}-\d{2}-\d{2}[^*]*)\*\*/) || [])[1] || "";
  const missMatch = header.match(
    /\*\*Still missing:\*\*\s*([\s\S]*?)(?:\n\n[A-Z|]|\n\n\|)/,
  );
  const missing = missMatch
    ? missMatch[1]
        .split("\n")
        .map((l) => l.replace(/^-\s*/, "").trim())
        .filter(Boolean)
        .join(" ")
    : "";
  const chunks = [];
  parts.slice(1).forEach((part, sIdx) => {
    const nl = part.indexOf("\n");
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim();
    if (/what this file is not/i.test(heading)) return;
    let course = "both";
    if (/6460/.test(heading)) course = "6460";
    else if (/6795/.test(heading)) course = "6795";
    if (course === "6795") return;
    const body = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    const topics = body.split(/^### /m);
    const pushChunk = (title, text, i, section) => {
      const bands = parseBands(text);
      if (!bands.length) return;
      const raw = bands
        .map((b) => {
          const prefix =
            b.kind === "plain"
              ? "Plain English. "
              : b.kind === "quiz"
                ? "Quiz wording. "
                : b.kind === "trap"
                  ? "Trap. "
                  : "";
          return prefix + b.text;
        })
        .join(" ");
      chunks.push({
        id: "w" + weekId + "-s" + sIdx + "-" + i,
        course,
        section: section || heading,
        title,
        bands,
        raw,
      });
    };
    const pushTerms = (section, text, iBase) => {
      let n = 0;
      text.split("\n").forEach((line) => {
        const term = parseTermBullet(line);
        if (!term) return;
        chunks.push({
          id: "w" + weekId + "-s" + sIdx + "-" + iBase + "-" + n,
          course,
          section,
          title: term.title,
          bands: [{ kind: "body", text: term.def }],
          raw: term.def,
        });
        n += 1;
      });
      return n;
    };
    if (topics.length === 1) {
      if (pushTerms(heading, body, 0)) return;
      body
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter((p) => p && p !== "---" && !p.startsWith("|"))
        .forEach((para, i) => {
          const titleMatch = para.match(/^\*\*([^*]+)\*\*/);
          const title = titleMatch
            ? titleMatch[1].replace(/\.\s*$/, "")
            : "";
          const text = titleMatch
            ? para.replace(/^\*\*[^*]+\*\*\s*/, "")
            : para;
          pushChunk(title, text, i, heading);
        });
      return;
    }
    topics.forEach((topic, i) => {
      if (i === 0) return;
      const tNl = topic.indexOf("\n");
      const lesson = (tNl === -1 ? topic : topic.slice(0, tNl)).trim();
      const text = tNl === -1 ? "" : topic.slice(tNl + 1).trim();
      if (pushTerms(lesson, text, i)) return;
      pushChunk(lesson, text, i, heading);
    });
  });
  return { dates, missing, chunks };
}

function weekMeta(id) {
  return state.weeks.find((w) => w.id === id) || state.weeks[0];
}

function weekLabel(id) {
  return "Week " + Number(id);
}

function visibleChunks() {
  const parsed = state.parsed.get(state.currentWeekId);
  if (!parsed) return [];
  return parsed.chunks.filter(
    (c) => c.course === "both" || c.course === COURSE,
  );
}

function setMode(mode) {
  state.mode = mode === "quiz" ? "quiz" : "read";
  saveLs();
  if (state.mode !== "quiz") setQuizReadyNext(false);
  const readCtrls = $("read-controls");
  const quizCtrls = $("quiz-controls");
  const article = $("article");
  const sceneQuiz = $("scene-quiz");
  const modeRead = $("mode-read");
  const modeQuiz = $("mode-quiz");
  if (readCtrls) readCtrls.hidden = state.mode !== "read";
  if (quizCtrls) quizCtrls.hidden = state.mode !== "quiz";
  if (article) article.hidden = state.mode !== "read";
  if (sceneQuiz) sceneQuiz.hidden = state.mode !== "quiz";
  if (modeRead) {
    modeRead.classList.toggle("active", state.mode === "read");
    modeRead.setAttribute("aria-pressed", state.mode === "read" ? "true" : "false");
  }
  if (modeQuiz) {
    modeQuiz.classList.toggle("active", state.mode === "quiz");
    modeQuiz.setAttribute(
      "aria-pressed",
      state.mode === "quiz" ? "true" : "false",
    );
  }
  document.body.classList.toggle("mode-quiz", state.mode === "quiz");
  document.body.classList.toggle("mode-read", state.mode === "read");
  if (state.mode === "quiz") {
    ensureQuizSession();
    renderSceneQuiz();
  } else {
    renderArticle();
  }
  renderNav();
  syncNavOffset();
}

function renderNav() {
  const chunks = visibleChunks();
  const title = $("nav-title");
  if (title) {
    if (state.mode === "quiz") {
      title.textContent = state.quizBank ? state.quizBank.title : "Quiz";
    } else {
      title.textContent = "CS6460 · " + weekLabel(state.currentWeekId);
    }
  }
  const qStatus = $("quiz-status");
  const qPct = $("quiz-pct");
  const qFill = $("quiz-meter-fill");
  if (state.mode === "quiz") {
    const st = quizStats();
    const sess = state.quizSession;
    const qPart = sess
      ? sess.phase === "board"
        ? "done"
        : `${Math.min(sess.index + 1, sess.size)}/${sess.size}`
      : "";
    if (qPct) qPct.textContent = `${st.percent}%`;
    if (qStatus) {
      qStatus.textContent = `seen ${st.seen}/${st.total}${
        qPart ? ` · Q ${qPart}` : ""
      } · ${st.correct}✓ ${st.wrong}✗`;
    }
    if (qFill) qFill.style.width = `${st.percent}%`;
  }
  const quizSheet = $("quiz-sheet-stats");
  if (quizSheet) {
    if (!state.quizBank) {
      quizSheet.textContent = "Scene quiz bank not loaded.";
    } else {
      const st = quizStats();
      quizSheet.textContent = `${state.quizBank.items.length} scenes · seen ${st.seen} · ${st.correct} correct · ${st.wrong} wrong`;
    }
  }
  const weeksEl = $("weeks");
  if (weeksEl) {
    weeksEl.innerHTML = state.weeks
      .map((w) => {
        const active = w.id === state.currentWeekId ? " active" : "";
        const parsed = state.parsed.get(w.id);
        const dates = parsed?.dates ? ` · ${parsed.dates}` : "";
        return `<button type="button" class="${active}" data-week="${w.id}">Week ${Number(w.id)}${dates}</button>`;
      })
      .join("");
  }
  const flip = $("flip");
  if (flip) {
    flip.textContent = state.face === "def" ? "Face: claim" : "Face: term";
    flip.setAttribute(
      "aria-pressed",
      state.face === "def" ? "true" : "false",
    );
  }
  const sections = $("sections");
  if (sections) {
    sections.textContent = state.showSections ? "Sections: on" : "Sections: off";
    sections.setAttribute(
      "aria-pressed",
      state.showSections ? "true" : "false",
    );
  }
  const parsedWeek = state.parsed.get(state.currentWeekId);
  const checkpoint = $("checkpoint");
  if (checkpoint) {
    checkpoint.textContent = parsedWeek?.dates
      ? `${parsedWeek.dates}. ${chunks.length} cards.`
      : `${chunks.length} cards.`;
  }
  const missing = $("missing");
  if (missing) missing.textContent = parsedWeek?.missing || "";
  const synced = $("synced");
  if (synced) {
    const know = state.syncedAt
      ? "Know " +
        new Date(state.syncedAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Know sync unknown";
    synced.textContent = `App v${APP_BUILD} · ${know}`;
  }
  const buildEl = $("app-build");
  if (buildEl) buildEl.textContent = `v${APP_BUILD}`;
  renderDeadline();
}

function renderArticle(opts) {
  if (state.mode !== "read") return;
  const keepY = opts && typeof opts.y === "number" ? opts.y : window.scrollY;
  const parsed = state.parsed.get(state.currentWeekId);
  const article = document.getElementById("article");
  if (!parsed) {
    article.textContent = "Loading…";
    return;
  }
  const chunks = visibleChunks();
  if (!chunks.length) {
    article.innerHTML =
      "<p class='muted'>No CS6460 quiz cards this week. Quiz 1 → Week 1.</p>";
    renderNav();
    return;
  }
  if (!chunks.some((c) => c.id === state.chunkId)) {
    state.chunkId = chunks[0].id;
  }
  let html = "";
  let lastSection = "";
  chunks.forEach((c) => {
    if (state.showSections && c.section !== lastSection) {
      html += `<h2>${inlineHtml(c.section)}</h2>`;
      lastSection = c.section;
    }
    const active = c.id === state.chunkId ? " active" : "";
    const closed = cardClosed(c.id) ? " collapsed" : "";
    const term = cardTerm(c);
    const def = cardDef(c) || term;
    const face = state.face === "def" ? def : term;
    const back = state.face === "def" ? term : def;
    const open = closed ? "false" : "true";
    const title = `<button type="button" class="chunk-toggle" aria-expanded="${open}">${inlineHtml(face)}</button>`;
    const bands = `<p>${inlineHtml(back)}</p>`;
    html += `<div class="chunk${active}${closed}" id="${c.id}" data-chunk="${c.id}">${title}<div class="chunk-body">${bands}</div></div>`;
  });
  article.innerHTML = html;
  renderNav();
  requestAnimationFrame(() => {
    if (opts && opts.scrollId) {
      const node = document.getElementById(opts.scrollId);
      if (node) node.scrollIntoView({ block: "center" });
      return;
    }
    window.scrollTo(0, keepY);
  });
}

function syncNavOffset() {
  const nav = document.querySelector(".nav");
  const top = nav ? Math.ceil(nav.getBoundingClientRect().bottom) : 0;
  document.documentElement.style.setProperty("--nav-offset", top + "px");
}

function setQuizReadyNext(on) {
  document.body.classList.toggle("quiz-ready-next", !!on);
  const root = $("scene-quiz");
  if (root) root.classList.toggle("match-ready-next", !!on);
  const hit = $("quiz-next-hit");
  if (!hit) return;
  hit.hidden = !on;
  syncNavOffset();
  if (on) {
    const nav = document.querySelector(".nav");
    const top = nav ? Math.ceil(nav.getBoundingClientRect().bottom) : 0;
    hit.style.top = top + "px";
  }
}

function ensureQuizSession(forceNew) {
  if (!state.quizBank) return;
  if (!forceNew && state.quizSession && state.quizSession.phase === "ask") {
    return;
  }
  const size = Math.min(
    state.quizBank.sessionSize || 27,
    (state.quizBank.items || []).length,
  );
  const ids = (state.quizBank.items || []).map((it) => it.id);
  shuffleInPlace(ids);
  const queue = ids.slice(0, size);
  state.quizSession = {
    phase: queue.length ? "ask" : "board",
    queue,
    index: 0,
    size: queue.length,
    correct: 0,
    wrong: 0,
    misses: [],
    answered: false,
    lastCorrect: false,
    pickedId: null,
    question: null,
  };
  if (queue.length) buildQuizQuestion();
}

function quizItemById(id) {
  return (state.quizBank?.items || []).find((it) => it.id === id);
}

function buildQuizQuestion() {
  const sess = state.quizSession;
  if (!sess || sess.index >= sess.queue.length) {
    sess.phase = "board";
    sess.question = null;
    return;
  }
  const item = quizItemById(sess.queue[sess.index]);
  if (!item) {
    sess.index += 1;
    buildQuizQuestion();
    return;
  }
  const choices = shuffleInPlace(
    (item.choices || []).map((c) => ({ ...c })),
  );
  sess.question = {
    id: item.id,
    lesson: item.lesson || "",
    tag: item.tag || "",
    stem: item.stem,
    explain: item.explain || "",
    choices,
  };
  sess.answered = false;
  sess.lastCorrect = false;
  sess.pickedId = null;
}

function gradeQuizPick(choiceId) {
  const sess = state.quizSession;
  if (!sess || !sess.question || sess.answered) return;
  const choice = sess.question.choices.find((c) => c.id === choiceId);
  if (!choice) return;
  sess.answered = true;
  sess.pickedId = choiceId;
  sess.lastCorrect = !!choice.correct;
  const prog = ensureQuizItemProgress(sess.question.id);
  prog.seen = (prog.seen || 0) + 1;
  if (choice.correct) {
    sess.correct += 1;
    prog.correct = (prog.correct || 0) + 1;
  } else {
    sess.wrong += 1;
    prog.wrong = (prog.wrong || 0) + 1;
    sess.misses.push(sess.question.id);
  }
  saveQuizProgress();
}

function advanceQuiz() {
  const sess = state.quizSession;
  if (!sess) return;
  sess.index += 1;
  sess.answered = false;
  sess.lastCorrect = false;
  sess.pickedId = null;
  if (sess.index >= sess.queue.length) {
    sess.phase = "board";
    sess.question = null;
  } else {
    buildQuizQuestion();
  }
  renderSceneQuiz();
}

function resetSceneQuiz() {
  if (!state.quizBank) return;
  if (!confirm("Reset scene-quiz progress for this bank?")) return;
  state.quizProgress = {};
  (state.quizBank.items || []).forEach((it) => ensureQuizItemProgress(it.id));
  saveQuizProgress();
  ensureQuizSession(true);
  if (state.mode === "quiz") renderSceneQuiz();
  renderNav();
}

function playJuice(correct) {
  const body = document.body;
  body.classList.remove("match-hit", "match-hit-big", "match-miss");
  void body.offsetWidth;
  if (correct) {
    body.classList.add("match-hit");
    try {
      if (navigator.vibrate) navigator.vibrate([10, 40, 14]);
    } catch (_) {}
  } else {
    body.classList.add("match-miss");
    try {
      if (navigator.vibrate) navigator.vibrate(28);
    } catch (_) {}
  }
  clearTimeout(window.__matchJuice);
  window.__matchJuice = setTimeout(() => {
    body.classList.remove("match-hit", "match-hit-big", "match-miss");
  }, 480);
}

function renderSceneQuiz() {
  const root = $("scene-quiz");
  if (!root || state.mode !== "quiz") return;
  if (!state.quizBank) {
    root.innerHTML = "<p class='muted'>Loading scene quiz…</p>";
    setQuizReadyNext(false);
    return;
  }
  if (!state.quizSession) ensureQuizSession(true);
  const s = state.quizSession;
  const st = quizStats();

  if (s.phase === "board") {
    setQuizReadyNext(false);
    const missList = [...new Set(s.misses)]
      .map((id) => quizItemById(id))
      .filter(Boolean)
      .map((it) => `<li>${inlineHtml(it.tag || it.id)}</li>`)
      .join("");
    root.innerHTML = `
      <div class="match-board">
        <h2>Session done</h2>
        <p>${s.correct} correct · ${s.wrong} wrong · Bank seen ${st.seen}/${st.total}</p>
        ${
          missList
            ? `<p class="label">Missed this session</p><ul>${missList}</ul>`
            : "<p class='muted'>No misses this session.</p>"
        }
        <div class="sheet-actions">
          <button type="button" id="quiz-again" class="primary">Drill again (27)</button>
          <button type="button" id="quiz-to-read">Back to Read</button>
        </div>
      </div>`;
    renderNav();
    return;
  }

  const q = s.question;
  if (!q) {
    setQuizReadyNext(false);
    root.innerHTML = "<p class='muted'>No quiz items.</p>";
    return;
  }
  let fb = "";
  if (s.answered) {
    if (s.lastCorrect) {
      fb = `<div class="match-fb fb-ok"><strong>Correct</strong><p class="match-why">${inlineHtml(
        q.explain,
      )}</p><p class="muted match-tap">Tap for next</p></div>`;
    } else {
      fb = `<div class="match-fb fb-bad"><strong>Wrong</strong><p class="match-why">${inlineHtml(
        q.explain,
      )}</p><p class="muted match-tap">Tap for next</p></div>`;
    }
  }
  const choices = q.choices
    .map((c) => {
      let cls = "";
      if (s.answered) {
        if (c.correct) cls = " pick-ok";
        else if (s.pickedId === c.id) cls = " pick-bad";
      }
      return `<button type="button" data-qchoice="${c.id}" class="${cls}" ${
        s.answered ? "disabled" : ""
      }>${inlineHtml(c.text)}</button>`;
    })
    .join("");
  setQuizReadyNext(!!s.answered);
  const meta = s.answered
    ? `<p class="quiz-meta muted">${inlineHtml(q.lesson)}${
        q.tag ? ` · ${inlineHtml(q.tag)}` : ""
      }</p>`
    : "";
  root.innerHTML = `
    <div class="match-stage quiz-stage">
      ${meta}
      <p class="match-prompt quiz-stem">${inlineHtml(q.stem)}</p>
      <div class="match-choices quiz-choices">${choices}</div>
      ${fb}
    </div>`;
  renderNav();
  syncNavOffset();
}

async function loadWeek(id) {
  if (state.parsed.has(id)) return;
  const meta = weekMeta(id);
  const res = await fetch("./" + meta.file);
  const md = await res.text();
  state.parsed.set(id, parseKnow(md, id));
}

async function loadQuizBank() {
  const res = await fetch("./decks/cs6460-module-1-quiz.json");
  state.quizBank = await res.json();
  state.quizProgress = loadQuizProgress(state.quizBank.id);
  (state.quizBank.items || []).forEach((it) => ensureQuizItemProgress(it.id));
  saveQuizProgress();
}

async function showWeek(id) {
  stashView();
  state.currentWeekId = id;
  await loadWeek(id);
  state.chunkId = viewLookup(state.cursorByView) || null;
  saveLs();
  writeHash();
  if (state.mode === "read") {
    renderArticle({ y: viewLookup(state.scrollByView) || 0 });
  } else {
    ensureQuizSession();
    renderSceneQuiz();
    renderNav();
  }
}

function openSheet() {
  renderNav();
  const sheet = $("sheet");
  const backdrop = $("backdrop");
  if (sheet) sheet.hidden = false;
  if (backdrop) backdrop.hidden = false;
}

function closeSheet() {
  const sheet = $("sheet");
  const backdrop = $("backdrop");
  if (sheet) sheet.hidden = true;
  if (backdrop) backdrop.hidden = true;
}

function bind() {
  on("mode-read", "click", () => setMode("read"));
  on("mode-quiz", "click", () => setMode("quiz"));
  on("open-sheet", "click", openSheet);
  on("close-sheet", "click", closeSheet);
  on("backdrop", "click", closeSheet);
  on("weeks", "click", (e) => {
    const btn = e.target.closest("[data-week]");
    if (btn) showWeek(btn.dataset.week);
  });
  on("flip", "click", () => {
    state.face = state.face === "def" ? "term" : "def";
    saveLs();
    renderArticle();
  });
  on("collapse-all", "click", () => {
    visibleChunks().forEach((c) => {
      state.collapsed[c.id] = true;
    });
    saveLs();
    renderArticle();
  });
  on("sections", "click", () => {
    state.showSections = !state.showSections;
    saveLs();
    renderArticle();
  });
  on("article", "click", (e) => {
    const toggle = e.target.closest(".chunk-toggle");
    const chunk = e.target.closest("[data-chunk]");
    if (!chunk) return;
    if (toggle) {
      const id = chunk.dataset.chunk;
      if (cardClosed(id)) state.collapsed[id] = false;
      else state.collapsed[id] = true;
      saveLs();
      renderArticle();
      return;
    }
    setCurrent(chunk.dataset.chunk);
    saveLs();
    renderArticle();
  });
  on("scene-quiz", "click", (e) => {
    const again = e.target.closest("#quiz-again");
    if (again) {
      ensureQuizSession(true);
      renderSceneQuiz();
      return;
    }
    if (e.target.closest("#quiz-to-read")) {
      setMode("read");
      return;
    }
    const btn = e.target.closest("[data-qchoice]");
    if (!btn || state.quizSession?.answered) return;
    gradeQuizPick(btn.dataset.qchoice);
    renderSceneQuiz();
    playJuice(!!state.quizSession?.lastCorrect);
  });
  on("quiz-next-hit", "click", () => {
    const sess = state.quizSession;
    if (state.mode !== "quiz" || !sess || !sess.answered || sess.phase !== "ask") {
      return;
    }
    advanceQuiz();
  });
  on("quiz-reset", "click", resetSceneQuiz);
  window.addEventListener(
    "resize",
    () => {
      syncNavOffset();
      if (document.body.classList.contains("quiz-ready-next")) {
        setQuizReadyNext(true);
      }
    },
    { passive: true },
  );
  window.addEventListener(
    "scroll",
    () => {
      if (state.mode !== "read") return;
      clearTimeout(window.__studyScroll);
      window.__studyScroll = setTimeout(() => {
        state.scrollByView[viewKey()] = window.scrollY;
        saveLs();
      }, 200);
    },
    { passive: true },
  );
  window.addEventListener("pagehide", () => {
    stashView();
    saveLs();
    saveQuizProgress();
  });
}

async function boot() {
  const manifest = await fetch("./manifest.json").then((r) => r.json());
  state.weeks = manifest.weeks;
  state.syncedAt = manifest.syncedAt || null;
  state.quiz =
    manifest.quiz && typeof manifest.quiz === "object" ? manifest.quiz : null;
  const ls = loadLs();
  const hash = parseHash();
  state.currentWeekId = hash.weekId || ls.weekId || manifest.current;
  state.face = ls.face === "def" ? "def" : "term";
  state.showSections = ls.showSections !== false;
  state.mode = ls.mode === "quiz" ? "quiz" : "read";
  state.collapsed =
    ls.collapsed && typeof ls.collapsed === "object" ? ls.collapsed : {};
  state.cursorByView =
    ls.cursorByView && typeof ls.cursorByView === "object"
      ? ls.cursorByView
      : {};
  state.scrollByView =
    ls.scrollByView && typeof ls.scrollByView === "object"
      ? ls.scrollByView
      : {};
  if (!state.weeks.some((w) => w.id === state.currentWeekId)) {
    state.currentWeekId = manifest.current;
  }
  state.chunkId = viewLookup(state.cursorByView) || ls.chunkId || null;
  bind();
  await Promise.all([loadWeek(state.currentWeekId), loadQuizBank()]);
  writeHash();
  setMode(state.mode);
  if (state.mode === "read") {
    renderArticle({ y: viewLookup(state.scrollByView) || 0 });
  }
  if (deadlineTimer) clearInterval(deadlineTimer);
  deadlineTimer = setInterval(renderDeadline, 30000);
}

boot().catch((err) => {
  const article = document.getElementById("article");
  if (article) article.textContent = String(err);
  else console.error(err);
});
