# 💣 SAPER — Classic Puzzle

Built this because I was tired of playing minesweeper like a caveman with no information. Now there's an AI that tells you which cells are probably going to kill you.

---

## What it does

- **Classic minesweeper** — 3 difficulties (Easy / Medium / Hard)
- **AI probability coach** — press one button and every unrevealed cell shows % chance of mine. Green = safe-ish. Red = don't click that
- **Flag limit per game** — Easy: 10 flags, Medium: 50, Hard: 100. You can't flag everything, you actually have to think
- **ELO ranking system** — 8 ranks from Novice to Quantum Miner. Win fast = more points. Lose = cry
- **Combo streaks** — click multiple safe cells in a row fast enough and you get a combo multiplier
- **Daily Challenge** — same board for everyone every day. Compare your time with the world
- **Leaderboard** — global ranking, see who's actually good at this
- **Paratrooper animation** — plant a flag and a soldier parachutes in. If it's a mine he dies. If not, he vibes

---

## Tech

Next.js 15 · TypeScript · Supabase (auth + DB) · Web Audio API (all sounds synthesized, no audio files) · Vercel

---

## Run locally

```bash
git clone https://github.com/amirback/minesweeper1
cd minesweeper1
npm install
cp .env.local.example .env.local
# fill in your Supabase keys
npm run dev
```

---

## Play it

https://minesweeper-nine-sigma.vercel.app

No install needed. Works on mobile too (desktop recommended for Hard mode — 30 columns on a phone is pain).

---

Made for nFactorial Incubator application.
