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
        <p>错题本目前是空的。去<a href="review.html" style="color:var(--accent);font-weight:600">回顾测验</a>中练习一下吧！</p>
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
            <tr><th>#</th><th>单词</th><th>中文释义</th><th>错误次数</th></tr>
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
      if (confirm("确定要清空整个错题本吗？此操作不可撤销。")) {
        GRE.clearWrongBook();
        render();
      }
    });
    document.getElementById("export-btn").addEventListener("click", () => {
      document.getElementById("print-date").textContent =
        "导出时间：" + new Date().toLocaleString("zh-CN");
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
