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
import MathGrid from '../components/MathGrid';
import NumberPad from '../components/NumberPad';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import TimerDisplay from '../components/TimerDisplay';
import { LEVEL_CONFIGS } from '../constants/Levels';
import { checkAchievementsAfterGame } from '../services/achievementService';
import { checkAnswer, generateCrosswordPuzzle } from '../services/mathGenerator';
import {
  resetStreak,
  updateStatsAfterGame,
} from '../services/storageService';
import { DifficultyLevel, GameState, GridCell, MathQuestion } from '../types';

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
  const initializeGame = useCallback((level: DifficultyLevel) => {
    const { grid, questions } = generateCrosswordPuzzle(level);
    
    setGameState({
      grid,
      questions,
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
  }, [timerInterval]);

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
    if (!gameState) return;

    const cell = gameState.grid[row][col];
    if (cell.questionIds.length === 0) return;

    setSelectedCell({ row, col });
  };

  // Handle number selection and placement
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

    // Check if placement is correct
    setTimeout(() => validateCell(selectedCell.row, selectedCell.col, number), 300);
  };

  // Validate cell answer
  const validateCell = (row: number, col: number, value: number) => {
    if (!gameState) return;

    const cell = gameState.grid[row][col];
    let isCorrect = false;

    // Check against all questions for this cell
    for (const questionId of cell.questionIds) {
      const question = gameState.questions.find((q: MathQuestion) => q.id === questionId);
      if (question && checkAnswer(value, question)) {
        isCorrect = true;
        break;
      }
    }

    // Update cell correctness
    const newGrid = gameState.grid.map((r: GridCell[], i: number) =>
      r.map((c: GridCell, j: number) => {
        if (i === row && j === col) {
          return { ...c, isCorrect };
        }
        return c;
      })
    );

    setGameState({ ...gameState, grid: newGrid });

    // Check if game is complete
    checkGameCompletion(newGrid);
  };

  // Check if all cells are correctly filled
  const checkGameCompletion = (grid: GridCell[][]) => {
    if (!gameState) return;

    const allCellsCorrect = grid.every((row: GridCell[]) =>
      row.every((cell: GridCell) => {
        if (cell.questionIds.length === 0) return true;
        return cell.isCorrect === true;
      })
    );

    if (allCellsCorrect) {
      if (timerInterval) clearInterval(timerInterval);

      Alert.alert(
        '🎉 Selamat!',
        `Kamu berhasil menyelesaikan puzzle!\n\nWaktu: ${timeElapsed}s\nSkor: ${gameState.score}`,
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
    }
  };

  // Handle hint selection
  const handleHintSelect = (
    hintType: 'reveal_cell' | 'highlight_wrong' | 'show_operation'
  ) => {
    if (!gameState || !selectedCell) {
      Alert.alert('Pilih Sel', 'Pilih sel terlebih dahulu sebelum menggunakan hint');
      setHintModalVisible(false);
      return;
    }

    const hintCost = hintType === 'reveal_cell' ? 50 : hintType === 'highlight_wrong' ? 30 : 20;

    if (gameState.score < hintCost) {
      Alert.alert('Skor Tidak Cukup', 'Skor kamu tidak cukup untuk hint ini');
      return;
    }

    // Deduct score
    const newScore = gameState.score - hintCost;
    setGameState({ ...gameState, score: newScore });
    setHintsUsed(hintsUsed + 1);

    // Apply hint based on type
    switch (hintType) {
      case 'reveal_cell':
        revealCell();
        break;
      case 'highlight_wrong':
        highlightWrongCells();
        break;
      case 'show_operation':
        showOperation();
        break;
    }

    setHintModalVisible(false);
  };

  const revealCell = () => {
    if (!gameState || !selectedCell) return;

    const cell = gameState.grid[selectedCell.row][selectedCell.col];
    const question = gameState.questions.find((q: MathQuestion) =>
      cell.questionIds.includes(q.id)
    );

    if (question) {
      const newGrid = gameState.grid.map((row: GridCell[], i: number) =>
        row.map((c: GridCell, j: number) => {
          if (i === selectedCell.row && j === selectedCell.col) {
            return { ...c, value: question.answer, isCorrect: true };
          }
          return c;
        })
      );

      setGameState({ ...gameState, grid: newGrid });
    }
  };

  const highlightWrongCells = () => {
    if (!gameState) return;

    Alert.alert(
      'Bantuan',
      'Sel dengan jawaban salah ditandai dengan border merah',
      [{ text: 'OK' }]
    );
  };

  const showOperation = () => {
    if (!gameState || !selectedCell) return;

    const cell = gameState.grid[selectedCell.row][selectedCell.col];
    const question = gameState.questions.find((q: MathQuestion) =>
      cell.questionIds.includes(q.id)
    );

    if (question) {
      Alert.alert('Operasi', `Soal ini menggunakan: ${question.operators.join(', ')}`, [
        { text: 'OK' },
      ]);
    }
  };

  if (!gameState) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const activeQuestions = selectedCell
    ? gameState.questions.filter((q: MathQuestion) =>
        gameState.grid[selectedCell.row][selectedCell.col].questionIds.includes(q.id)
      )
    : [];

  const completedCells = gameState.grid.flat().filter((c: GridCell) => c.isCorrect === true).length;
  const totalActiveCells = gameState.grid.flat().filter((c: GridCell) => c.questionIds.length > 0).length;

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
            <Text style={styles.hintButtonText}>💡 Hint</Text>
          </TouchableOpacity>
        </View>

        <ProgressBar completed={completedCells} total={totalActiveCells} />
      </View>

      {/* Questions */}
      <QuestionCard questions={gameState.questions} activeQuestions={activeQuestions} />

      {/* Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MathGrid
          grid={gameState.grid}
          onCellPress={handleCellPress}
          selectedCell={selectedCell}
          gridSize={LEVEL_CONFIGS[difficulty].gridSize}
        />
      </ScrollView>

      {/* Number Pad */}
      <NumberPad onNumberSelect={handleNumberSelect} selectedNumber={selectedNumber} />

      {/* Hint Modal */}
      <HintModal
        visible={hintModalVisible}
        currentScore={gameState.score}
        onClose={() => setHintModalVisible(false)}
        onSelectHint={handleHintSelect}
      />

      {/* New Game Button */}
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
          <Text style={styles.newGameButtonText}>🔄 Game Baru</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    backgroundColor: '#f5f5f5',
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
    color: '#4CAF50',
  },
  hintButton: {
    backgroundColor: '#FFC107',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hintButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  newGameButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  newGameButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});