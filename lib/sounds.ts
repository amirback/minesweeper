let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.25, startAt = 0) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + startAt);
  gain.gain.setValueAtTime(vol, c.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startAt + dur);
  osc.start(c.currentTime + startAt);
  osc.stop(c.currentTime + startAt + dur + 0.01);
}

function noise(dur: number, vol = 0.3) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const samples = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, samples, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < samples; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples, 2.5);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const gain = c.createGain();
  gain.gain.value = vol;
  src.connect(gain);
  gain.connect(c.destination);
  src.start();
}

export const sounds = {
  click()    { tone(900, 0.04, 'square', 0.08); },
  flag()     { tone(700, 0.06, 'triangle', 0.12); tone(500, 0.06, 'triangle', 0.08, 0.06); },
  cascade()  { tone(440, 0.08, 'sine', 0.06); },
  explosion(){ noise(0.35, 0.45); tone(80, 0.4, 'sawtooth', 0.2); },
  victory()  {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'sine', 0.2, i * 0.1));
  },
  rankUp()   {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.18, 'sine', 0.22, i * 0.08));
    setTimeout(() => noise(0.1, 0.05), 500);
  },
  combo(level: number) {
    const scale = [330, 392, 494, 587, 740];
    const f = scale[Math.min(level - 1, scale.length - 1)];
    tone(f, 0.1, 'sine', 0.18);
    if (level >= 3) tone(f * 1.5, 0.08, 'sine', 0.1, 0.06);
  },
  comboBreak() { tone(180, 0.25, 'sawtooth', 0.12); },

  get muted() { return muted; },
  toggle()    { muted = !muted; return muted; },
};
