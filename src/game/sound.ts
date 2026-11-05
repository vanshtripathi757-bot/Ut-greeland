/**
 * Procedural Web Audio synthesis for courtyard footsteps, jump/land rustle,
 * camera perspective switch, and gentle sakura breeze chimes.
 * Wrapped in defensive try/catch blocks so mobile WebViews or strict autoplay policies never throw.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicGain: GainNode | null = null;
  private musicStep = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(m: boolean) {
    this.muted = m;
    if (m) this.stopBackgroundMusic();
    else this.startBackgroundMusic();
  }

  /** Original procedural academy theme; call after a user gesture. */
  public startBackgroundMusic() {
    if (this.muted || this.musicTimer) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const gain = ctx.createGain();
      gain.gain.value = 0.035;
      gain.connect(ctx.destination);
      this.musicGain = gain;
      const progression = [[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]];
      const playChord = () => {
        if (!this.musicGain || this.muted) return;
        const notes = progression[this.musicStep % progression.length];
        this.musicStep += 1;
        notes.forEach((frequency, index) => {
          const osc = ctx.createOscillator();
          const voiceGain = ctx.createGain();
          osc.type = index === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(frequency, ctx.currentTime);
          voiceGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          voiceGain.gain.linearRampToValueAtTime(index === 0 ? 0.22 : 0.09, ctx.currentTime + 0.35);
          voiceGain.gain.setTargetAtTime(0.0001, ctx.currentTime + 1.25, 0.45);
          osc.connect(voiceGain);
          voiceGain.connect(gain);
          osc.start();
          osc.stop(ctx.currentTime + 3.2);
        });
      };
      playChord();
      this.musicTimer = setInterval(playChord, 2600);
    } catch { this.stopBackgroundMusic(); }
  }

  public stopBackgroundMusic() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
    if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
    this.musicGain = null;
  }

  public playDoor() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(72, now + 0.32);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch { /* Audio is optional on restricted mobile browsers. */ }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playFootstep(onStone: boolean, isRunning: boolean) {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const pitchVar = 0.92 + Math.random() * 0.16;
      const baseFreq = (onStone ? 195 : 135) * pitchVar * (isRunning ? 1.12 : 1.0);
      osc.type = onStone ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.055);

      const peakGain = isRunning ? 0.08 : 0.045;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore audio errors on restricted devices
    }
  }

  public playLand() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(125, now);
      osc.frequency.exponentialRampToValueAtTime(58, now + 0.09);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.075, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch { /* Optional landing sound. */ }
  }

  public playJump() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(410, now + 0.11);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Ignore audio errors on restricted devices
    }
  }

  public playUiSwitch() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.045);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Ignore audio errors on restricted devices
    }
  }
}

export const soundEngine = new SoundEngine();
