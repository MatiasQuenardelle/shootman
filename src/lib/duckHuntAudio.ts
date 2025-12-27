// Duck Hunt NES-style audio using Web Audio API
class DuckHuntAudioManager {
  private audioContext: AudioContext | null = null;
  private musicOscillator: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isInitialized = false;
  private musicPlaying = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Duck Hunt audio:', error);
    }
  }

  private createOscillator(frequency: number, type: OscillatorType = 'square', duration: number = 0.1): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private playNotes(notes: { freq: number; duration: number; delay: number }[]): void {
    if (!this.audioContext) return;

    notes.forEach(({ freq, duration, delay }) => {
      setTimeout(() => {
        this.createOscillator(freq, 'square', duration);
      }, delay * 1000);
    });
  }

  playShoot(): void {
    if (!this.audioContext) return;

    // NES-style gunshot: white noise burst
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    noise.start();
    noise.stop(this.audioContext.currentTime + 0.1);
  }

  playHit(): void {
    // Ascending notes like NES Duck Hunt hit sound
    this.playNotes([
      { freq: 440, duration: 0.08, delay: 0 },
      { freq: 587, duration: 0.08, delay: 0.08 },
      { freq: 698, duration: 0.08, delay: 0.16 },
      { freq: 880, duration: 0.15, delay: 0.24 },
    ]);
  }

  playFlyAway(): void {
    // Descending "wah wah" sound for duck escaping
    this.playNotes([
      { freq: 400, duration: 0.15, delay: 0 },
      { freq: 350, duration: 0.15, delay: 0.15 },
      { freq: 300, duration: 0.15, delay: 0.3 },
      { freq: 250, duration: 0.2, delay: 0.45 },
    ]);
  }

  playRoundComplete(): void {
    // Victory fanfare
    this.playNotes([
      { freq: 523, duration: 0.1, delay: 0 },      // C5
      { freq: 659, duration: 0.1, delay: 0.1 },    // E5
      { freq: 784, duration: 0.1, delay: 0.2 },    // G5
      { freq: 1047, duration: 0.3, delay: 0.3 },   // C6
    ]);
  }

  playPerfect(): void {
    // Special perfect round fanfare
    this.playNotes([
      { freq: 523, duration: 0.08, delay: 0 },
      { freq: 587, duration: 0.08, delay: 0.08 },
      { freq: 659, duration: 0.08, delay: 0.16 },
      { freq: 698, duration: 0.08, delay: 0.24 },
      { freq: 784, duration: 0.08, delay: 0.32 },
      { freq: 880, duration: 0.08, delay: 0.4 },
      { freq: 988, duration: 0.08, delay: 0.48 },
      { freq: 1047, duration: 0.3, delay: 0.56 },
    ]);
  }

  playGameOver(): void {
    // Sad descending sound
    this.playNotes([
      { freq: 392, duration: 0.2, delay: 0 },      // G4
      { freq: 349, duration: 0.2, delay: 0.25 },   // F4
      { freq: 330, duration: 0.2, delay: 0.5 },    // E4
      { freq: 262, duration: 0.4, delay: 0.75 },   // C4
    ]);
  }

  playMusic(): void {
    if (!this.audioContext || this.musicPlaying) return;

    this.musicPlaying = true;

    // Simple NES-style background melody loop
    const playMelody = () => {
      if (!this.musicPlaying || !this.audioContext) return;

      // Simple 8-bit style melody pattern
      const melody = [
        { freq: 330, duration: 0.2 },  // E4
        { freq: 392, duration: 0.2 },  // G4
        { freq: 440, duration: 0.2 },  // A4
        { freq: 392, duration: 0.2 },  // G4
        { freq: 330, duration: 0.2 },  // E4
        { freq: 294, duration: 0.2 },  // D4
        { freq: 330, duration: 0.2 },  // E4
        { freq: 392, duration: 0.4 },  // G4
      ];

      let time = 0;
      melody.forEach(({ freq, duration }) => {
        if (!this.musicPlaying || !this.audioContext) return;

        setTimeout(() => {
          if (!this.musicPlaying || !this.audioContext) return;

          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

          gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration * 0.9);

          osc.connect(gain);
          gain.connect(this.audioContext.destination);

          osc.start();
          osc.stop(this.audioContext.currentTime + duration);
        }, time * 1000);

        time += duration;
      });

      // Loop the melody
      setTimeout(() => {
        if (this.musicPlaying) {
          playMelody();
        }
      }, time * 1000);
    };

    playMelody();
  }

  stopMusic(): void {
    this.musicPlaying = false;
    if (this.musicOscillator) {
      this.musicOscillator.stop();
      this.musicOscillator = null;
    }
    if (this.musicGain) {
      this.musicGain.disconnect();
      this.musicGain = null;
    }
  }
}

export const duckHuntAudio = new DuckHuntAudioManager();
