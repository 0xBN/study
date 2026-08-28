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
    }),
  );
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
    const paras = body
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p && p !== "---");
    paras.forEach((para, i) => {
      if (para.startsWith("|")) return;
      const titleMatch = para.match(/^\*\*([^*]+)\*\*/);
      const title = titleMatch
        ? titleMatch[1].replace(/\.\s*$/, "")
        : heading;
      chunks.push({
        id: "w" + weekId + "-s" + sIdx + "-" + i,
        course,
        section: heading,
        title,
        raw: para,
      });
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
    state.chunkId = chunks[n].id;
    saveLs();
    renderArticle();
    const node = document.getElementById(chunks[n].id);
    if (node) node.scrollIntoView({ block: "center" });
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
  document.getElementById("open-sheet").textContent =
    weekLabel(state.currentWeekId) + " · " + state.course;
  document.getElementById("now").textContent = current
    ? `${current.title} · ${idx + 1}/${chunks.length}${state.playing ? " · playing" : ""}`
    : "";
  document.getElementById("weeks").innerHTML = state.weeks
    .map((w) => {
      const active = w.id === state.currentWeekId ? " active" : "";
      const parsed = state.parsed.get(w.id);
      const dates = parsed?.dates ? ` · ${parsed.dates}` : "";
      return `<button type="button" class="${active}" data-week="${w.id}">Week ${Number(w.id)}${dates}</button>`;
    })
    .join("");
  document.querySelectorAll("[data-course]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.course === state.course);
  });
  document.getElementById("rate").value = String(state.rate);
  const parsedWeek = state.parsed.get(state.currentWeekId);
  document.getElementById("checkpoint").textContent = parsedWeek?.dates
    ? `${parsedWeek.dates}. ${chunks.length} chunks.`
    : `${chunks.length} chunks.`;
  document.getElementById("missing").textContent = parsedWeek?.missing || "";
  document.getElementById("synced").textContent = state.syncedAt
    ? "Last sync " +
      new Date(state.syncedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";
}

function renderArticle() {
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
    html += `<div class="chunk${active}" id="${c.id}" data-chunk="${c.id}"><h3>${inlineHtml(c.title)}</h3><p>${inlineHtml(c.raw)}</p></div>`;
  });
  article.innerHTML = html;
  renderNav();
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
  state.currentWeekId = id;
  await loadWeek(id);
  const chunks = visibleChunks();
  if (chunks.length) state.chunkId = chunks[0].id;
  saveLs();
  writeHash();
  renderArticle();
  window.scrollTo(0, 0);
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
      state.course = btn.dataset.course;
      saveLs();
      writeHash();
      renderArticle();
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
      state.chunkId = chunks[idx - 1].id;
      saveLs();
      renderArticle();
    }
  });
  on("next", "click", () => {
    const chunks = visibleChunks();
    const idx = chunks.findIndex((c) => c.id === state.chunkId);
    if (idx >= 0 && idx < chunks.length - 1) {
      cancelSpeech();
      state.chunkId = chunks[idx + 1].id;
      saveLs();
      renderArticle();
    }
  });
  on("article", "click", (e) => {
    const chunk = e.target.closest("[data-chunk]");
    if (!chunk) return;
    cancelSpeech();
    state.chunkId = chunk.dataset.chunk;
    saveLs();
    renderArticle();
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
  state.chunkId = ls.chunkId || null;
  state.rate = Number(ls.rate) || 1;
  if (!state.weeks.some((w) => w.id === state.currentWeekId)) {
    state.currentWeekId = manifest.current;
  }
  bind();
  await loadWeek(state.currentWeekId);
  writeHash();
  renderArticle();
}

boot().catch((err) => {
  const article = document.getElementById("article");
  if (article) article.textContent = String(err);
  else console.error(err);
});
