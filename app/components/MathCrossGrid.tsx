import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Cage, GridCell } from '../types';

interface MathCrossGridProps {
  grid: GridCell[][];
  cages: Cage[];
  onCellPress: (row: number, col: number) => void;
  selectedCell: { row: number; col: number } | null;
  gridSize: number;
}

export default function MathCrossGrid({
  grid,
  cages,
  onCellPress,
  selectedCell,
  gridSize,
}: MathCrossGridProps) {
  // Get cage for a specific cell
  const getCageForCell = (row: number, col: number): Cage | undefined => {
    return cages.find((cage) => cage.cells.some((cell) => cell.row === row && cell.col === col));
  };

  // Check if cell is first in its cage (to show cage label)
  const isFirstCellInCage = (row: number, col: number, cage: Cage): boolean => {
    return cage.cells[0].row === row && cage.cells[0].col === col;
  };

  // Get cage label
  const getCageLabel = (cage: Cage): string => {
    const operatorSymbol = cage.operator === '*' ? '×' : cage.operator === '/' ? '÷' : cage.operator;
    return `${cage.target}${operatorSymbol}`;
  };

  // Check if cell should have a border with adjacent cell
  const shouldHaveBorder = (row: number, col: number, direction: 'top' | 'right' | 'bottom' | 'left'): boolean => {
    const currentCage = getCageForCell(row, col);
    if (!currentCage) return true;

    let adjacentRow = row;
    let adjacentCol = col;

    switch (direction) {
      case 'top':
        adjacentRow = row - 1;
        break;
      case 'right':
        adjacentCol = col + 1;
        break;
      case 'bottom':
        adjacentRow = row + 1;
        break;
      case 'left':
        adjacentCol = col - 1;
        break;
    }

    // If adjacent cell is out of bounds, draw border
    if (adjacentRow < 0 || adjacentRow >= gridSize || adjacentCol < 0 || adjacentCol >= gridSize) {
      return true;
    }

    const adjacentCage = getCageForCell(adjacentRow, adjacentCol);
    
    // Draw border if adjacent cell is in a different cage
    return !adjacentCage || adjacentCage.id !== currentCage.id;
  };

  const cellSize = 320 / gridSize;

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { width: cellSize * gridSize, height: cellSize * gridSize }]}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cage = getCageForCell(rowIndex, colIndex);
            const isSelected =
              selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isInSelectedCage =
              selectedCell &&
              cage &&
              cage.cells.some(
                (c) => c.row === selectedCell.row && c.col === selectedCell.col
              );

            return (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    borderTopWidth: shouldHaveBorder(rowIndex, colIndex, 'top') ? 2 : 0.5,
                    borderRightWidth: shouldHaveBorder(rowIndex, colIndex, 'right') ? 2 : 0.5,
                    borderBottomWidth: shouldHaveBorder(rowIndex, colIndex, 'bottom') ? 2 : 0.5,
                    borderLeftWidth: shouldHaveBorder(rowIndex, colIndex, 'left') ? 2 : 0.5,
                  },
                  isSelected && styles.selectedCell,
                  isInSelectedCage && !isSelected && styles.highlightedCell,
                  cell.isCorrect === true && styles.correctCell,
                  cell.isCorrect === false && styles.wrongCell,
                ]}
                onPress={() => onCellPress(rowIndex, colIndex)}
                activeOpacity={0.7}
              >
                {/* Cage label */}
                {cage && isFirstCellInCage(rowIndex, colIndex, cage) && (
                  <Text style={styles.cageLabel}>{getCageLabel(cage)}</Text>
                )}

                {/* Cell value */}
                {cell.value !== null && (
                  <Text
                    style={[
                      styles.cellValue,
                      cell.isCorrect === true && styles.correctValue,
                      cell.isCorrect === false && styles.wrongValue,
                    ]}
                  >
                    {cell.value}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#1E293B',
  },
  cell: {
    backgroundColor: '#F8FAFC',
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedCell: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  highlightedCell: {
    backgroundColor: '#EFF6FF',
  },
  correctCell: {
    backgroundColor: '#D1FAE5',
  },
  wrongCell: {
    backgroundColor: '#FEE2E2',
  },
  cageLabel: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  cellValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  correctValue: {
    color: '#10B981',
  },
  wrongValue: {
    color: '#EF4444',
  },
});