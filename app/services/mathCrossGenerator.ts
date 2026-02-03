import { LEVEL_CONFIGS } from '../constants/Levels';
import { Cage, DifficultyLevel, GridCell, OperatorType } from '../types';

// Generate a valid Math Cross puzzle
export function generateMathCrossPuzzle(difficulty: DifficultyLevel): {
  grid: GridCell[][];
  cages: Cage[];
} {
  const config = LEVEL_CONFIGS[difficulty];
  const size = config.gridSize;

  // Generate a valid solution grid (like Sudoku - no repeating numbers in rows/cols)
  const solution = generateValidSolution(size);

  // Generate cages
  const cages = generateCages(solution, size, config.cageCount, config.maxCageSize);

  // Create grid cells
  const grid: GridCell[][] = [];
  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      const cage = cages.find((c) =>
        c.cells.some((cell) => cell.row === row && cell.col === col)
      );

      grid[row][col] = {
        row,
        col,
        value: null,
        solution: solution[row][col],
        cageId: cage?.id || '',
        isCorrect: null,
      };
    }
  }

  return { grid, cages };
}

// Generate a valid solution (each row and column contains 1 to N exactly once)
function generateValidSolution(size: number): number[][] {
  const grid: number[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));

  // Start with a base pattern and shuffle
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      grid[i][j] = ((i + j) % size) + 1;
    }
  }

  // Shuffle rows and columns to create variation
  shuffleRows(grid, size);
  shuffleColumns(grid, size);

  return grid;
}

function shuffleRows(grid: number[][], size: number) {
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i], grid[j]] = [grid[j], grid[i]];
  }
}

function shuffleColumns(grid: number[][], size: number) {
  for (let col = size - 1; col > 0; col--) {
    const newCol = Math.floor(Math.random() * (col + 1));
    for (let row = 0; row < size; row++) {
      [grid[row][col], grid[row][newCol]] = [grid[row][newCol], grid[row][col]];
    }
  }
}

// Generate cages with mathematical constraints
function generateCages(
  solution: number[][],
  size: number,
  targetCageCount: number,
  maxCageSize: number
): Cage[] {
  const cages: Cage[] = [];
  const used: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));

  let cageId = 0;

  while (cages.length < targetCageCount) {
    // Find random starting cell
    const startRow = Math.floor(Math.random() * size);
    const startCol = Math.floor(Math.random() * size);

    if (used[startRow][startCol]) continue;

    // Determine cage size (1 to maxCageSize)
    const cageSize = Math.floor(Math.random() * maxCageSize) + 1;

    // Build cage by adding adjacent cells
    const cells: { row: number; col: number }[] = [{ row: startRow, col: startCol }];
    used[startRow][startCol] = true;

    // Grow the cage
    while (cells.length < cageSize) {
      const possibleCells = getPossibleAdjacentCells(cells, used, size);
      if (possibleCells.length === 0) break;

      const newCell = possibleCells[Math.floor(Math.random() * possibleCells.length)];
      cells.push(newCell);
      used[newCell.row][newCell.col] = true;
    }

    // Get values from solution
    const values = cells.map((cell) => solution[cell.row][cell.col]);

    // Generate mathematical constraint
    const { target, operator } = generateConstraint(values);

    cages.push({
      id: `cage-${cageId++}`,
      cells,
      target,
      operator,
    });
  }

  // Fill remaining cells with single-cell cages
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!used[row][col]) {
        const value = solution[row][col];
        cages.push({
          id: `cage-${cageId++}`,
          cells: [{ row, col }],
          target: value,
          operator: '==' as any, // Single cell, just equals itself
        });
        used[row][col] = true;
      }
    }
  }

  return cages;
}

function getPossibleAdjacentCells(
  currentCells: { row: number; col: number }[],
  used: boolean[][],
  size: number
): { row: number; col: number }[] {
  const possible: { row: number; col: number }[] = [];
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const cell of currentCells) {
    for (const [dr, dc] of directions) {
      const newRow = cell.row + dr;
      const newCol = cell.col + dc;

      if (
        newRow >= 0 &&
        newRow < size &&
        newCol >= 0 &&
        newCol < size &&
        !used[newRow][newCol] &&
        !possible.some((c) => c.row === newRow && c.col === newCol)
      ) {
        possible.push({ row: newRow, col: newCol });
      }
    }
  }

  return possible;
}

function generateConstraint(values: number[]): { target: number; operator: OperatorType } {
  if (values.length === 1) {
    return { target: values[0], operator: '+' };
  }

  const operators: OperatorType[] = ['+', '-', '*', '/'];
  let operator: OperatorType;
  let target: number;

  // Try to find a valid operation
  const shuffledOps = operators.sort(() => Math.random() - 0.5);

  for (const op of shuffledOps) {
    const result = calculateConstraint(values, op);
    if (result !== null && result > 0 && Number.isInteger(result)) {
      target = result;
      operator = op;
      return { target, operator };
    }
  }

  // Fallback to addition
  return {
    target: values.reduce((sum, val) => sum + val, 0),
    operator: '+',
  };
}

function calculateConstraint(values: number[], operator: OperatorType): number | null {
  const sorted = [...values].sort((a, b) => b - a); // Sort descending

  switch (operator) {
    case '+':
      return sorted.reduce((sum, val) => sum + val, 0);

    case '-':
      if (sorted.length !== 2) return null;
      return sorted[0] - sorted[1];

    case '*':
      return sorted.reduce((product, val) => product * val, 1);

    case '/':
      if (sorted.length !== 2) return null;
      return sorted[0] % sorted[1] === 0 ? sorted[0] / sorted[1] : null;

    default:
      return null;
  }
}

// Validate if user's answer is correct
export function validateCell(
  grid: GridCell[][],
  cages: Cage[],
  row: number,
  col: number
): boolean {
  const cell = grid[row][col];
  if (cell.value === null) return false;

  // Check if value matches solution
  if (cell.value !== cell.solution) return false;

  // Check if it doesn't violate row/column uniqueness
  const size = grid.length;

  // Check row
  for (let c = 0; c < size; c++) {
    if (c !== col && grid[row][c].value === cell.value) {
      return false;
    }
  }

  // Check column
  for (let r = 0; r < size; r++) {
    if (r !== row && grid[r][col].value === cell.value) {
      return false;
    }
  }

  return true;
}

// Check if all cells in a cage are filled correctly
export function validateCage(grid: GridCell[][], cage: Cage): boolean {
  const values = cage.cells.map((pos) => grid[pos.row][pos.col].value);

  // Check if all cells are filled
  if (values.some((v) => v === null)) return false;

  // Calculate result
  const result = calculateConstraint(values as number[], cage.operator);

  return result === cage.target;
}