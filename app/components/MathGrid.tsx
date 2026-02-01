import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GridCell } from '../types';

interface MathGridProps {
  grid: GridCell[][];
  onCellPress: (row: number, col: number) => void;
  selectedCell: { row: number; col: number } | null;
  gridSize: number;
}

const { width } = Dimensions.get('window');
const GRID_PADDING = 20;
const MAX_GRID_SIZE = width - GRID_PADDING * 2;

export default function MathGrid({
  grid,
  onCellPress,
  selectedCell,
  gridSize,
}: MathGridProps) {
  const cellSize = MAX_GRID_SIZE / gridSize;

  const getCellStyle = (row: number, col: number, cell: GridCell) => {
    const isSelected =
      selectedCell?.row === row && selectedCell?.col === col;
    const hasValue = cell.value !== null;
    const isCorrect = cell.isCorrect === true;
    const isWrong = cell.isCorrect === false;
    const isActive = cell.questionIds.length > 0;

    return [
      styles.cell,
      { width: cellSize - 4, height: cellSize - 4 },
      !isActive && styles.inactiveCell,
      isSelected && styles.selectedCell,
      isCorrect && styles.correctCell,
      isWrong && styles.wrongCell,
      cell.isShared && styles.sharedCell,
    ];
  };

  const getCellTextStyle = (cell: GridCell) => {
    if (cell.isCorrect === true) return styles.correctText;
    if (cell.isCorrect === false) return styles.wrongText;
    return styles.cellText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={getCellStyle(rowIndex, colIndex, cell)}
                onPress={() => onCellPress(rowIndex, colIndex)}
                disabled={cell.questionIds.length === 0}
                activeOpacity={0.7}
              >
                {cell.questionIds.length > 0 && (
                  <View style={styles.questionIndicator}>
                    <Text style={styles.questionNumber}>
                      {cell.questionIds.length}
                    </Text>
                  </View>
                )}
                {cell.value !== null && (
                  <Text style={getCellTextStyle(cell)}>
                    {cell.value}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  grid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    margin: 2,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  inactiveCell: {
    backgroundColor: '#e8e8e8',
    borderColor: '#d0d0d0',
    opacity: 0.5,
  },
  selectedCell: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
    borderWidth: 3,
  },
  correctCell: {
    backgroundColor: '#c8e6c9',
    borderColor: '#4CAF50',
  },
  wrongCell: {
    backgroundColor: '#ffcdd2',
    borderColor: '#f44336',
  },
  sharedCell: {
    backgroundColor: '#fff9c4',
    borderColor: '#FFC107',
    borderWidth: 2,
  },
  cellText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  correctText: {
    color: '#2e7d32',
  },
  wrongText: {
    color: '#c62828',
  },
  questionIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});