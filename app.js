const LS_KEY = "omscs-study";

const state = {
  weeks: [],
  currentWeekId: "01",
  course: "6460",
  chunkId: null,
  rate: 1,
  playing: false,
  parsed: new Map(),
  syncedAt: null,
  collapsed: {},
  cursorByView: {},
  scrollByView: {},
};

let playGen = 0;

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
      course: state.course,
      chunkId: state.chunkId,
      rate: state.rate,
      collapsed: state.collapsed,
      cursorByView: state.cursorByView,
      scrollByView: state.scrollByView,
    }),
  );
}

function viewKey() {
  return state.currentWeekId + "-" + state.course;
}

function stashView() {
  state.scrollByView[viewKey()] = window.scrollY;
  if (state.chunkId) state.cursorByView[viewKey()] = state.chunkId;
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
  const [weekPart, coursePart] = raw.split("/");
  const weekId = weekPart.replace(/^w/i, "").padStart(2, "0");
  const course = (coursePart || "").replace(/^cs/i, "");
  const out = {};
  if (/^\d{2}$/.test(weekId)) out.weekId = weekId;
  if (course === "6460" || course === "6795") out.course = course;
  return out;
}

function writeHash() {
  const next = "#w" + state.currentWeekId + "/cs" + state.course;
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

function speakText(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
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
    const body = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    const topics = body.split(/^### /m);
    const pushChunk = (title, text, i) => {
      const bands = parseBands(text);
      if (!bands.length) return;
      const raw = bands
        .map((b) => {
          const prefix =
            b.kind === "plain"
              ? "Plain. "
              : b.kind === "quiz"
                ? "Quiz voice. "
                : b.kind === "trap"
                  ? "Trap. "
                  : "";
          return prefix + b.text;
        })
        .join(" ");
      chunks.push({
        id: "w" + weekId + "-s" + sIdx + "-" + i,
        course,
        section: heading,
        title,
        bands,
        raw,
      });
    };
    if (topics.length === 1) {
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
          pushChunk(title, text, i);
        });
      return;
    }
    topics.forEach((topic, i) => {
      if (i === 0) {
        pushChunk("", topic, i);
        return;
      }
      const tNl = topic.indexOf("\n");
      const title = (tNl === -1 ? topic : topic.slice(0, tNl)).trim();
      const text = tNl === -1 ? "" : topic.slice(tNl + 1).trim();
      pushChunk(title, text, i);
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
    (c) => c.course === "both" || c.course === state.course,
  );
}

function cancelSpeech() {
  playGen += 1;
  state.playing = false;
  if (window.speechSynthesis) speechSynthesis.cancel();
  document.getElementById("play").textContent = "Play";
}

function speakFrom() {
  const chunks = visibleChunks();
  if (!chunks.length) return;
  cancelSpeech();
  const gen = playGen;
  state.playing = true;
  document.getElementById("play").textContent = "Pause";
  const rate = state.rate;
  const synth = window.speechSynthesis;

  const go = (n) => {
    if (gen !== playGen) return;
    if (n >= chunks.length) {
      state.playing = false;
      document.getElementById("play").textContent = "Play";
      return;
    }
    setCurrent(chunks[n].id);
    saveLs();
    renderArticle({ scrollId: chunks[n].id });
    const spoken = speakText(chunks[n].title + ". " + chunks[n].raw);
    if (!synth) {
      const words = spoken.split(/\s+/).length;
      const ms = Math.max(1800, (words * 420) / rate);
      setTimeout(() => go(n + 1), ms);
      return;
    }
    const u = new SpeechSynthesisUtterance(spoken);
    u.rate = rate;
    u.lang = "en-US";
    u.onend = () => go(n + 1);
    u.onerror = () => {
      state.playing = false;
      document.getElementById("play").textContent = "Play";
    };
    synth.speak(u);
  };
  go(Math.max(0, chunks.findIndex((c) => c.id === state.chunkId)));
}

function renderNav() {
  const chunks = visibleChunks();
  const idx = Math.max(0, chunks.findIndex((c) => c.id === state.chunkId));
  const current = chunks[idx];
  const menu = $("open-sheet");
  if (menu) {
    menu.textContent = weekLabel(state.currentWeekId) + " · " + state.course;
  }
  const now = $("now");
  if (now) {
    now.textContent = current
      ? `${current.title} · ${idx + 1}/${chunks.length}${state.playing ? " · playing" : ""}`
      : "";
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
  document.querySelectorAll("[data-course]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.course === state.course);
  });
  const rate = $("rate");
  if (rate) rate.value = String(state.rate);
  const parsedWeek = state.parsed.get(state.currentWeekId);
  const checkpoint = $("checkpoint");
  if (checkpoint) {
    checkpoint.textContent = parsedWeek?.dates
      ? `${parsedWeek.dates}. ${chunks.length} chunks.`
      : `${chunks.length} chunks.`;
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
    article.innerHTML = "<p class='muted'>No chunks for this course.</p>";
    renderNav();
    return;
  }
  if (!chunks.some((c) => c.id === state.chunkId)) {
    state.chunkId = chunks[0].id;
  }
  let html = "";
  let lastSection = "";
  chunks.forEach((c) => {
    if (c.section !== lastSection) {
      html += `<h2>${inlineHtml(c.section)}</h2>`;
      lastSection = c.section;
    }
    const active = c.id === state.chunkId ? " active" : "";
    const closed = state.collapsed[c.id] ? " collapsed" : "";
    const label = c.title && c.title !== c.section ? c.title : "Overview";
    const open = closed ? "false" : "true";
    const title = `<button type="button" class="chunk-toggle" aria-expanded="${open}">${inlineHtml(label)}</button>`;
    const bands = (c.bands && c.bands.length
      ? c.bands
      : [{ kind: "body", text: c.raw }]
    )
      .map((b) => {
        if (b.kind === "body") return `<p>${inlineHtml(b.text)}</p>`;
        const bandLabel =
          b.kind === "plain"
            ? "Plain"
            : b.kind === "quiz"
              ? "Quiz voice"
              : "Trap";
        return `<div class="band band-${b.kind}"><span class="band-label">${bandLabel}</span><p>${inlineHtml(b.text)}</p></div>`;
      })
      .join("");
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
  cancelSpeech();
  stashView();
  state.currentWeekId = id;
  await loadWeek(id);
  state.chunkId = state.cursorByView[viewKey()] || null;
  saveLs();
  writeHash();
  renderArticle({ y: state.scrollByView[viewKey()] || 0 });
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
  document.querySelectorAll("[data-course]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cancelSpeech();
      stashView();
      state.course = btn.dataset.course;
      state.chunkId = state.cursorByView[viewKey()] || null;
      saveLs();
      writeHash();
      renderArticle({ y: state.scrollByView[viewKey()] || 0 });
    });
  });
  on("rate", "change", (e) => {
    state.rate = Number(e.target.value) || 1;
    saveLs();
  });
  on("play", "click", () => {
    if (state.playing) cancelSpeech();
    else speakFrom();
    renderNav();
  });
  on("prev", "click", () => {
    const chunks = visibleChunks();
    const idx = chunks.findIndex((c) => c.id === state.chunkId);
    if (idx > 0) {
      cancelSpeech();
      setCurrent(chunks[idx - 1].id);
      saveLs();
      renderArticle({ scrollId: chunks[idx - 1].id });
    }
  });
  on("next", "click", () => {
    const chunks = visibleChunks();
    const idx = chunks.findIndex((c) => c.id === state.chunkId);
    if (idx >= 0 && idx < chunks.length - 1) {
      cancelSpeech();
      setCurrent(chunks[idx + 1].id);
      saveLs();
      renderArticle({ scrollId: chunks[idx + 1].id });
    }
  });
  on("article", "click", (e) => {
    const toggle = e.target.closest(".chunk-toggle");
    const chunk = e.target.closest("[data-chunk]");
    if (!chunk) return;
    if (toggle) {
      const id = chunk.dataset.chunk;
      if (state.collapsed[id]) delete state.collapsed[id];
      else state.collapsed[id] = true;
      saveLs();
      renderArticle();
      return;
    }
    cancelSpeech();
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
  const ls = loadLs();
  const hash = parseHash();
  state.currentWeekId = hash.weekId || ls.weekId || manifest.current;
  const course = hash.course || ls.course;
  state.course = course === "6795" ? "6795" : "6460";
  state.rate = Number(ls.rate) || 1;
  state.collapsed = ls.collapsed && typeof ls.collapsed === "object" ? ls.collapsed : {};
  state.cursorByView =
    ls.cursorByView && typeof ls.cursorByView === "object" ? ls.cursorByView : {};
  state.scrollByView =
    ls.scrollByView && typeof ls.scrollByView === "object" ? ls.scrollByView : {};
  if (!state.weeks.some((w) => w.id === state.currentWeekId)) {
    state.currentWeekId = manifest.current;
  }
  state.chunkId =
    state.cursorByView[viewKey()] || ls.chunkId || null;
  bind();
  await loadWeek(state.currentWeekId);
  writeHash();
  renderArticle({ y: state.scrollByView[viewKey()] || 0 });
}

boot().catch((err) => {
  const article = document.getElementById("article");
  if (article) article.textContent = String(err);
  else console.error(err);
});
