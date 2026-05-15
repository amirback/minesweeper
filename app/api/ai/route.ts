import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an AI assistant for SAPER — a minesweeper web game.
Your job is to help players understand minesweeper strategy, analyze their game stats, and give personalized tips.

Minesweeper basics you know:
- Numbers show how many mines are in adjacent 8 cells
- If a number's mine count matches flagged neighbors, remaining unrevealed neighbors are safe
- Use probability: if 1 mine in 3 unknown cells = 33% each
- Corners and edges have fewer neighbors = easier to deduce
- First click is always safe
- 50/50 situations are real — sometimes you must guess

When analyzing stats, be encouraging but honest. Give specific actionable tips.
Keep responses concise, max 3-4 sentences unless asked for more.
Respond in the same language the user writes in (Russian or English).`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
  }

  const { message, stats } = await req.json();
  if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 });

  const statsContext = stats
    ? `\n\nPlayer stats: ${JSON.stringify(stats)}`
    : '';

  const prompt = `${SYSTEM_PROMPT}${statsContext}\n\nUser: ${message}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
        }),
      }
    );

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return NextResponse.json({ error: 'No response from AI' }, { status: 500 });

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
