import { Achievement, GameStats } from '../types';
import { getAchievements, saveAchievements } from './storageService';

// Define all achievements
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'Kemenangan Pertama',
    description: 'Selesaikan puzzle pertama kamu',
    icon: '🎉',
    unlocked: false,
    condition: (stats: GameStats) => stats.gamesCompleted >= 1,
  },
  {
    id: 'speed_demon',
    title: 'Kilat',
    description: 'Selesaikan puzzle dalam waktu kurang dari 2 menit',
    icon: '⚡',
    unlocked: false,
    condition: (stats: GameStats) => stats.fastestTime > 0 && stats.fastestTime < 120,
  },
  {
    id: 'perfect_game',
    title: 'Sempurna',
    description: 'Selesaikan puzzle tanpa menggunakan hint',
    icon: '💎',
    unlocked: false,
    condition: (stats: GameStats) => stats.perfectGames >= 1,
  },
  {
    id: 'streak_5',
    title: 'Beruntun 5',
    description: 'Menang 5 kali berturut-turut',
    icon: '🔥',
    unlocked: false,
    condition: (stats: GameStats) => stats.currentStreak >= 5,
  },
  {
    id: 'master_easy',
    title: 'Master Mudah',
    description: 'Selesaikan 10 puzzle level mudah',
    icon: '🥉',
    unlocked: false,
    condition: (stats: GameStats) => stats.easyCompleted >= 10,
  },
  {
    id: 'master_medium',
    title: 'Master Menengah',
    description: 'Selesaikan 10 puzzle level menengah',
    icon: '🥈',
    unlocked: false,
    condition: (stats: GameStats) => stats.mediumCompleted >= 10,
  },
  {
    id: 'master_hard',
    title: 'Master Sulit',
    description: 'Selesaikan 10 puzzle level sulit',
    icon: '🥇',
    unlocked: false,
    condition: (stats: GameStats) => stats.hardCompleted >= 10,
  },
  {
    id: 'high_score',
    title: 'Skor Tinggi',
    description: 'Dapatkan total skor 1000',
    icon: '🏆',
    unlocked: false,
    condition: (stats: GameStats) => stats.totalScore >= 1000,
  },
];

export async function checkAchievementsAfterGame(stats: GameStats): Promise<Achievement[]> {
  const currentAchievements = await getAchievements();
  const newlyUnlocked: Achievement[] = [];

  // Initialize achievements if empty
  let achievements = currentAchievements.length > 0 ? currentAchievements : ACHIEVEMENTS;

  achievements = achievements.map((achievement) => {
    if (!achievement.unlocked && achievement.condition(stats)) {
      achievement.unlocked = true;
      newlyUnlocked.push(achievement);

      // Update stats
      if (!stats.achievementsUnlocked.includes(achievement.id)) {
        stats.achievementsUnlocked.push(achievement.id);
      }
    }
    return achievement;
  });

  await saveAchievements(achievements);

  return newlyUnlocked;
}

export async function getAllAchievements(): Promise<Achievement[]> {
  const currentAchievements = await getAchievements();
  return currentAchievements.length > 0 ? currentAchievements : ACHIEVEMENTS;
}

export async function getAchievementProgress(): Promise<number> {
  const achievements = await getAllAchievements();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  
  return totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
}