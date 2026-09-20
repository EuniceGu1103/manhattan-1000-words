# Manhattan 1000 Words

一个开源、纯前端（无需后端/构建工具）的 GRE 词汇中英双语记忆网站，收录 **Manhattan Prep 1000 GRE Words** 词表的全部 995 个单词（按字母顺序分为 10 组，每组约 100 词），为每个单词提供中英双语释义（含一词多义）与 2–3 条中英双语例句，并配套乱序回顾测验、错题本与 ADHD Bionic Reading 阅读模式。

在线预览：部署到 GitHub Pages 后即可通过 `https://<你的用户名>.github.io/<仓库名>/` 访问（见下方「部署」一节）。

## 功能

- **分组背诵**：995 个单词按字母顺序分为 10 组（chunk-01.html ~ chunk-10.html），每个单词一张卡片，展示词性、英文释义、中文释义（多义词展示全部义项）以及 2–3 条中英对照例句，支持组内实时搜索。
- **乱序回顾测验**（`pages/review.html`）：
  - 开始前可多选要测验的分组，或勾选「仅测验错题本」；
  - 可选择测验方向：英文 → 想中文 / 中文 → 想英文；
  - 单词乱序出现，键盘 <kbd>←</kbd> 表示「我想出来了」，会揭晓释义并出现绿色（✓ 想对了）/红色（✕ 想错了）两个圆形按钮供自评；
  - 键盘 <kbd>→</kbd> 表示「想不起来」，会直接展示完整的中英释义与例句，并自动记入错题本，按 <kbd>→</kbd> 或 <kbd>Space</kbd> 继续下一词；
  - 测验结束展示正确/错误统计。
- **错题本**（`pages/wrongbook.html`）：自动记录测验中答错或未答出的单词、其中文释义及累计错误次数，默认按字母正序排列（也可切换按错误次数排序），支持一键清空，以及通过浏览器「打印 → 另存为 PDF」的方式导出为 PDF 文件。
- **ADHD 阅读模式（Bionic Reading）**：点击顶部导航「📖 常规阅读 / 🧠 ADHD 模式」按钮，切换后会对页面中的英文单词随机加粗前若干个字母，帮助注意力更容易分散的读者集中注意力阅读英文内容；该模式对中文文本不生效（Bionic Reading 是针对拉丁字母词形的阅读辅助方法，中文没有对应的可辨识前缀结构）。
- **日间 / 夜间模式**：右上角一键切换。日间模式白底黑字，强调色为 `#1C2B48`；夜间模式黑底白字，强调色为 `#C4D8E5`。整体视觉参考 Apple 官网的简约风格，导航栏与卡片使用「液态玻璃」（`backdrop-filter: blur`）质感。
- **纯前端、可离线使用**：不依赖任何后端服务或数据库，所有学习进度（主题、阅读模式、错题本）保存在浏览器 `localStorage` 中；可以直接双击 `index.html` 本地打开，也可以部署到 GitHub Pages / Netlify / Vercel 等任意静态网站托管服务。

## 目录结构

```
manhattan-gre-1000/
├── index.html                 # 首页：功能入口 + 10 个分组卡片
├── pages/
│   ├── chunk-01.html ~ chunk-10.html   # 10 个分组的单词详情页
│   ├── review.html            # 乱序回顾测验
│   └── wrongbook.html         # 错题本
├── assets/
│   ├── css/style.css          # 全站样式（日间/夜间、液态玻璃、响应式、打印样式）
│   └── js/
│       ├── common.js          # 主题/阅读模式切换、导航栏注入、数据加载、错题本读写
│       ├── chunk-page.js       # 分组详情页渲染与搜索
│       ├── review.js          # 回顾测验的状态机与键盘交互
│       └── wrongbook.js       # 错题本渲染、排序与 PDF 导出
├── data/
│   ├── words.json             # 全部 995 个单词的最终结构化数据（页面实际使用）
│   └── raw/                   # 数据生成过程中的中间产物（保留以便复现/校对，非页面运行必需）
│       ├── source_words.json  # 从原始 PDF 提取的英文单词+释义
│       └── chunks/            # 10 个分组的中间产物（英文释义 + AI 生成的中文释义与例句）
└── README.md
```

