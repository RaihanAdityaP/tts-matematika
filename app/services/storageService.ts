import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS } from '../constants/Achievements';
import { Achievement, GameStats } from '../types';

const STORAGE_KEYS = {
  STATS: '@tts_math_stats',
  ACHIEVEMENTS: '@tts_math_achievements',
  SETTINGS: '@tts_math_settings',
};

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesCompleted: 0,
  totalScore: 0,
  fastestTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  easyCompleted: 0,
  mediumCompleted: 0,
  hardCompleted: 0,
  perfectGames: 0,
  achievementsUnlocked: [],
};

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  vibrationEnabled: true,
  darkMode: false,
};

// Get game statistics
export async function getGameStats(): Promise<GameStats> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
    if (data) {
      return JSON.parse(data);
    }
    return DEFAULT_STATS;
  } catch (error) {
    console.error('Error loading stats:', error);
    return DEFAULT_STATS;
  }
}

// Save game statistics
export async function saveGameStats(stats: GameStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

// Update stats after completing a game
export async function updateStatsAfterGame(
  difficulty: 'easy' | 'medium' | 'hard',
  score: number,
  timeElapsed: number,
  hintsUsed: number
): Promise<GameStats> {
  const stats = await getGameStats();

  stats.gamesPlayed += 1;
  stats.gamesCompleted += 1;
  stats.totalScore += score;
  stats.currentStreak += 1;

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  if (stats.fastestTime === 0 || timeElapsed < stats.fastestTime) {
    stats.fastestTime = timeElapsed;
  }

  if (hintsUsed === 0) {
    stats.perfectGames += 1;
  }

  switch (difficulty) {
    case 'easy':
      stats.easyCompleted += 1;
      break;
    case 'medium':
      stats.mediumCompleted += 1;
      break;
    case 'hard':
      stats.hardCompleted += 1;
      break;
  }

  await saveGameStats(stats);
  return stats;
}

// Reset streak (call when game is not completed)
export async function resetStreak(): Promise<void> {
  const stats = await getGameStats();
  stats.currentStreak = 0;
  await saveGameStats(stats);
}

// Get achievements
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (data) {
      return JSON.parse(data);
    }
    return ACHIEVEMENTS;
  } catch (error) {
    console.error('Error loading achievements:', error);
    return ACHIEVEMENTS;
  }
}

// Check and unlock achievements
export async function checkAndUnlockAchievements(
  stats: GameStats
): Promise<Achievement[]> {
  const achievements = await getAchievements();
  const newlyUnlocked: Achievement[] = [];

  achievements.forEach((achievement) => {
    if (!achievement.unlocked && achievement.condition(stats)) {
      achievement.unlocked = true;
      stats.achievementsUnlocked.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  });

  if (newlyUnlocked.length > 0) {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ACHIEVEMENTS,
      JSON.stringify(achievements)
    );
    await saveGameStats(stats);
  }

  return newlyUnlocked;
}

// Get settings
export async function getSettings() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save settings
export async function saveSettings(settings: typeof DEFAULT_SETTINGS): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Clear all data (for testing or reset)
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.STATS,
      STORAGE_KEYS.ACHIEVEMENTS,
      STORAGE_KEYS.SETTINGS,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}