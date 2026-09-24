# GRE Vocabulary Snapshot

An open-source, front-end-only (no backend, no build step) bilingual (English/Chinese) study tool built on the **Manhattan Prep 1000 GRE Words** list — all 995 words, each with an English definition, a Chinese definition (including every sense of a word), and 2–3 bilingual example sentences.

It's built for students whose first language is Chinese and whose prep time is limited: a fast way to get through a high-frequency GRE word list (想要快速过一遍高频词汇的同学) rather than a full flashcard-browsing app. Three focused tools, nothing extra: a shuffled review quiz, a mistake book, and an ADHD-friendly reading mode.

Live demo: once deployed to GitHub Pages, the site is available at `https://<your-username>.github.io/<repo-name>/` (see **Deployment** below).

## Features

- **Shuffled Review Quiz** (`pages/review.html`):
  - Before starting, select one or more word groups to quiz on, or check "quiz only Mistake Book words";
  - Choose a direction: English → recall Chinese, or Chinese → recall English;
  - Words appear in random order. Press <kbd>←</kbd> once you've recalled the answer to reveal it, then self-grade with the green (✓ correct) / red (✕ incorrect) buttons;
  - Press <kbd>→</kbd> if you can't recall it — this reveals the full bilingual definition and example sentences and logs the word to your Mistake Book automatically. Press <kbd>→</kbd> or <kbd>Space</kbd> to continue;
  - A summary screen shows your correct/incorrect counts at the end.
- **Mistake Book** (`pages/wrongbook.html`): automatically records every word you missed or couldn't recall during a quiz, along with its Chinese definition and a running mistake count. Sorted A–Z by default, with an option to sort by mistake count instead. Includes a one-click clear button and PDF export via the browser's native "Print → Save as PDF".
- **ADHD Reading Mode (Bionic Reading)**: toggle it from the nav bar at any time. It randomly bolds the first few letters of each English word to give your eyes an anchor point, which can help readers who find it harder to stay focused work through longer definitions and examples. (This mode only applies to English text — Bionic Reading is a Latin-alphabet reading aid and doesn't have an equivalent structure in Chinese.)
- **Light / Dark / Auto theme**: switch manually from the nav bar (top-right), or leave it on **Auto** (the default) to follow your system's light/dark setting automatically. Light mode is a white background with black text and a `#1C2B48` accent; dark mode is a black background with white text and a `#C4D8E5` accent. The overall look takes cues from Apple's own design language, with a "liquid glass" (`backdrop-filter: blur`) feel on the nav bar and cards.
- **Front-end only, works offline**: no backend or database — all progress (theme, reading mode, Mistake Book) is saved locally in your browser's `localStorage`. Open `index.html` directly, or deploy it to GitHub Pages, Netlify, Vercel, or any static host.

## Project structure

```
manhattan-gre-1000/
├── index.html                 # Welcome page: intro + links into the quiz and mistake book
├── pages/
│   ├── review.html            # Shuffled review quiz
│   └── wrongbook.html         # Mistake book
├── assets/
│   ├── css/style.css          # Site-wide styles (light/dark/auto theme, liquid glass, responsive, print)
│   └── js/
│       ├── common.js          # Theme/reading-mode toggles, nav/footer injection, data loading, mistake book storage
│       ├── review.js          # Review quiz state machine and keyboard interaction
│       └── wrongbook.js       # Mistake book rendering, sorting, and PDF export
├── data/
│   ├── words.json             # Final structured data for all 995 words (what the pages actually load)
│   └── raw/                   # Intermediate data-generation artifacts (kept for reproducibility/review, not required at runtime)
│       ├── source_words.json  # English words + definitions extracted from the original PDF
│       └── chunks/            # Per-group intermediate files (English definitions + AI-generated Chinese definitions/examples)
└── README.md
```

## Running locally

Because the pages load `data/words.json` via `fetch()`, opening the files directly with `file://` may fail due to the browser's CORS restrictions. Serve the folder with any static server instead, for example:

```bash
cd manhattan-gre-1000
python3 -m http.server 8080
# then visit http://localhost:8080/index.html
```

`npx serve`, the VS Code Live Server extension, or any similar tool works just as well.

## Deploying to GitHub Pages (free hosting, open to share)

1. Create a new repository on GitHub (e.g. `manhattan-1000-words`) and push the project's contents:
   ```bash
   cd manhattan-gre-1000
   git init            # if not already initialized
   git add .
   git commit -m "Initial commit: GRE Vocabulary Snapshot"
   git branch -M main
   git remote add origin https://github.com/<your-username>/manhattan-1000-words.git
   git push -u origin main
   ```
2. Open the repository's **Settings → Pages**, set Source to `Deploy from a branch`, Branch to `main`, folder to `/ (root)`, and save.
3. After a short build, GitHub will show the live URL, in the form `https://<your-username>.github.io/manhattan-1000-words/`.
4. Every subsequent `git push` to `main` redeploys the site automatically.

## Data source and generation method

- Words and English definitions were extracted from the *Manhattan Prep 1000 GRE Words* list (originally a printed export of the Quizlet study set `quizlet.com/_8mddh`), using `pdfplumber` to extract text column-by-column and regex parsing to clean it into structured JSON (`data/raw/source_words.json`).
- Chinese definitions (including every sense of polysemous words) and 2–3 original bilingual example sentences per word were added on top of the English definitions, to help native Chinese speakers understand and retain each word.
- Given the scale of the content (995 words, 2,500+ example sentences), the Chinese definitions and examples were AI-assisted. They've been checked for accuracy as far as possible, but cross-referencing with an authoritative dictionary (e.g. Merriam-Webster, Youdao) is still a good idea — issues or PRs to improve translations are always welcome.

## Design notes and customization

- Theme colors live at the top of `assets/css/style.css`, under `:root` and `:root[data-theme="dark"]` — change the `--accent` variables etc. to adjust the palette.
- Mistake Book PDF export uses the browser's native print function (click "Export as PDF", then choose "Save as PDF" as the destination printer in the print dialog). This gives full, reliable Chinese-text support with no extra fonts or libraries — the tradeoff is that the exported layout depends on the browser's print rendering (tested on Chrome).
- Bionic Reading's bold ratio is a random 35%–60% (adjustable in the `bionicWord` function in `assets/js/common.js`); it's re-randomized every time the mode is toggled or the page reloads.

## Ideas for further improvement (PRs welcome)

- Quiz results and the Mistake Book are currently stored in browser `localStorage`, so switching devices or clearing browser data resets your progress. Syncing across devices would need a lightweight backend or a browser-account sync solution.
- Root/affix breakdowns or synonym/antonym comparisons could be added per word for deeper retention.
- Daily-goal or streak-tracking features could add a bit of motivation.
- Example-sentence translations were done sentence-by-sentence (AI-assisted); if you spot one that reads awkwardly, an issue or PR is welcome.

## Feedback

If you find this project useful, consider giving it a ⭐ on GitHub — it helps other GRE test-takers find it. Suggestions, bug reports, and pull requests are always welcome: open an issue, or reach out at **eunicegu1103@gmail.com**.

## License

Released under the [MIT License](LICENSE). The word list content is copyrighted by Manhattan Prep; this project repackages it purely as a non-commercial study aid.
