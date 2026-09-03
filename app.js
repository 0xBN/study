const LS_KEY = "omscs-study";
const MATCH_LS_PREFIX = "omscs-study-match:";
const COURSE = "6460";
const CLEARS_NEEDED = 5;
const SESSION_SIZE = 10;

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
  deck: null,
  matchProgress: {},
  matchSession: null,
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
      mode: state.mode,
    }),
  );
}

function matchLsKey(deckId) {
  return MATCH_LS_PREFIX + (deckId || state.deck?.id || "cs6460-m1");
}

function loadMatchProgress(deckId) {
  try {
    const raw = JSON.parse(localStorage.getItem(matchLsKey(deckId)) || "{}");
    return raw.items && typeof raw.items === "object" ? raw.items : {};
  } catch {
    return {};
  }
}

function saveMatchProgress() {
  if (!state.deck) return;
  const payload = {
    deckId: state.deck.id,
    v: 1,
    updatedAt: new Date().toISOString(),
    items: state.matchProgress,
  };
  localStorage.setItem(matchLsKey(state.deck.id), JSON.stringify(payload));
}

function ensureItemProgress(id) {
  if (!state.matchProgress[id]) {
    state.matchProgress[id] = {
      remaining: CLEARS_NEEDED,
      wrong: 0,
      seen: 0,
      last: 0,
    };
  }
  return state.matchProgress[id];
}

function matchStats() {
  const items = state.deck?.items || [];
  const n = items.length || 1;
  let filled = 0;
  let cleared = 0;
  items.forEach((it) => {
    const p = ensureItemProgress(it.id);
    const rem = Math.max(0, Math.min(CLEARS_NEEDED, Number(p.remaining) || 0));
    filled += CLEARS_NEEDED - rem;
    if (rem === 0) cleared += 1;
  });
  const percent = Math.round((100 * filled) / (CLEARS_NEEDED * n));
  const left = items.length - cleared;
  return { percent, cleared, total: items.length, left, filled };
}

function worstTerms(limit) {
  return (state.deck?.items || [])
    .map((it) => {
      const p = ensureItemProgress(it.id);
      return { id: it.id, term: it.term, wrong: p.wrong || 0, remaining: p.remaining };
    })
    .filter((x) => x.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong || b.remaining - a.remaining)
    .slice(0, limit || 8);
}

function viewKey(weekId) {
  return weekId || state.currentWeekId;
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
  return "W" + String(Number(id));
}

function visibleChunks() {
  const parsed = state.parsed.get(state.currentWeekId);
  if (!parsed) return [];
  return parsed.chunks.filter(
    (c) => c.course === "both" || c.course === COURSE,
  );
}

function setMode(mode) {
  state.mode = mode === "match" ? "match" : "read";
  saveLs();
  if (state.mode !== "match") setMatchReadyNext(false);
  const readCtrls = $("read-controls");
  const matchCtrls = $("match-controls");
  const article = $("article");
  const match = $("match");
  const modeRead = $("mode-read");
  const modeMatch = $("mode-match");
  if (readCtrls) readCtrls.hidden = state.mode !== "read";
  if (matchCtrls) matchCtrls.hidden = state.mode !== "match";
  if (article) article.hidden = state.mode !== "read";
  if (match) match.hidden = state.mode !== "match";
  if (modeRead) {
    modeRead.classList.toggle("active", state.mode === "read");
    modeRead.setAttribute("aria-pressed", state.mode === "read" ? "true" : "false");
  }
  if (modeMatch) {
    modeMatch.classList.toggle("active", state.mode === "match");
    modeMatch.setAttribute(
      "aria-pressed",
      state.mode === "match" ? "true" : "false",
    );
  }
  if (state.mode === "match") {
    ensureMatchSession();
    renderMatch();
  } else {
    renderArticle();
  }
  renderNav();
}

