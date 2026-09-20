/* Renders a chunk page's word list based on data-chunk attribute on <body> */
(async function () {
  const chunkNum = parseInt(document.body.dataset.chunk, 10);
  const words = await GRE.loadWords();
  const list = words.filter((w) => w.chunk === chunkNum);
  const container = document.getElementById("word-list");

  function render(items) {
    container.innerHTML = items.map((w) => {
      const senses = w.senses.map((s) => `
        <div class="sense">
          <span class="pos">${s.pos}</span>
          <span class="en" data-bionic>${escapeHtml(s.en)}</span>
          <span class="zh">${escapeHtml(s.zh)}</span>
        </div>`).join("");

      const examples = w.examples.map((ex) => `
        <div class="example">
          <div><span class="bullet">›</span><span class="en" data-bionic>${escapeHtml(ex.en)}</span></div>
          <div class="zh" style="margin-left:16px">${escapeHtml(ex.zh)}</div>
        </div>`).join("");

      return `
        <article class="glass word-card">
          <div class="word-head">
            <span class="idx">#${w.id}</span>
            <span class="word" data-bionic>${escapeHtml(w.word)}</span>
          </div>
          ${senses}
          <div class="examples">${examples}</div>
        </article>`;
    }).join("");
    GRE.applyBionicToPage(container);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  render(list);

  const search = document.getElementById("word-search");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    if (!q) { render(list); return; }
    render(list.filter((w) =>
      w.word.toLowerCase().includes(q) ||
      w.senses.some((s) => s.zh.includes(q) || s.en.toLowerCase().includes(q))
    ));
  });
})();
