export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type OperatorType = '+' | '-' | '*' | '/';

// Cage is a group of cells that must satisfy a mathematical constraint
export interface Cage {
  id: string;
  cells: { row: number; col: number }[];
  target: number;
  operator: OperatorType;
}

// Grid cell with solution and user input
export interface GridCell {
  row: number;
  col: number;
  value: number | null; // User's input
  solution: number; // Correct answer
  cageId: string; // Which cage this cell belongs to
  isCorrect: boolean | null;
}

export interface GameState {
  grid: GridCell[][];
  cages: Cage[];
  gridSize: number;
  currentDifficulty: DifficultyLevel;
  score: number;
  hintsUsed: number;
  timeElapsed: number;
  isComplete: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: GameStats) => boolean;
}

export interface GameStats {
  gamesPlayed: number;
  gamesCompleted: number;
  totalScore: number;
  fastestTime: number;
  currentStreak: number;
  longestStreak: number;
  easyCompleted: number;
  mediumCompleted: number;
  hardCompleted: number;
  perfectGames: number;
  achievementsUnlocked: string[];
}

export interface HintType {
  type: 'reveal_cell' | 'highlight_wrong' | 'show_cage';
  cost: number;
  description: string;
}

export interface StorageData {
  stats: GameStats;
  achievements: Achievement[];
  settings: {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    darkMode: boolean;
  };
}