function renderNav() {
  const chunks = visibleChunks();
  const menu = $("open-sheet");
  if (menu) {
    menu.textContent = "CS6460 · " + weekLabel(state.currentWeekId);
  }
  const menuMatch = $("open-sheet-match");
  if (menuMatch) {
    const st = matchStats();
    menuMatch.textContent = state.deck
      ? `${state.deck.title} · ${st.percent}%`
      : "Match";
  }
  const status = $("match-status");
  if (status && state.mode === "match") {
    const st = matchStats();
    const sess = state.matchSession;
    const qPart = sess
      ? sess.phase === "board"
        ? "done"
        : `${Math.min(sess.index + 1, sess.size)}/${sess.size}`
      : "";
    const streak = sess && sess.streak > 1 ? ` · ×${sess.streak}` : "";
    status.innerHTML = `Study ${st.percent}% · left ${st.left}${
      qPart ? ` · Q ${qPart}` : ""
    }${
      streak
        ? `<span class="match-streak${
            sess.answered && sess.lastCorrect ? " bump" : ""
          }">${streak}</span>`
        : ""
    }`;
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
    synced.textContent = state.syncedAt
      ? "Last sync " +
        new Date(state.syncedAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "";
  }
  const sheetStats = $("match-sheet-stats");
  if (sheetStats) {
    if (!state.deck) {
      sheetStats.textContent = "Match deck not loaded.";
    } else {
      const st = matchStats();
      const worst = worstTerms(5)
        .map((w) => `${w.term} (wrong ${w.wrong}, left ${w.remaining})`)
        .join("; ");
      sheetStats.textContent = `Study ${st.percent}% · ${st.cleared}/${st.total} terms cleared.${
        worst ? " Weak: " + worst : " No misses yet."
      }`;
    }
  }
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

function itemById(id) {
  return (state.deck?.items || []).find((i) => i.id === id);
}

function pickDueItem(excludeId) {
  const due = (state.deck?.items || []).filter((it) => {
    if (excludeId && it.id === excludeId) return false;
    return ensureItemProgress(it.id).remaining > 0;
  });
  if (!due.length) return null;
  const now = Date.now();
  const scored = due.map((it) => {
    const p = ensureItemProgress(it.id);
    const age = Math.max(0, now - (p.last || 0)) / 60000;
    const weight =
      p.remaining * 3 + (p.wrong || 0) * 4 + Math.min(20, age / 5) + Math.random();
    return { it, weight };
  });
  scored.sort((a, b) => b.weight - a.weight);
  return scored[0].it;
}

function pickDistractor(correct) {
  const byId = new Map((state.deck?.items || []).map((i) => [i.id, i]));
  const sibs = (correct.siblings || [])
    .map((id) => byId.get(id))
    .filter(Boolean);
  if (sibs.length) {
    return sibs[Math.floor(Math.random() * sibs.length)];
  }
  const others = (state.deck?.items || []).filter((i) => i.id !== correct.id);
  return others[Math.floor(Math.random() * others.length)];
}

function shuffle2(a, b) {
  return Math.random() < 0.5 ? [a, b] : [b, a];
}

const MATCH_STOP = new Set([
  "versus",
  "vs",
  "the",
  "and",
  "or",
  "of",
  "a",
  "an",
  "for",
  "to",
  "in",
  "on",
  "with",
  "from",
  "that",
  "this",
  "than",
  "into",
  "goal",
  "orientation",
  "lesson",
  "cite",
  "etymology",
  "other",
  "more",
  "high",
  "low",
  "floor",
  "ceiling",
  "capital",
  "lowercase",
  "direct",
  "visual",
  "auditory",
  "kinesthetic",
  "top",
  "not",
  "why",
  "what",
  "when",
  "your",
  "their",
]);

function termKeyParts(term) {
  const full = String(term);
  const withoutParen = full.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const parenBits = [...full.matchAll(/\(([^)]+)\)/g)].map((m) => m[1]);
  const allForTokens = [withoutParen, ...parenBits].join(" ");
  const tokens = allForTokens
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3 && !MATCH_STOP.has(t));
  const acronyms = full.match(/\b[A-Z]{2,}\b/g) || [];
  const phrases = [withoutParen, ...parenBits]
    .map((p) => p.trim())
    .filter((p) => p.length > 3);
  return {
    phrase: withoutParen,
    phrases: [...new Set(phrases)],
    tokens: [...new Set(tokens)],
    acronyms: [...new Set(acronyms)],
  };
}

function leakScore(text, term) {
  if (!text || !term) return 0;
  const lower = String(text).toLowerCase();
  const parts = termKeyParts(term);
  let score = 0;
  parts.phrases.forEach((p) => {
    if (p.length > 3 && lower.includes(p.toLowerCase())) score += 8;
  });
  parts.tokens.forEach((t) => {
    if (new RegExp("\\b" + t + "\\b", "i").test(text)) {
      score += t.length >= 7 ? 4 : 2;
    }
  });
  parts.acronyms.forEach((a) => {
    if (new RegExp("\\b" + a + "\\b", "i").test(text)) score += 5;
  });
  return score;
}

function scrubFace(face, term) {
  let out = String(face);
  const parts = termKeyParts(term);
  parts.phrases
    .slice()
    .sort((a, b) => b.length - a.length)
    .forEach((p) => {
      const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      out = out.replace(re, "this idea");
    });
  parts.acronyms.forEach((a) => {
    out = out.replace(new RegExp("\\b" + a + "\\b", "g"), "this idea");
  });
  parts.tokens
    .filter((t) => t.length >= 4)
    .sort((a, b) => b.length - a.length)
    .forEach((t) => {
      out = out.replace(new RegExp("\\b" + t + "\\b", "gi"), "this");
    });
  return out
    .replace(/\bthis idea\s*:\s*/gi, "")
    .replace(/\bthis\s+this\b/gi, "this")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .replace(/^[,.\s]+/, "")
    .trim();
}

function pickFace(item, againstTerm) {
  const faces =
    item.faces && item.faces.length ? item.faces.slice() : [item.term];
  let best = faces[0];
  let bestScore = Infinity;
  faces
    .slice()
    .sort(() => Math.random() - 0.5)
    .forEach((f) => {
      const display = scrubFace(f, item.term);
      let s = leakScore(f, item.term) * 2 + leakScore(display, item.term) * 3;
      if (againstTerm) {
        s += leakScore(f, againstTerm) + leakScore(display, againstTerm);
      }
      if (s < bestScore) {
        bestScore = s;
        best = f;
      }
    });
  return {
    face: best,
    leak: bestScore,
    display: scrubFace(best, item.term),
  };
}

function buildQuestion(prevId) {
  const item = pickDueItem(prevId);
  if (!item) return null;
  const distractor = pickDistractor(item);
  if (!distractor) return null;
  const direction = Math.random() < 0.5 ? "term" : "claim";
  const picked = pickFace(item, distractor.term);
  const distractorFace = pickFace(distractor, item.term);
  let prompt;
  let choices;
  if (direction === "term") {
    prompt = item.term;
    choices = shuffle2(
      { id: item.id, label: picked.display, correct: true },
      { id: distractor.id, label: distractorFace.display, correct: false },
    );
  } else {
    prompt = picked.display;
    choices = shuffle2(
      { id: item.id, label: item.term, correct: true },
      { id: distractor.id, label: distractor.term, correct: false },
    );
  }
  return {
    itemId: item.id,
    term: item.term,
    canonical: (item.faces && item.faces[0]) || "",
    direction,
    prompt,
    choices,
  };
}

function ensureMatchSession(forceNew) {
  if (!state.deck) return;
  if (
    !forceNew &&
    state.matchSession &&
    state.matchSession.phase !== "board"
  ) {
    return;
  }
  const st = matchStats();
  state.matchSession = {
    size: Math.min(SESSION_SIZE, Math.max(1, st.left || SESSION_SIZE)),
    index: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    misses: [],
    phase: "ask",
    question: null,
    answered: false,
  };
  if (st.left === 0) {
    state.matchSession.phase = "cleared";
    state.matchSession.question = null;
    return;
  }
  state.matchSession.question = buildQuestion(null);
  if (!state.matchSession.question) {
    state.matchSession.phase = "cleared";
  }
}

function applyAnswer(correct) {
  const sess = state.matchSession;
  if (!sess || !sess.question) return;
  const id = sess.question.itemId;
  const p = ensureItemProgress(id);
  p.seen = (p.seen || 0) + 1;
  p.last = Date.now();
  if (correct) {
    p.remaining = Math.max(0, (p.remaining || CLEARS_NEEDED) - 1);
    sess.correct += 1;
    sess.streak = (sess.streak || 0) + 1;
  } else {
    p.remaining = CLEARS_NEEDED;
    p.wrong = (p.wrong || 0) + 1;
    sess.wrong += 1;
    sess.streak = 0;
    sess.misses.push(id);
  }
  saveMatchProgress();
}

function playMatchJuice(correct, streak) {
  const body = document.body;
  body.classList.remove("match-hit", "match-hit-big", "match-miss");
  void body.offsetWidth;
  if (correct) {
    body.classList.add(streak >= 3 ? "match-hit-big" : "match-hit");
    try {
      if (navigator.vibrate) {
        navigator.vibrate(streak >= 3 ? [10, 35, 12, 35, 18] : [10, 40, 14]);
      }
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

function advanceMatch() {
  const sess = state.matchSession;
  if (!sess) return;
  sess.index += 1;
  sess.answered = false;
  sess.lastCorrect = false;
  if (sess.index >= sess.size || matchStats().left === 0) {
    sess.phase = matchStats().left === 0 ? "cleared" : "board";
    sess.question = null;
  } else {
    sess.phase = "ask";
    sess.question = buildQuestion(sess.question?.itemId);
    if (!sess.question) {
      sess.phase = matchStats().left === 0 ? "cleared" : "board";
    }
  }
  renderMatch();
  renderNav();
}

function setMatchReadyNext(on) {
  document.body.classList.toggle("match-ready-next", !!on);
  const root = $("match");
  if (root) root.classList.toggle("match-ready-next", !!on);
  const hit = $("match-next-hit");
  if (!hit) return;
  hit.hidden = !on;
  if (on) {
    const nav = document.querySelector(".nav");
    const top = nav ? Math.ceil(nav.getBoundingClientRect().bottom) : 0;
    hit.style.top = top + "px";
  }
}

function renderMatch() {
  const root = $("match");
  if (!root || state.mode !== "match") return;
  if (!state.deck) {
    root.innerHTML = "<p class='muted'>Loading match deck…</p>";
    setMatchReadyNext(false);
    return;
  }
  const sess = state.matchSession;
  if (!sess) {
    ensureMatchSession(true);
  }
  const st = matchStats();
  const s = state.matchSession;

  if (s.phase === "cleared") {
    setMatchReadyNext(false);
    root.innerHTML = `
      <div class="match-board">
        <h2>Deck cleared</h2>
        <p>Study 100%. All ${st.total} terms have ${CLEARS_NEEDED} corrects.</p>
        <div class="sheet-actions">
          <button type="button" id="match-again" class="primary">Reset and drill again</button>
          <button type="button" id="match-to-read">Back to Read</button>
        </div>
      </div>`;
    renderNav();
    return;
  }

  if (s.phase === "board") {
    setMatchReadyNext(false);
    const missList = [...new Set(s.misses)]
      .map((id) => itemById(id))
      .filter(Boolean)
      .map((it) => {
        const p = ensureItemProgress(it.id);
        return `<li>${inlineHtml(it.term)} · wrong ${p.wrong}, remaining ${p.remaining}</li>`;
      })
      .join("");
    root.innerHTML = `
      <div class="match-board">
        <h2>Session done</h2>
        <p>${s.correct} correct · ${s.wrong} wrong · Study ${st.percent}% · ${st.cleared}/${st.total} cleared</p>
        ${missList ? `<p class="label">Missed this session</p><ul>${missList}</ul>` : "<p class='muted'>No misses this session.</p>"}
        <div class="sheet-actions">
          <button type="button" id="match-again" class="primary">Drill again</button>
          <button type="button" id="match-to-read">Back to Read</button>
        </div>
      </div>`;
    renderNav();
    return;
  }

  const q = s.question;
  if (!q) {
    setMatchReadyNext(false);
    root.innerHTML = "<p class='muted'>No due terms.</p>";
    return;
  }
  let fb = "";
  if (s.answered) {
    if (s.lastCorrect) {
      const streakBit =
        s.streak > 1 ? ` <span class="match-streak bump">×${s.streak}</span>` : "";
      fb = `<div class="match-fb fb-ok"><strong>Correct${streakBit}</strong><p class="muted match-tap">Tap for next</p></div>`;
    } else {
      fb = `<div class="match-fb fb-bad"><strong>Wrong</strong><p><strong>${inlineHtml(q.term)}</strong></p><p>${inlineHtml(q.canonical)}</p><p class="muted match-tap">Tap for next</p></div>`;
    }
  }
  const choices = q.choices
    .map((c) => {
      let cls = "";
      if (s.answered) {
        if (c.correct) cls = " pick-ok";
        else if (s.pickedId === c.id) cls = " pick-bad";
      }
      return `<button type="button" data-choice="${c.id}" class="${cls}" ${
        s.answered ? "disabled" : ""
      }>${inlineHtml(c.label)}</button>`;
    })
    .join("");
  setMatchReadyNext(!!s.answered);
  root.innerHTML = `
    <p class="match-prompt">${inlineHtml(q.prompt)}</p>
    <div class="match-choices">${choices}</div>
    ${fb}`;
  renderNav();
}

function exportMatchProgress() {
  if (!state.deck) return;
  const st = matchStats();
  const blob = {
    deckId: state.deck.id,
    v: 1,
    percent: st.percent,
    cleared: st.cleared,
    total: st.total,
    items: state.matchProgress,
  };
  const text =
    "```study-match-progress\n" +
    JSON.stringify(blob) +
    "\n```";
  navigator.clipboard.writeText(text).then(
    () => {
      const el = $("match-sheet-stats");
      if (el) el.textContent = "Copied progress block to clipboard.";
    },
    () => {
      const ta = $("match-import");
      if (ta) {
        ta.value = text;
        ta.focus();
        ta.select();
      }
    },
  );
}

