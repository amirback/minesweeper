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
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI not configured — add GROQ_API_KEY to Vercel env vars' }, { status: 500 });
  }

  const { message, stats } = await req.json();
  if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 });

  const statsContext = stats
    ? `\n\nPlayer stats: ${JSON.stringify(stats)}`
    : '';

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + statsContext },
          { role: 'user',   content: message },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      const errMsg = data?.error?.message ?? JSON.stringify(data).slice(0, 200);
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
