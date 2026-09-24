/* Chunk detail page: renders the word list for one chunk, with live search. */
(function () {
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
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

  function wordCardHtml(w) {
    return `
      <div class="glass word-card" data-word="${escapeHtml(w.word.toLowerCase())}">
        <div class="word-head">
          <span class="idx">#${w.id}</span>
          <span class="word en" data-bionic>${escapeHtml(w.word)}</span>
        </div>
        ${senseListHtml(w)}
        ${exampleListHtml(w)}
      </div>`;
  }

  async function init() {
    const chunk = Number(document.body.dataset.chunk);
    const allWords = await GRE.loadWords();
    const words = allWords.filter((w) => w.chunk === chunk).sort((a, b) => a.id - b.id);

    const list = document.getElementById("word-list");
    list.innerHTML = words.map(wordCardHtml).join("");
    GRE.applyBionicToPage(list);

    const search = document.getElementById("search-input");
    if (search) {
      search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        list.querySelectorAll(".word-card").forEach((card) => {
          card.style.display = !q || card.dataset.word.includes(q) ? "" : "none";
        });
      });
    }
  }

  init();
})();
