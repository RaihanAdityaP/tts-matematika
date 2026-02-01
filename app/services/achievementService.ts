import { Alert, Vibration } from 'react-native';
import { Achievement, GameStats } from '../types';
import { checkAndUnlockAchievements, getAchievements } from './storageService';

export async function checkAchievementsAfterGame(
  stats: GameStats,
  onUnlock?: (achievement: Achievement) => void
): Promise<Achievement[]> {
  const newlyUnlocked = await checkAndUnlockAchievements(stats);

  if (newlyUnlocked.length > 0) {
    newlyUnlocked.forEach((achievement) => {
      // Vibrate on unlock
      Vibration.vibrate(200);

      // Show notification
      if (onUnlock) {
        onUnlock(achievement);
      } else {
        // Default alert notification
        Alert.alert(
          '🎉 Achievement Unlocked!',
          `${achievement.icon} ${achievement.title}\n${achievement.description}`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    });
  }

  return newlyUnlocked;
}

export async function getUnlockedCount(): Promise<number> {
  const achievements = await getAchievements();
  return achievements.filter((a) => a.unlocked).length;
}

export async function getTotalAchievements(): Promise<number> {
  const achievements = await getAchievements();
  return achievements.length;
}

export async function getAchievementProgress(): Promise<number> {
  const unlocked = await getUnlockedCount();
  const total = await getTotalAchievements();
  return total > 0 ? (unlocked / total) * 100 : 0;
}

// Get achievements grouped by status
export async function getGroupedAchievements(): Promise<{
  unlocked: Achievement[];
  locked: Achievement[];
}> {
  const achievements = await getAchievements();
  
  return {
    unlocked: achievements.filter((a) => a.unlocked),
    locked: achievements.filter((a) => !a.unlocked),
  };
}

// Check if a specific achievement is unlocked
export async function isAchievementUnlocked(achievementId: string): Promise<boolean> {
  const achievements = await getAchievements();
  const achievement = achievements.find((a) => a.id === achievementId);
  return achievement?.unlocked ?? false;
}