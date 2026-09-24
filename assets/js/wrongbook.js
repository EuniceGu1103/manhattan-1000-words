/* Wrong-answer book page logic */
(function () {
  let sortMode = "alpha"; // "alpha" | "count"

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function getEntries() {
    const book = GRE.getWrongBook();
    return Object.values(book);
  }

  function sortEntries(entries) {
    const sorted = entries.slice();
    if (sortMode === "alpha") {
      sorted.sort((a, b) => a.word.localeCompare(b.word));
    } else {
      sorted.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
    }
    return sorted;
  }

  function render() {
    const entries = sortEntries(getEntries());
    const container = document.getElementById("wrongbook-content");
    if (entries.length === 0) {
      container.innerHTML = `<div class="glass empty-state">
        <div style="font-size:40px;margin-bottom:10px">🎉</div>
        <p>Your Mistake Book is empty. Head over to the <a href="review.html" style="color:var(--accent);font-weight:600">Review Quiz</a> to start practicing!</p>
      </div>`;
      return;
    }

    const rows = entries.map((e, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="font-weight:700">${escapeHtml(e.word)}</td>
        <td>${escapeHtml(e.zh)}</td>
        <td><span class="count-badge">${e.count}</span></td>
      </tr>`).join("");

    container.innerHTML = `
      <div class="glass" style="padding:8px 8px;overflow-x:auto">
        <table class="wrongtable">
          <thead>
            <tr><th>#</th><th>Word</th><th>Chinese Definition</th><th>Mistakes</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function bindControls() {
    document.getElementById("sort-alpha").addEventListener("click", () => {
      sortMode = "alpha"; render();
    });
    document.getElementById("sort-count").addEventListener("click", () => {
      sortMode = "count"; render();
    });
    document.getElementById("clear-btn").addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your entire Mistake Book? This cannot be undone.")) {
        GRE.clearWrongBook();
        render();
      }
    });
    document.getElementById("export-btn").addEventListener("click", () => {
      document.getElementById("print-date").textContent =
        "Exported: " + new Date().toLocaleString("en-US");
      document.getElementById("print-title").style.display = "block";
      window.print();
      setTimeout(() => {
        document.getElementById("print-title").style.display = "none";
      }, 500);
    });
  }

  bindControls();
  render();
})();
