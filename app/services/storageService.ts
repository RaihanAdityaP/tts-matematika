import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, DifficultyLevel, GameStats } from '../types';

const STATS_KEY = '@math_cross_stats';
const ACHIEVEMENTS_KEY = '@math_cross_achievements';

// Get game statistics
export async function getStats(): Promise<GameStats> {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }

  // Return default stats
  return {
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
}

// Save game statistics
export async function saveStats(stats: GameStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

// Update stats after completing a game
export async function updateStatsAfterGame(
  difficulty: DifficultyLevel,
  score: number,
  timeElapsed: number,
  hintsUsed: number
): Promise<GameStats> {
  const stats = await getStats();

  stats.gamesPlayed++;
  stats.gamesCompleted++;
  stats.totalScore += score;
  stats.currentStreak++;

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  if (stats.fastestTime === 0 || timeElapsed < stats.fastestTime) {
    stats.fastestTime = timeElapsed;
  }

  // Update difficulty-specific stats
  switch (difficulty) {
    case 'easy':
      stats.easyCompleted++;
      break;
    case 'medium':
      stats.mediumCompleted++;
      break;
    case 'hard':
      stats.hardCompleted++;
      break;
  }

  // Check for perfect game (no hints)
  if (hintsUsed === 0) {
    stats.perfectGames++;
  }

  await saveStats(stats);
  return stats;
}

// Reset current streak
export async function resetStreak(): Promise<void> {
  const stats = await getStats();
  stats.currentStreak = 0;
  await saveStats(stats);
}

// Get achievements
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading achievements:', error);
  }

  return [];
}

// Save achievements
export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
}

// Alias for backward compatibility
export const getGameStats = getStats;