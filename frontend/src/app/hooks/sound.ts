const SOUND_ENABLED_KEY = "notif_sound_enabled";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const v = window.localStorage.getItem(SOUND_ENABLED_KEY);
  return v === null ? true : v === "1";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOUND_ENABLED_KEY, enabled ? "1" : "0");
}

type ToneShape = "receive" | "send";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

export function playTone(shape: ToneShape): void {
  if (!isSoundEnabled()) return;
  const audio = getCtx();
  if (!audio) return;
  try {
    if (audio.state === "suspended") void audio.resume();

    const now = audio.currentTime;
    const tones =
      shape === "receive"
        ? [
            { freq: 660, start: 0, dur: 0.12 },
            { freq: 880, start: 0.1, dur: 0.16 },
          ]
        : [{ freq: 520, start: 0, dur: 0.09 }];

    for (const t of tones) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = t.freq;
      gain.gain.setValueAtTime(0.0001, now + t.start);
      gain.gain.exponentialRampToValueAtTime(0.18, now + t.start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
      osc.connect(gain).connect(audio.destination);
      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur + 0.02);
    }
  } catch {
    // autoplay blocked or context unavailable — silent fallback
  }
}
