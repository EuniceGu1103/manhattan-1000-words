/* ==========================================================================
   Shared utilities: theme toggle, ADHD/Bionic reading mode, nav injection
   ========================================================================== */

const GRE = (() => {
  const THEME_KEY = "gre1000-theme"; // "light" | "dark" | null(auto)
  const READ_KEY = "gre1000-readmode"; // "normal" | "bionic"

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "auto";
  }
  function setTheme(mode) {
    const root = document.documentElement;
    if (mode === "auto") {
      root.removeAttribute("data-theme");
      localStorage.removeItem(THEME_KEY);
    } else {
      root.setAttribute("data-theme", mode);
      localStorage.setItem(THEME_KEY, mode);
    }
    updateThemeButton();
  }
  function cycleTheme() {
    // auto (follow system) -> light -> dark -> auto
    const current = getTheme();
    const next = current === "auto" ? "light" : current === "light" ? "dark" : "auto";
    setTheme(next);
  }
  function updateThemeButton() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    const current = getTheme();
    const labels = { auto: "🌗 Auto", light: "☀️ Light", dark: "🌙 Dark" };
    btn.textContent = labels[current] || labels.auto;
    btn.title = "Theme: Auto (follows system) → Light → Dark. Click to change.";
  }

  function getReadMode() {
    return localStorage.getItem(READ_KEY) || "normal";
  }
  function setReadMode(mode) {
    localStorage.setItem(READ_KEY, mode);
    document.documentElement.setAttribute("data-readmode", mode);
    updateReadButton();
    applyBionicToPage();
  }
  function toggleReadMode() {
    setReadMode(getReadMode() === "bionic" ? "normal" : "bionic");
  }
  function updateReadButton() {
    const btn = document.getElementById("read-toggle");
    if (!btn) return;
    btn.textContent = getReadMode() === "bionic" ? "🧠 ADHD Mode: On" : "📖 Normal Reading";
  }

  // Bionic reading: bold a random-ish leading portion of each English word.
  function bionicWord(word) {
    if (!/^[A-Za-z][A-Za-z'’-]*$/.test(word)) return word;
    const len = word.length;
    if (len <= 1) return word;
    // random fraction between .35 and .6, but at least 1 char bold
    const frac = 0.35 + Math.random() * 0.25;
    let boldLen = Math.max(1, Math.round(len * frac));
    if (boldLen >= len) boldLen = len - 1;
    const head = word.slice(0, boldLen);
    const tail = word.slice(boldLen);
    return `<b class="bionic-strong">${head}</b>${tail}`;
  }

  function bionicText(text) {
    // Split on word boundaries, keep punctuation/spaces intact.
    return text.replace(/[A-Za-z][A-Za-z'’-]*/g, (m) => bionicWord(m));
  }

  // Apply/remove bionic transform on elements flagged with [data-bionic-src]
  // We keep the original English text in data-bionic-src so toggling is reversible
  // and re-randomizes each time.
  function markBionicTargets(root = document) {
    root.querySelectorAll(".en, .prompt-en, [data-bionic]").forEach((el) => {
      if (!el.dataset.bionicSrc) {
        el.dataset.bionicSrc = el.textContent;
      }
    });
  }

  function applyBionicToPage(root = document) {
    markBionicTargets(root);
    const bionic = getReadMode() === "bionic";
    root.querySelectorAll(".en, .prompt-en, [data-bionic]").forEach((el) => {
      const src = el.dataset.bionicSrc ?? el.textContent;
      if (bionic) {
        el.innerHTML = bionicText(src);
      } else {
        el.textContent = src;
      }
    });
  }

  function injectNav(activePage) {
    const mount = document.getElementById("nav-mount");
    if (!mount) return;
    const isRoot = !location.pathname.includes("/pages/");
    const homeHref = isRoot ? "index.html" : "../index.html";
    const reviewHref = isRoot ? "pages/review.html" : "review.html";
    const wrongHref = isRoot ? "pages/wrongbook.html" : "wrongbook.html";

    mount.innerHTML = `
      <nav class="nav">
        <div class="nav-inner">
          <a class="brand" href="${homeHref}"><span class="dot"></span>GRE Vocabulary Snapshot</a>
          <div class="nav-links">
            <a href="${homeHref}" class="${activePage === "welcome" ? "active" : ""}">Welcome</a>
            <a href="${reviewHref}" class="${activePage === "review" ? "active" : ""}">Review Quiz</a>
            <a href="${wrongHref}" class="${activePage === "wrongbook" ? "active" : ""}">Mistake Book</a>
          </div>
          <div class="nav-toggles">
            <button id="read-toggle" class="toggle-btn" type="button"></button>
            <button id="theme-toggle" class="toggle-btn" type="button"></button>
          </div>
        </div>
      </nav>`;

    document.getElementById("theme-toggle").addEventListener("click", cycleTheme);
    document.getElementById("read-toggle").addEventListener("click", toggleReadMode);
    updateThemeButton();
    updateReadButton();
  }

  function injectFooter() {
    const mount = document.getElementById("footer-mount");
    if (!mount) return;
    mount.innerHTML = `
      <footer class="footer wrap no-print">
        <p style="margin:0 0 6px">
          Contact: <a href="mailto:eunicegu1103@gmail.com">eunicegu1103@gmail.com</a>
          &nbsp;·&nbsp;
          <a href="https://github.com/EuniceGu1103/manhattan-1000-words" target="_blank" rel="noopener">GitHub Repository</a>
        </p>
        <p style="margin:0;opacity:.75">GRE Vocabulary Snapshot · Data adapted from Manhattan Prep 1000 GRE Words</p>
      </footer>`;
  }

  function dataPath(file) {
    const isRoot = !location.pathname.includes("/pages/");
    return (isRoot ? "data/" : "../data/") + file;
  }

  async function loadWords() {
    const res = await fetch(dataPath("words.json"));
    return res.json();
  }

  // ---------- Wrong-answer book (localStorage) ----------
  const WRONG_KEY = "gre1000-wrongbook"; // { [id]: { word, zh, count, lastMissedAt } }

  function getWrongBook() {
    try {
      return JSON.parse(localStorage.getItem(WRONG_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }
  function saveWrongBook(book) {
    localStorage.setItem(WRONG_KEY, JSON.stringify(book));
  }
  function logMistake(entry) {
    const book = getWrongBook();
    const zhSummary = entry.senses.map((s) => s.zh).join("；");
    if (book[entry.id]) {
      book[entry.id].count += 1;
      book[entry.id].lastMissedAt = Date.now();
    } else {
      book[entry.id] = {
        id: entry.id,
        word: entry.word,
        zh: zhSummary,
        count: 1,
        lastMissedAt: Date.now(),
      };
    }
    saveWrongBook(book);
  }
  function removeFromWrongBook(id) {
    const book = getWrongBook();
    delete book[id];
    saveWrongBook(book);
  }
  function clearWrongBook() {
    saveWrongBook({});
  }

  // apply saved theme/readmode ASAP (before nav injection) to avoid flash
  (function initEarly() {
    const t = getTheme();
    if (t !== "auto") document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-readmode", getReadMode());
  })();

  return {
    getTheme, setTheme, cycleTheme,
    getReadMode, setReadMode, toggleReadMode,
    applyBionicToPage, bionicText,
    injectNav, injectFooter, loadWords, dataPath,
    getWrongBook, saveWrongBook, logMistake, removeFromWrongBook, clearWrongBook,
  };
})();