function importMatchProgress() {
  const ta = $("match-import");
  if (!ta || !state.deck) return;
  let raw = ta.value.trim();
  const fenced = raw.match(
    /```(?:study-match-progress)?\s*([\s\S]*?)```/,
  );
  if (fenced) raw = fenced[1].trim();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    alert("Could not parse progress JSON.");
    return;
  }
  if (data.deckId && data.deckId !== state.deck.id) {
    if (!confirm(`Progress deck ${data.deckId} ≠ ${state.deck.id}. Import anyway?`)) {
      return;
    }
  }
  const items = data.items && typeof data.items === "object" ? data.items : data;
  state.matchProgress = {};
  Object.keys(items).forEach((id) => {
    const p = items[id] || {};
    state.matchProgress[id] = {
      remaining:
        typeof p.remaining === "number" ? p.remaining : CLEARS_NEEDED,
      wrong: Number(p.wrong) || 0,
      seen: Number(p.seen) || 0,
      last: Number(p.last) || 0,
    };
  });
  (state.deck.items || []).forEach((it) => ensureItemProgress(it.id));
  saveMatchProgress();
  ensureMatchSession(true);
  if (state.mode === "match") renderMatch();
  renderNav();
  ta.value = "";
}

function resetMatchDeck() {
  if (!state.deck) return;
  if (!confirm("Reset Match progress for this deck? Wrong counts stay.")) {
    return;
  }
  (state.deck.items || []).forEach((it) => {
    const p = ensureItemProgress(it.id);
    p.remaining = CLEARS_NEEDED;
    p.last = 0;
  });
  saveMatchProgress();
  ensureMatchSession(true);
  if (state.mode === "match") renderMatch();
  renderNav();
}

