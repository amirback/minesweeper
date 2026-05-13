# 💣 MineTrainer — Minesweeper with AI Probability Coach

> **Not just another Minesweeper.** MineTrainer is a learning platform that teaches probabilistic thinking by showing you the math behind every move.

## What makes this different

Every minesweeper site does the same thing: generate mines, let you click, show numbers. MineTrainer adds one thing that changes everything — **real-time AI probability hints**.

When you toggle "AI Coach", every hidden cell shows the probability it contains a mine, calculated live from the constraints of revealed numbers. Green cells are safe. Red cells are dangerous. Watch the numbers shift as you reveal more of the board. You're not just playing a game — you're developing intuition for probabilistic reasoning.

**Who is this for?** Anyone who wants to get better at Minesweeper, developers learning about constraint satisfaction, or people who enjoy games with depth.

## Features

| Feature | Description |
|---|---|
| 🤖 **AI Coach** | Real-time mine probability (0–100%) on every hidden cell |
| 📅 **Daily Challenge** | Same seeded board for everyone each day, global competition |
| 🏆 **Leaderboard** | Best times by difficulty, powered by Supabase |
| 🚩 **Flag Mode** | Tap-to-flag toggle for mobile players |
| ⚡ **Chord Click** | Click a revealed number to auto-clear neighbors when flagged correctly |
| 🎯 **3 Difficulties** | Easy (9×9), Medium (16×16), Hard (30×16) |
| 📱 **Responsive** | Works on phone, tablet, and desktop |

## How the AI works

The probability algorithm uses **constraint propagation**:

1. For each revealed numbered cell, count adjacent flags and unrevealed cells
2. `P(mine) = (number - flags) / unrevealed_neighbors`
3. Each hidden cell collects all constraints from its neighbors
4. Final probability = max of all constraints (worst-case estimate)

This is the same reasoning a skilled Minesweeper player uses mentally — the AI just makes it visible.

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Supabase** for auth + PostgreSQL leaderboard
- **Vercel** for deployment

## Running locally

```bash
npm install
npm run dev
```

The game works fully without Supabase. To enable leaderboards and auth:

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local` and fill in your keys
3. Run this SQL in Supabase SQL Editor:

```sql
create table profiles (
  id uuid references auth.users primary key,
  username text unique,
  created_at timestamptz default now()
);

create table game_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  time_seconds integer,
  won boolean,
  is_daily boolean default false,
  daily_date date,
  created_at timestamptz default now()
);

create view leaderboard_view as
  select p.username, g.difficulty, g.time_seconds, g.won, g.is_daily, g.daily_date, g.created_at
  from game_results g
  join profiles p on p.id = g.user_id;

alter table profiles enable row level security;
alter table game_results enable row level security;

create policy "Public profiles" on profiles for select using (true);
create policy "Insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Public results" on game_results for select using (true);
create policy "Insert own results" on game_results for insert with check (auth.uid() = user_id);
```

## The nFactorial context

This project was built for the nFactorial Summer Incubator selection. The goal was to create something that goes beyond a standard Minesweeper clone — a product with a unique angle, real value for users, and a path to becoming a genuine service.

The unique angle is **education**: MineTrainer is positioned as "Minesweeper for training probabilistic thinking." The AI Coach feature turns a casual game into a tool for developing a skill that applies far beyond Minesweeper.

**Possible future directions:**
- Tournament mode with bracket elimination
- Replay system (record and share your best runs)
- Probability-based puzzle editor (design boards where the AI must reason to completion)
- "Pro" tier with custom board themes and no-hint challenges
