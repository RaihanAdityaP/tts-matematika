import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import HintModal from '../components/HintModal';
import MathCrossGrid from '../components/MathCrossGrid';
import NumberPad from '../components/NumberPad';
import ProgressBar from '../components/ProgressBar';
import TimerDisplay from '../components/TimerDisplay';
import { LEVEL_CONFIGS } from '../constants/Levels';
import { checkAchievementsAfterGame } from '../services/achievementService';
import {
  generateMathCrossPuzzle,
  validateCage,
  validateCell,
} from '../services/mathCrossGenerator';
import {
  resetStreak,
  updateStatsAfterGame,
} from '../services/storageService';
import { DifficultyLevel, GameState, GridCell } from '../types';

export default function PlayScreen() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [hintModalVisible, setHintModalVisible] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Initialize new game
  const initializeGame = useCallback(
    (level: DifficultyLevel) => {
      const { grid, cages } = generateMathCrossPuzzle(level);

      setGameState({
        grid,
        cages,
        gridSize: LEVEL_CONFIGS[level].gridSize,
        currentDifficulty: level,
        score: LEVEL_CONFIGS[level].baseScore,
        hintsUsed: 0,
        timeElapsed: 0,
        isComplete: false,
      });

      setSelectedCell(null);
      setSelectedNumber(null);
      setTimeElapsed(0);
      setHintsUsed(0);
      setDifficulty(level);

      // Start timer
      if (timerInterval) clearInterval(timerInterval);
      const interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    },
    [timerInterval]
  );

  useEffect(() => {
    // Initialize game on mount
    initializeGame('easy');

    // Cleanup timer on unmount
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  // Handle cell press
  const handleCellPress = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  // Handle number selection
  const handleNumberSelect = (number: number) => {
    if (!selectedCell || !gameState) {
      setSelectedNumber(number);
      return;
    }

    // Place number in selected cell
    const newGrid = gameState.grid.map((row: GridCell[], i: number) =>
      row.map((cell: GridCell, j: number) => {
        if (i === selectedCell.row && j === selectedCell.col) {
          return { ...cell, value: number, isCorrect: null };
        }
        return cell;
      })
    );

    setGameState({ ...gameState, grid: newGrid });
    setSelectedNumber(null);

    // Validate cell
    setTimeout(() => {
      validateCellPlacement(selectedCell.row, selectedCell.col, newGrid);
    }, 100);
  };

  // Handle delete
  const handleDelete = () => {
    if (!selectedCell || !gameState) return;

    const newGrid = gameState.grid.map((row: GridCell[], i: number) =>
      row.map((cell: GridCell, j: number) => {
        if (i === selectedCell.row && j === selectedCell.col) {
          return { ...cell, value: null, isCorrect: null };
        }
        return cell;
      })
    );

    setGameState({ ...gameState, grid: newGrid });
  };

  // Handle clear all
  const handleClear = () => {
    if (!gameState) return;

    Alert.alert('Bersihkan Grid', 'Hapus semua jawaban?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya',
        onPress: () => {
          const newGrid = gameState.grid.map((row: GridCell[]) =>
            row.map((cell: GridCell) => ({
              ...cell,
              value: null,
              isCorrect: null,
            }))
          );
          setGameState({ ...gameState, grid: newGrid });
        },
      },
    ]);
  };

  // Validate cell placement
  const validateCellPlacement = (row: number, col: number, grid: GridCell[][]) => {
    if (!gameState) return;

    const isValid = validateCell(grid, gameState.cages, row, col);

    const newGrid = grid.map((r: GridCell[], i: number) =>
      r.map((c: GridCell, j: number) => {
        if (i === row && j === col) {
          return { ...c, isCorrect: isValid };
        }
        return c;
      })
    );

    setGameState({ ...gameState, grid: newGrid });

    // Check game completion
    checkGameCompletion(newGrid);
  };

  // Check if game is complete
  const checkGameCompletion = (grid: GridCell[][]) => {
    if (!gameState) return;

    // Check if all cells are filled
    const allFilled = grid.every((row: GridCell[]) =>
      row.every((cell: GridCell) => cell.value !== null)
    );

    if (!allFilled) return;

    // Check if all cells are correct
    const allCorrect = grid.every((row: GridCell[]) =>
      row.every((cell: GridCell) => cell.isCorrect === true)
    );

    // Check if all cages are valid
    const allCagesValid = gameState.cages.every((cage) =>
      validateCage(grid, cage)
    );

    if (allCorrect && allCagesValid) {
      if (timerInterval) clearInterval(timerInterval);

      setTimeout(() => {
        Alert.alert(
          'Selamat!',
          `Kamu berhasil menyelesaikan puzzle!\n\nWaktu: ${formatTime(
            timeElapsed
          )}\nSkor: ${gameState.score}`,
          [
            {
              text: 'Main Lagi',
              onPress: () => initializeGame(difficulty),
            },
          ]
        );

        // Update stats and check achievements
        updateStatsAfterGame(difficulty, gameState.score, timeElapsed, hintsUsed).then(
          (stats: any) => {
            checkAchievementsAfterGame(stats);
          }
        );
      }, 300);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Handle hint selection
  const handleHintSelect = (
    hintType: 'reveal_cell' | 'highlight_wrong' | 'show_cage'
  ) => {
    if (!gameState) {
      setHintModalVisible(false);
      return;
    }

    const hintCosts = {
      reveal_cell: 20,
      highlight_wrong: 15,
      show_cage: 10,
    };

    const cost = hintCosts[hintType];

    if (gameState.score < cost) {
      Alert.alert('Skor Tidak Cukup', 'Skor kamu tidak cukup untuk hint ini');
      return;
    }

    // Deduct score
    const newScore = gameState.score - cost;
    setGameState({ ...gameState, score: newScore });
    setHintsUsed(hintsUsed + 1);

    // Apply hint
    switch (hintType) {
      case 'reveal_cell':
        revealCell();
        break;
      case 'highlight_wrong':
        highlightWrongCells();
        break;
      case 'show_cage':
        showCage();
        break;
    }

    setHintModalVisible(false);
  };

  const revealCell = () => {
    if (!gameState || !selectedCell) {
      Alert.alert('Pilih Sel', 'Pilih sel terlebih dahulu');
      return;
    }

    const cell = gameState.grid[selectedCell.row][selectedCell.col];

    const newGrid = gameState.grid.map((row: GridCell[], i: number) =>
      row.map((c: GridCell, j: number) => {
        if (i === selectedCell.row && j === selectedCell.col) {
          return { ...c, value: cell.solution, isCorrect: true };
        }
        return c;
      })
    );

    setGameState({ ...gameState, grid: newGrid });
  };

  const highlightWrongCells = () => {
    if (!gameState) return;

    const newGrid = gameState.grid.map((row: GridCell[]) =>
      row.map((cell: GridCell) => {
        if (cell.value !== null && cell.value !== cell.solution) {
          return { ...cell, isCorrect: false };
        }
        return cell;
      })
    );

    setGameState({ ...gameState, grid: newGrid });
    Alert.alert('Bantuan', 'Sel dengan jawaban salah ditandai merah', [{ text: 'OK' }]);
  };

  const showCage = () => {
    if (!gameState || !selectedCell) {
      Alert.alert('Pilih Sel', 'Pilih sel terlebih dahulu');
      return;
    }

    const cell = gameState.grid[selectedCell.row][selectedCell.col];
    const cage = gameState.cages.find((c) => c.id === cell.cageId);

    if (cage) {
      const operatorName = {
        '+': 'Penjumlahan',
        '-': 'Pengurangan',
        '*': 'Perkalian',
        '/': 'Pembagian',
      }[cage.operator];

      Alert.alert(
        'Info Cage',
        `Target: ${cage.target}\nOperasi: ${operatorName}\nJumlah sel: ${cage.cells.length}`,
        [{ text: 'OK' }]
      );
    }
  };

  if (!gameState) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const completedCells = gameState.grid
    .flat()
    .filter((c: GridCell) => c.value !== null).length;
  const totalCells = gameState.gridSize * gameState.gridSize;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Skor</Text>
            <Text style={styles.scoreValue}>{gameState.score}</Text>
          </View>

          <TimerDisplay timeElapsed={timeElapsed} />

          <TouchableOpacity
            style={styles.hintButton}
            onPress={() => setHintModalVisible(true)}
          >
            <Text style={styles.hintButtonText}>HINT</Text>
          </TouchableOpacity>
        </View>

        <ProgressBar completed={completedCells} total={totalCells} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Difficulty Selector */}
        <View style={styles.difficultySection}>
          <Text style={styles.sectionTitle}>Tingkat Kesulitan</Text>
          <View style={styles.difficultyButtons}>
            {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyButton,
                  difficulty === level && styles.activeDifficulty,
                ]}
                onPress={() => {
                  Alert.alert('Ganti Kesulitan', 'Mulai game baru?', [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Ya', onPress: () => initializeGame(level) },
                  ]);
                }}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    difficulty === level && styles.activeDifficultyText,
                  ]}
                >
                  {level === 'easy' ? 'Mudah' : level === 'medium' ? 'Sedang' : 'Sulit'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Grid */}
        <View style={styles.gridSection}>
          <MathCrossGrid
            grid={gameState.grid}
            cages={gameState.cages}
            onCellPress={handleCellPress}
            selectedCell={selectedCell}
            gridSize={gameState.gridSize}
          />
        </View>

        {/* Number Pad */}
        <View style={styles.numberPadSection}>
          <NumberPad
            onNumberSelect={handleNumberSelect}
            onDelete={handleDelete}
            onClear={handleClear}
            selectedNumber={selectedNumber}
            maxNumber={gameState.gridSize}
          />
        </View>
      </ScrollView>

      {/* Hint Modal */}
      <HintModal
        visible={hintModalVisible}
        currentScore={gameState.score}
        onClose={() => setHintModalVisible(false)}
        onSelectHint={handleHintSelect}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.newGameButton}
          onPress={() => {
            Alert.alert('Game Baru', 'Mulai game baru?', [
              { text: 'Batal', style: 'cancel' },
              {
                text: 'Ya',
                onPress: () => {
                  resetStreak();
                  initializeGame(difficulty);
                },
              },
            ]);
          }}
        >
          <Text style={styles.newGameButtonText}>Game Baru</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  scoreCard: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  hintButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hintButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  difficultySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  activeDifficulty: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeDifficultyText: {
    color: '#FFFFFF',
  },
  gridSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  numberPadSection: {
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  newGameButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  newGameButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});