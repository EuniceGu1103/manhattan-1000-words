/* Review / quiz page logic */
(function () {
  let ALL_WORDS = [];
  let direction = "en2zh";
  let selectedChunks = new Set();
  let queue = [];
  let idx = 0;
  let stats = { correct: 0, wrong: 0 };
  let revealState = "none"; // "none" | "peek" (left-arrow shown, awaiting judge) | "full" (right-arrow shown, awaiting next)

  const $ = (sel) => document.querySelector(sel);

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  async function init() {
    ALL_WORDS = await GRE.loadWords();
    buildChunkChips();
    bindSetupControls();
  }

  function buildChunkChips() {
    const wrap = $("#chunk-chips");
    for (let i = 1; i <= 10; i++) {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.dataset.chunk = i;
      chip.textContent = `Chunk ${i}`;
      chip.addEventListener("click", () => {
        chip.classList.toggle("selected");
        if (chip.classList.contains("selected")) selectedChunks.add(i);
        else selectedChunks.delete(i);
      });
      wrap.appendChild(chip);
    }
  }

  function bindSetupControls() {
    $("#select-all-btn").addEventListener("click", () => {
      selectedChunks = new Set([1,2,3,4,5,6,7,8,9,10]);
      document.querySelectorAll(".chip").forEach((c) => c.classList.add("selected"));
    });
    $("#select-none-btn").addEventListener("click", () => {
      selectedChunks.clear();
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
    });
    document.querySelectorAll(".direction-card").forEach((card) => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".direction-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        direction = card.dataset.dir;
      });
    });
    $("#start-btn").addEventListener("click", startSession);
    $("#quit-btn").addEventListener("click", () => finishSession(true));
    $("#restart-btn").addEventListener("click", resetToSetup);
    $("#btn-right").addEventListener("click", () => judge(true));
    $("#btn-wrong").addEventListener("click", () => judge(false));
    document.addEventListener("keydown", onKeydown);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startSession() {
    const wrongOnly = $("#wrongbook-only").checked;
    let pool;
    if (wrongOnly) {
      const book = GRE.getWrongBook();
      const ids = new Set(Object.keys(book).map(Number));
      pool = ALL_WORDS.filter((w) => ids.has(w.id));
      if (pool.length === 0) {
        showSetupError("Your Mistake Book is empty — complete a few quiz rounds first to build it up.");
        return;
      }
    } else {
      if (selectedChunks.size === 0) {
        showSetupError("Please select at least one word group, or check “Quiz only Mistake Book words”.");
        return;
      }
      pool = ALL_WORDS.filter((w) => selectedChunks.has(w.chunk));
    }

    queue = shuffle(pool);
    idx = 0;
    stats = { correct: 0, wrong: 0 };
    $("#setup-panel").style.display = "none";
    $("#summary-panel").style.display = "none";
    $("#card-stage").style.display = "flex";
    showCard();
  }

  function showSetupError(msg) {
    const el = $("#setup-error");
    el.textContent = msg;
    el.style.display = "block";
  }

  function currentWord() {
    return queue[idx];
  }

  function promptTextFor(w) {
    if (direction === "en2zh") return w.word;
    return w.senses.map((s) => s.zh).join("；");
  }

  function senseListHtml(w) {
    return w.senses.map((s) => `
      <div class="sense">
        <span class="pos">${escapeHtml(s.pos)}</span>
        <span class="en" data-bionic>${escapeHtml(s.en)}</span>
        <span class="zh">${escapeHtml(s.zh)}</span>
      </div>`).join("");
  }

  function exampleListHtml(w) {
    return `<div class="examples">` + w.examples.map((ex) => `
      <div class="example">
        <div><span class="bullet">›</span><span class="en" data-bionic>${escapeHtml(ex.en)}</span></div>
        <div class="zh" style="margin-left:16px">${escapeHtml(ex.zh)}</div>
      </div>`).join("") + `</div>`;
  }

  function showCard() {
    revealState = "none";
    const w = currentWord();
    $("#reveal-block").style.display = "none";
    $("#reveal-block").innerHTML = "";
    $("#judge-row").style.display = "none";
    $("#prompt-hint").textContent = "Think of the answer first, then press ← or →";
    const promptEl = $("#prompt-text");
    if (direction === "en2zh") {
      promptEl.dataset.bionicSrc = w.word;
      promptEl.textContent = w.word;
      promptEl.classList.add("en");
    } else {
      promptEl.classList.remove("en");
      delete promptEl.dataset.bionicSrc;
      promptEl.textContent = promptTextFor(w);
    }
    GRE.applyBionicToPage($("#flashcard"));
    updateProgress();
  }

  function updateProgress() {
    const pct = queue.length ? Math.round((idx / queue.length) * 100) : 0;
    $("#progress-fill").style.width = pct + "%";
    $("#progress-label").textContent = `Word ${idx + 1} / ${queue.length} · Correct ${stats.correct} · Wrong ${stats.wrong}`;
  }

  function onKeydown(e) {
    if ($("#card-stage").style.display === "none") return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (revealState === "none") peekReveal();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (revealState === "none") fullRevealAndMiss();
      else if (revealState === "full") advance();
    } else if (e.key === " ") {
      e.preventDefault();
      if (revealState === "full") advance();
    }
  }

  function peekReveal() {
    revealState = "peek";
    const w = currentWord();
    let html;
    if (direction === "en2zh") {
      html = senseListHtml(w);
    } else {
      html = `<div class="sense" style="justify-content:center"><span class="word" data-bionic style="font-size:22px;font-weight:800">${escapeHtml(w.word)}</span></div>` + senseListHtml(w);
    }
    $("#reveal-block").innerHTML = html;
    $("#reveal-block").style.display = "flex";
    $("#judge-row").style.display = "flex";
    $("#prompt-hint").textContent = "Compare with the definition below and grade yourself";
    GRE.applyBionicToPage($("#flashcard"));
  }

  function fullRevealAndMiss() {
    revealState = "full";
    const w = currentWord();
    let html = "";
    if (direction === "zh2en") {
      html += `<div class="sense" style="justify-content:center"><span class="word" data-bionic style="font-size:22px;font-weight:800">${escapeHtml(w.word)}</span></div>`;
    }
    html += senseListHtml(w) + exampleListHtml(w);
    $("#reveal-block").innerHTML = html;
    $("#reveal-block").style.display = "flex";
    $("#judge-row").style.display = "none";
    $("#prompt-hint").textContent = "Logged to Mistake Book · Press → or Space to continue";
    GRE.applyBionicToPage($("#flashcard"));
    GRE.logMistake(w);
    stats.wrong += 1;
    updateProgress();
  }

  function judge(isCorrect) {
    if (revealState !== "peek") return;
    if (isCorrect) {
      stats.correct += 1;
    } else {
      stats.wrong += 1;
      GRE.logMistake(currentWord());
    }
    updateProgress();
    advance();
  }

  function advance() {
    idx += 1;
    if (idx >= queue.length) {
      finishSession(false);
    } else {
      showCard();
    }
  }

  function finishSession(aborted) {
    $("#card-stage").style.display = "none";
    $("#summary-panel").style.display = "block";
    $("#summary-total").textContent = aborted ? `${idx}/${queue.length}` : queue.length;
    $("#summary-detail").textContent = `Correct ${stats.correct} · Wrong ${stats.wrong}${aborted ? " (ended early)" : ""}`;
  }

  function resetToSetup() {
    $("#summary-panel").style.display = "none";
    $("#setup-panel").style.display = "block";
    $("#setup-error").style.display = "none";
  }

  init();
})();
