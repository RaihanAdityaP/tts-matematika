export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type OperatorType = '+' | '-' | '*' | '/';

export interface MathQuestion {
  id: string;
  question: string;
  answer: number;
  operators: OperatorType[];
  numbers: number[];
  difficulty: DifficultyLevel;
  position: {
    row: number;
    col: number;
  };
  direction: 'horizontal' | 'vertical';
  length: number;
}

export interface GridCell {
  value: number | null;
  isCorrect: boolean | null;
  questionIds: string[]; // Multiple questions can share a cell
  isShared: boolean; // True if cell is intersection of H and V
}

export interface GameState {
  grid: GridCell[][];
  questions: MathQuestion[];
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
  perfectGames: number; // Games without hints
  achievementsUnlocked: string[];
}

export interface HintType {
  type: 'reveal_cell' | 'highlight_wrong' | 'show_operation';
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