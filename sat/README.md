# Orbit SAT Math

Orbit is a mobile-first SAT Math coach designed around a learner moving from a 540 starting score toward a 680 goal. The same source runs as a browser-based web app, an installable offline PWA, and the web layer for dedicated Capacitor iOS and Android apps.

## Run the web app

From the project root:

```bash
python3 -m http.server 4173 --directory www
```

Open `http://localhost:4173/sat/`.

On iPhone or iPad, use Safari’s **Share → Add to Home Screen**. On Android, use the browser’s **Install app** action. The service worker makes the core experience available offline after its first successful load.

## Native app wrappers

The separate wrapper in `sat-app/` prevents Orbit from overwriting the existing PromptCept native projects.

```bash
cd sat-app
npm install
npm run ios:add
npm run android:add
npm run sync
```

Then use `npm run ios:open` or `npm run android:open` to build in Xcode or Android Studio.

## Product behavior

- Learner onboarding defaults to a 540 starting score and 680 target.
- The diagnostic uses eight original questions spanning all four SAT Math domains.
- Smart practice prioritizes the learner’s weaker domains.
- Hints precede explanations, and missed questions enter a retry journal.
- Multiple learners can share a device. Each has a separate profile with an optional PIN. Progress, goals, and study history are stored only in local browser/app storage, per learner.
- 746 questions: the originals in `app.js` plus 580 generated ones in `questions-extra.js`, 120 of them grid-in (`node sat/tools/generate-questions.mjs` rebuilds them).
- Grid-in answers follow the digital SAT answer-box rules (fractions or decimals, 5 characters, repeating decimals fill the box).
- Missed questions return on a spaced-review schedule of 1, 3, 7, and 21 days.
- Generated questions explain why each wrong answer is tempting and name the rule behind the answer. 76 geometry questions include diagrams.
- Timed practice: a single 22-question module in 35 minutes, or the full 44-question section, where Module 2 adapts to Module 1. Both are weighted like the real test and auto-scored at 0:00.
- See `CHANGELOG.md` for the full change history.
- Score estimates are directional coaching indicators, not official SAT scores.
- Official scored checkpoints should be completed in College Board Bluebook.

Orbit is not affiliated with or endorsed by College Board. SAT is a registered trademark of College Board. The included practice questions are original.
