type IntensityLevel = 'low' | 'medium' | 'high' | 'boss';

class MusicManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;
  private currentIntensity: IntensityLevel = 'low';
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private beatInterval: number | null = null;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioContext = new AudioContextClass();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize music:', error);
    }
  }

  start(): void {
    if (!this.enabled || !this.audioContext || !this.masterGain || this.isPlaying) return;

    this.isPlaying = true;
    this.playBeat();
  }

  stop(): void {
    this.isPlaying = false;
    if (this.beatInterval) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
    this.stopAllOscillators();
  }

  private stopAllOscillators(): void {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore errors from already stopped oscillators
      }
    });
    this.oscillators = [];
    this.gainNodes.forEach((gain) => gain.disconnect());
    this.gainNodes = [];
  }

  private playBeat(): void {
    if (!this.audioContext || !this.masterGain || !this.isPlaying) return;

    const bpm = this.getBPM();
    const interval = (60 / bpm) * 1000;

    let beatCount = 0;
    this.beatInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.audioContext || !this.masterGain) {
        if (this.beatInterval) clearInterval(this.beatInterval);
        return;
      }

      this.playNote(beatCount);
      beatCount = (beatCount + 1) % 16;
    }, interval);

    // Play first beat immediately
    this.playNote(0);
  }

  private getBPM(): number {
    switch (this.currentIntensity) {
      case 'low':
        return 100;
      case 'medium':
        return 120;
      case 'high':
        return 140;
      case 'boss':
        return 160;
      default:
        return 110;
    }
  }

  private playNote(beat: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // Bass drum on beats 0, 4, 8, 12
    if (beat % 4 === 0) {
      this.playKick(now);
    }

    // Hi-hat on even beats for medium+
    if (this.currentIntensity !== 'low' && beat % 2 === 0) {
      this.playHiHat(now);
    }

    // Snare on beats 4, 12 for high+
    if ((this.currentIntensity === 'high' || this.currentIntensity === 'boss') && (beat === 4 || beat === 12)) {
      this.playSnare(now);
    }

    // Bass notes
    if (beat % 4 === 0) {
      this.playBassNote(now, beat);
    }

    // Melody for boss
    if (this.currentIntensity === 'boss' && beat % 2 === 0) {
      this.playMelodyNote(now, beat);
    }
  }

  private playKick(time: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playHiHat(time: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const bufferSize = this.audioContext.sampleRate * 0.05;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }

    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = 7000;

    source.buffer = buffer;
    gain.gain.value = 0.15;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(time);
  }

  private playSnare(time: number): void {
    if (!this.audioContext || !this.masterGain) return;

    // Noise component
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = 1000;
    noise.buffer = buffer;
    noiseGain.gain.value = 0.3;

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(time);

    // Body component
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 200;
    oscGain.gain.setValueAtTime(0.3, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playBassNote(time: number, beat: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const notes = [55, 55, 73.4, 65.4]; // A1, A1, D2, C2
    const noteIndex = Math.floor(beat / 4) % notes.length;
    const freq = notes[noteIndex];

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  private playMelodyNote(time: number, beat: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const notes = [440, 523.25, 587.33, 659.25, 587.33, 523.25, 440, 392]; // A4 to G4
    const noteIndex = beat % notes.length;
    const freq = notes[noteIndex];

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  setIntensity(combo: number, hasBoss: boolean = false): void {
    const newIntensity = this.calculateIntensity(combo, hasBoss);
    if (newIntensity !== this.currentIntensity) {
      this.currentIntensity = newIntensity;
      // Restart beat with new BPM
      if (this.isPlaying) {
        if (this.beatInterval) clearInterval(this.beatInterval);
        this.playBeat();
      }
    }
  }

  private calculateIntensity(combo: number, hasBoss: boolean): IntensityLevel {
    if (hasBoss) return 'boss';
    if (combo >= 15) return 'high';
    if (combo >= 5) return 'medium';
    return 'low';
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }
}

export const musicManager = new MusicManager();