async function loadWeek(id) {
  if (state.parsed.has(id)) return;
  const meta = weekMeta(id);
  const res = await fetch("./" + meta.file);
  const md = await res.text();
  state.parsed.set(id, parseKnow(md, id));
}

async function loadDeck() {
  const res = await fetch("./decks/cs6460-module-1.json");
  state.deck = await res.json();
  if (typeof state.deck.clearsNeeded === "number") {
    /* deck may set clearsNeeded; session still uses SESSION_SIZE */
  }
  state.matchProgress = loadMatchProgress(state.deck.id);
  (state.deck.items || []).forEach((it) => ensureItemProgress(it.id));
  saveMatchProgress();
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
  on("mode-match", "click", () => setMode("match"));
  on("open-sheet", "click", openSheet);
  on("open-sheet-match", "click", openSheet);
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
  on("match", "click", (e) => {
    const again = e.target.closest("#match-again");
    if (again) {
      if (matchStats().left === 0 && state.matchSession?.phase === "cleared") {
        (state.deck.items || []).forEach((it) => {
          ensureItemProgress(it.id).remaining = CLEARS_NEEDED;
        });
        saveMatchProgress();
      }
      ensureMatchSession(true);
      renderMatch();
      renderNav();
      return;
    }
    if (e.target.closest("#match-to-read")) {
      setMode("read");
      return;
    }
    const sess = state.matchSession;
    const choice = e.target.closest("[data-choice]");
    if (!choice || !sess || sess.answered) return;
    const id = choice.getAttribute("data-choice");
    const q = sess.question;
    const correct = q.choices.some((c) => c.id === id && c.correct);
    sess.answered = true;
    sess.lastCorrect = correct;
    sess.pickedId = id;
    applyAnswer(correct);
    renderMatch();
    playMatchJuice(correct, sess.streak || 0);
  });
  on("match-next-hit", "click", () => {
    const sess = state.matchSession;
    if (state.mode !== "match" || !sess || !sess.answered || sess.phase !== "ask") {
      return;
    }
    advanceMatch();
  });
  window.addEventListener(
    "resize",
    () => {
      if (document.body.classList.contains("match-ready-next")) {
        setMatchReadyNext(true);
      }
    },
    { passive: true },
  );
  on("match-export", "click", exportMatchProgress);
  on("match-import-btn", "click", importMatchProgress);
  on("match-reset", "click", resetMatchDeck);
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
    saveMatchProgress();
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
  state.mode = ls.mode === "match" ? "match" : "read";
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
  await Promise.all([loadWeek(state.currentWeekId), loadDeck()]);
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
