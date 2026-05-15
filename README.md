# saper

built this because i was tired of playing minesweeper like a caveman with no information. now there's a probability overlay that tells you which cells are probably going to kill you.

## what it does

- **classic minesweeper** - 3 difficulties (easy / medium / hard)
- **probability coach** - press one button and every unrevealed cell shows % chance of mine. green = safe-ish. red = don't click that
- **flag limit per game** - easy: 10 flags, medium: 50, hard: 100. you can't flag everything, you actually have to think
- **elo ranking system** - 8 ranks from novice to quantum miner. win fast = more points. lose = cry
- **combo streaks** - click multiple safe cells in a row fast enough and you get a combo multiplier
- **daily challenge** - same board for everyone every day. compare your time with the world
- **leaderboard** - global ranking, see who's actually good at this
- **paratrooper animation** - plant a flag and a soldier parachutes in. if it's a mine he dies. if not, he vibes

## you didn't ask for this, but here it is

added a chat coach (the red ✦ Coach tab) that reads your game stats and explains strategy, helps with 50/50 situations, and gives personalized tips. does a minesweeper game need a built-in chat coach? probably not. is it here anyway? yes. powered by llama 3.1 via groq — free, no credit card.

## tech

next.js 15 / typescript / supabase (auth + db) / web audio api (all sounds synthesized, no audio files) / vercel

## run locally

```bash
git clone https://github.com/amirback/minesweeper
cd minesweeper
npm install
# add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GROQ_API_KEY to .env.local
npm run dev
```

## play it

https://saper.ink

no install needed. works on mobile too (desktop recommended for hard mode).

---

<div align="center">
  <img src="public/nfactorial.svg" alt="nFactorial" width="60"/>
  <br/>
  made for nfactorial incubator
</div>
