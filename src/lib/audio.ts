type SoundEffect = 'shoot' | 'hit' | 'miss' | 'gameOver' | 'levelUp' | 'combo';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundEffect, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  async initialize(): Promise<void> {
    if (this.audioContext) return;

    try {
      this.audioContext = new AudioContext();
      await this.generateSounds();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  private async generateSounds(): Promise<void> {
    if (!this.audioContext) return;

    // Generate synthesized sound effects
    this.sounds.set('shoot', await this.createShootSound());
    this.sounds.set('hit', await this.createHitSound());
    this.sounds.set('miss', await this.createMissSound());
    this.sounds.set('gameOver', await this.createGameOverSound());
    this.sounds.set('levelUp', await this.createLevelUpSound());
    this.sounds.set('combo', await this.createComboSound());
  }

  private async createShootSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const duration = 0.15;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Noise burst with decay
      const noise = Math.random() * 2 - 1;
      const envelope = Math.exp(-t * 30);
      data[i] = noise * envelope * 0.5;
    }

    return buffer;
  }

  private async createHitSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const duration = 0.2;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Rising tone
      const freq = 400 + t * 800;
      const envelope = Math.exp(-t * 10);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
    }

    return buffer;
  }

  private async createMissSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const duration = 0.3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Descending tone
      const freq = 300 - t * 200;
      const envelope = Math.exp(-t * 8);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
    }

    return buffer;
  }

  private async createGameOverSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const duration = 1.0;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Descending notes
      const note = Math.floor(t * 4);
      const freqs = [440, 392, 349, 330];
      const freq = freqs[Math.min(note, 3)];
      const envelope = Math.exp(-((t % 0.25) * 10));
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
    }

    return buffer;
  }

  private async createLevelUpSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const duration = 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Ascending arpeggio
      const note = Math.floor(t * 6);
      const freqs = [262, 330, 392, 523, 659, 784];
      const freq = freqs[Math.min(note, 5)];
      const envelope = 1 - t / duration;
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
    }

    return buffer;
  }

  private async createComboSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const duration = 0.15;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // High pitched ping
      const freq = 880;
      const envelope = Math.exp(-t * 20);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
    }

    return buffer;
  }

  play(sound: SoundEffect): void {
    if (!this.enabled || !this.audioContext) return;

    const buffer = this.sounds.get(sound);
    if (!buffer) return;

    // Resume audio context if suspended (required for autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = this.volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }
}

// Singleton instance
export const audioManager = new AudioManager();