## 本地运行

由于页面通过 `fetch()` 加载 `data/words.json`，直接以 `file://` 方式打开可能会因浏览器的跨域限制而无法加载数据，建议用任意静态服务器在本地预览，例如：

```bash
cd manhattan-gre-1000
python3 -m http.server 8080
# 然后访问 http://localhost:8080/index.html
```

或使用 Node 的 `npx serve` / VS Code 的 Live Server 插件等，效果相同。

## 部署到 GitHub Pages（免费托管，开源分享给他人）

1. 在 GitHub 上新建一个仓库（例如 `manhattan-gre-1000`），并将本项目文件夹的内容全部推送上去：
   ```bash
   cd manhattan-gre-1000
   git init            # 若尚未初始化
   git add .
   git commit -m "Initial commit: Manhattan 1000 Words study site"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/manhattan-gre-1000.git
   git push -u origin main
   ```
2. 打开仓库的 **Settings → Pages**，Source 选择 `Deploy from a branch`，Branch 选择 `main` 分支、目录选择 `/ (root)`，保存。
3. 稍等片刻后，GitHub 会给出访问地址，形如：`https://<你的用户名>.github.io/manhattan-gre-1000/`。
4. 之后每次 `git push` 更新 `main` 分支，网站都会自动重新部署。

## 数据来源与生成方式

- 单词与英文释义提取自 *Manhattan Prep 1000 GRE Words* 词表（原始 PDF，来源于 Quizlet 学习集 `quizlet.com/_8mddh` 的打印版本），使用 `pdfplumber` 按左右两栏分别提取文本后解析、清洗为结构化 JSON（`data/raw/source_words.json`）。
- 在英文释义基础上，为每个单词补充了中文释义（含多义词拆分)与 2–3 条原创中英双语例句，用于辅助中文母语学习者理解与记忆。
- 由于内容规模较大（995 词、约 2500+ 组例句），中文释义与例句为 AI 辅助生成，虽已尽量保证准确、地道，但仍建议学习时与权威词典（如 Merriam-Webster、有道词典等）交叉核对，如发现翻译或例句问题欢迎提交 Issue / PR 一起完善。

## 设计说明与可自定义之处

- 配色变量集中在 `assets/css/style.css` 顶部的 `:root` 与 `:root[data-theme="dark"]`，如需调整品牌色，只需修改 `--accent` 等变量。
- 错题本 PDF 导出采用浏览器原生「打印」功能（点击「导出为 PDF」后，在打印对话框的「目标打印机」中选择「另存为 PDF」即可），这样可以完美支持中文显示且无需引入额外的字体/库，代价是导出样式依赖浏览器的打印渲染（已在 Chrome 上测试通过）。
- Bionic Reading 的加粗比例为随机 35%–60%（在 `assets/js/common.js` 的 `bionicWord` 函数中可调整），每次切换或刷新都会重新随机，更贴近「随机对单词前几个字母加粗」的效果。

## 一些可以进一步优化的方向（欢迎 PR）

- 目前回顾测验与错题本的数据保存在浏览器本地（`localStorage`），换设备或清除浏览器数据后学习记录会丢失；如需跨设备同步，可以考虑接入一个轻量后端或使用浏览器账号同步方案。
- 可以为每个单词补充词根词缀拆解、近反义词辨析等内容，进一步丰富记忆维度。
- 可以增加"每日一组""学习打卡"等激励性功能。
- 例句的中文翻译目前是逐句人工/AI 翻译，如果发现个别翻译不够地道，欢迎提 Issue。

## License

本项目以 [MIT License](LICENSE) 开源，欢迎自由使用、修改与分发。词表内容版权归 Manhattan Prep 所有，本项目仅作为非商业性的学习辅助工具再加工使用。
