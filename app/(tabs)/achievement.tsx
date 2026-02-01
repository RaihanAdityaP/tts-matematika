import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LEVEL_CONFIGS } from '../constants/Levels';
import { getAchievementProgress } from '../services/achievementService';
import { getGameStats } from '../services/storageService';
import { DifficultyLevel } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    gamesCompleted: 0,
    totalScore: 0,
    achievementProgress: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const gameStats = await getGameStats();
    const progress = await getAchievementProgress();

    setStats({
      gamesCompleted: gameStats.gamesCompleted,
      totalScore: gameStats.totalScore,
      achievementProgress: Math.round(progress),
    });
  };

  const startGame = (difficulty: DifficultyLevel) => {
    // Navigate to play screen with difficulty
    router.push({
      pathname: '/play',
      params: { difficulty },
    });
  };

  const difficultyLevels: { level: DifficultyLevel; color: string; emoji: string }[] = [
    { level: 'easy', color: '#4CAF50', emoji: '🌱' },
    { level: 'medium', color: '#FF9800', emoji: '🔥' },
    { level: 'hard', color: '#F44336', emoji: '💪' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TTS Matematika</Text>
          <Text style={styles.subtitle}>
            Teka-Teki Silang dengan Soal Matematika
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.gamesCompleted}</Text>
            <Text style={styles.statLabel}>Game Selesai</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalScore}</Text>
            <Text style={styles.statLabel}>Total Skor</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.achievementProgress}%</Text>
            <Text style={styles.statLabel}>Achievement</Text>
          </View>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilih Level Kesulitan</Text>
          
          {difficultyLevels.map(({ level, color, emoji }) => (
            <TouchableOpacity
              key={level}
              style={[styles.levelButton, { borderColor: color }]}
              onPress={() => startGame(level)}
              activeOpacity={0.8}
            >
              <View style={styles.levelContent}>
                <View style={[styles.levelIcon, { backgroundColor: color }]}>
                  <Text style={styles.levelEmoji}>{emoji}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelTitle, { color }]}>
                    {LEVEL_CONFIGS[level].name}
                  </Text>
                  <Text style={styles.levelDescription}>
                    Grid {LEVEL_CONFIGS[level].gridSize}x{LEVEL_CONFIGS[level].gridSize} •{' '}
                    {LEVEL_CONFIGS[level].operators.join(', ')} •{' '}
                    {LEVEL_CONFIGS[level].numberRange.min}-
                    {LEVEL_CONFIGS[level].numberRange.max}
                  </Text>
                </View>
                <Text style={styles.arrow}>▶</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitur Game</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>💡</Text>
              <Text style={styles.featureText}>Sistem Hint</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>⏱️</Text>
              <Text style={styles.featureText}>Timer</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureText}>Achievement</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Progress</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/achievement')}
          >
            <Text style={styles.actionButtonText}>🏆 Lihat Achievement</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  levelButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelEmoji: {
    fontSize: 28,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 13,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});