# General Embryology — interactive revision presentation

Live: https://0ceanmind.github.io/dhiyaa-anatomy/ · Question bank: https://0ceanmind.github.io/dhiyaa-anatomy/quiz.html

A 64-slide interactive deck covering the eight lectures in this repository, from fertilization to birth defects. It uses live 3D models (Three.js), animated diagrams and charts, and hover cards for detail. Content comes from the lecture slides and *Langman's Medical Embryology*, 15th ed.

## Presenting

| Key | Action |
| --- | --- |
| → · Space · PgDn | Next build / slide |
| ← · PgUp | Previous |
| ↓ / ↑ | Skip builds (next / previous slide) |
| O | Overview grid |
| F | Fullscreen |
| B | Black screen |
| Q | Open the question bank |
| H | Help |
| number + Enter | Jump to slide |

- Hover any item marked **+**, or any labelled structure, to see more detail.
- **Lecture slides ↗** (bottom left) opens the original lecture pages for that slide.
- The deck is designed at 1920 × 1080 and scales to any screen.

## Question bank

`quiz.html` holds 240 single-best-answer MCQs across all eight lectures. Each answer comes with an explanation and its source. Modes include quick and full exams, unseen questions, mistake review, and per-lecture mastery rings. Progress is saved in the browser.

## Running locally

The site is static with no build step. Serve the folder over HTTP, for example `python3 -m http.server`, then open `http://localhost:8000`. The question bank cannot load if the page is opened as a `file://` URL.

Third-party: Three.js r169 (MIT) and Inter (SIL OFL 1.1) are vendored in `vendor/` and `fonts/`.
