import { Achievement, DailyChallenge } from '@/types';
import { ACHIEVEMENTS, DAILY_CHALLENGE_TEMPLATES } from '@/constants/game';

const ACHIEVEMENTS_KEY = 'shootman-achievements';
const DAILY_KEY = 'shootman-daily';
const STATS_KEY = 'shootman-stats';

interface GameStats {
  totalKills: number;
  totalScore: number;
  highestCombo: number;
  levelsCompleted: number;
  powerUpsCollected: number;
  bossesDefeated: number;
  coopWins: number;
}

class AchievementsManager {
  private achievements: Achievement[];
  private dailyChallenge: DailyChallenge | null = null;
  private stats: GameStats;

  constructor() {
    this.achievements = [...ACHIEVEMENTS];
    this.stats = {
      totalKills: 0,
      totalScore: 0,
      highestCombo: 0,
      levelsCompleted: 0,
      powerUpsCollected: 0,
      bossesDefeated: 0,
      coopWins: 0,
    };
    this.load();
  }

  load(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      // Load achievements
      const storedAchievements = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (storedAchievements) {
        const parsed = JSON.parse(storedAchievements);
        this.achievements = ACHIEVEMENTS.map((a) => {
          const saved = parsed.find((s: Achievement) => s.id === a.id);
          return saved ? { ...a, ...saved } : a;
        });
      }

      // Load stats
      const storedStats = localStorage.getItem(STATS_KEY);
      if (storedStats) {
        this.stats = { ...this.stats, ...JSON.parse(storedStats) };
      }

      // Load/generate daily challenge
      this.loadOrGenerateDaily();
    } catch (error) {
      console.warn('Failed to load achievements:', error);
    }
  }

  private save(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(this.achievements));
      localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
    } catch (error) {
      console.warn('Failed to save achievements:', error);
    }
  }

  private loadOrGenerateDaily(): void {
    const today = new Date().toISOString().split('T')[0];

    try {
      const stored = localStorage.getItem(DAILY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) {
          this.dailyChallenge = parsed;
          return;
        }
      }
    } catch {
      // Generate new if load fails
    }

    // Generate new daily challenge
    this.generateDailyChallenge(today);
  }

  private generateDailyChallenge(date: string): void {
    const seed = date.split('-').reduce((a, b) => a + parseInt(b), 0);
    const templateIndex = seed % DAILY_CHALLENGE_TEMPLATES.length;
    const template = DAILY_CHALLENGE_TEMPLATES[templateIndex];

    const target = template.baseTarget + (seed % 3) * Math.floor(template.baseTarget * 0.2);

    this.dailyChallenge = {
      id: `daily-${date}`,
      date,
      name: template.name,
      description: template.description.replace('{target}', target.toString()),
      type: template.type as DailyChallenge['type'],
      target,
      reward: Math.floor(target * 10),
      completed: false,
      progress: 0,
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DAILY_KEY, JSON.stringify(this.dailyChallenge));
    }
  }

  // Update methods
  recordKill(): void {
    this.stats.totalKills++;
    this.updateProgress('kills', this.stats.totalKills);
    this.save();
  }

  recordScore(score: number): void {
    this.stats.totalScore += score;
    this.updateProgress('score', this.stats.totalScore);
    this.save();
  }

  recordCombo(combo: number): void {
    if (combo > this.stats.highestCombo) {
      this.stats.highestCombo = combo;
    }
    this.updateProgress('combo', combo);
    this.save();
  }

  recordLevelComplete(): void {
    this.stats.levelsCompleted++;
    this.updateProgress('level', this.stats.levelsCompleted);
    this.save();
  }

  recordPowerUpCollected(): void {
    this.stats.powerUpsCollected++;
    this.updateProgress('powerup', this.stats.powerUpsCollected);
    this.save();
  }

  recordBossDefeated(): void {
    this.stats.bossesDefeated++;
    this.checkSpecialAchievement('boss_slayer');
    this.save();
  }

  recordCoopWin(): void {
    this.stats.coopWins++;
    this.checkSpecialAchievement('duo_champions');
    this.save();
  }

  recordAccuracy(accuracy: number): void {
    this.updateProgress('accuracy', accuracy);
  }

  private updateProgress(type: Achievement['type'], value: number): void {
    this.achievements.forEach((achievement) => {
      if (achievement.type === type && !achievement.unlocked) {
        achievement.progress = Math.max(achievement.progress, value);
        if (achievement.progress >= achievement.requirement) {
          this.unlockAchievement(achievement.id);
        }
      }
    });

    // Update daily challenge
    if (this.dailyChallenge && this.dailyChallenge.type === type && !this.dailyChallenge.completed) {
      this.dailyChallenge.progress = Math.max(this.dailyChallenge.progress, value);
      if (this.dailyChallenge.progress >= this.dailyChallenge.target) {
        this.dailyChallenge.completed = true;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(DAILY_KEY, JSON.stringify(this.dailyChallenge));
        }
      }
    }
  }

  private checkSpecialAchievement(id: string): void {
    const achievement = this.achievements.find((a) => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.progress = 1;
      this.unlockAchievement(id);
    }
  }

  private unlockAchievement(id: string): void {
    const achievement = this.achievements.find((a) => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
      this.save();
    }
  }

  // Getters
  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => a.unlocked);
  }

  getRecentUnlocks(): Achievement[] {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return this.achievements.filter((a) => a.unlocked && a.unlockedAt && a.unlockedAt > oneHourAgo);
  }

  getDailyChallenge(): DailyChallenge | null {
    return this.dailyChallenge;
  }

  getStats(): GameStats {
    return { ...this.stats };
  }

  getDailyReward(): number {
    if (this.dailyChallenge?.completed) {
      return this.dailyChallenge.reward;
    }
    return 0;
  }
}

export const achievementsManager = new AchievementsManager();
