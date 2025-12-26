import { GameSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants/game';

const STORAGE_KEY = 'shootman-settings';

class SettingsManager {
  private settings: GameSettings;

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.load();
  }

  load(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }

  save(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  get<K extends keyof GameSettings>(key: K): GameSettings[K] {
    return this.settings[key];
  }

  set<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
    this.settings[key] = value;
    this.save();
  }

  getAll(): GameSettings {
    return { ...this.settings };
  }

  setAll(settings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.save();
  }

  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
  }
}

export const settingsManager = new SettingsManager();
