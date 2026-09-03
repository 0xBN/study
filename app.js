const LS_KEY = "omscs-study";
const COURSE = "6460";

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
};

let deadlineTimer = 0;

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
    detail.textContent = ms <= 0
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
    }),
  );
}

function viewKey(weekId) {
  return weekId || state.currentWeekId;
}

/** Prefer week-only keys; fall back to old week-course keys from dual-course builds. */
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
  return text
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
      return;
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

function renderNav() {
  const chunks = visibleChunks();
  const menu = $("open-sheet");
  if (menu) {
    menu.textContent = "CS6460 · " + weekLabel(state.currentWeekId);
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
  renderDeadline();
}

function renderArticle(opts) {
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

async function loadWeek(id) {
  if (state.parsed.has(id)) return;
  const meta = weekMeta(id);
  const res = await fetch("./" + meta.file);
  const md = await res.text();
  state.parsed.set(id, parseKnow(md, id));
}

async function showWeek(id) {
  stashView();
  state.currentWeekId = id;
  await loadWeek(id);
  state.chunkId = viewLookup(state.cursorByView) || null;
  saveLs();
  writeHash();
  renderArticle({ y: viewLookup(state.scrollByView) || 0 });
}

function $(id) {
  return document.getElementById(id);
}

function on(id, event, fn) {
  const el = $(id);
  if (!el) return;
  el.addEventListener(event, fn);
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
  window.addEventListener(
    "scroll",
    () => {
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
  state.chunkId =
    viewLookup(state.cursorByView) || ls.chunkId || null;
  bind();
  await loadWeek(state.currentWeekId);
  writeHash();
  renderArticle({ y: viewLookup(state.scrollByView) || 0 });
  if (deadlineTimer) clearInterval(deadlineTimer);
  deadlineTimer = setInterval(renderDeadline, 30000);
}

boot().catch((err) => {
  const article = document.getElementById("article");
  if (article) article.textContent = String(err);
  else console.error(err);
});
