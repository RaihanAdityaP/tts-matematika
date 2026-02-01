import { DifficultyLevel } from '../types';

export interface LevelConfig {
  name: string;
  gridSize: number;
  numberRange: {
    min: number;
    max: number;
  };
  operators: string[];
  timeBonus: number; // Bonus points per second remaining
  baseScore: number;
  allowDecimals: boolean;
}

export const LEVEL_CONFIGS: Record<DifficultyLevel, LevelConfig> = {
  easy: {
    name: 'Mudah',
    gridSize: 5,
    numberRange: { min: 1, max: 10 },
    operators: ['+', '-'],
    timeBonus: 2,
    baseScore: 100,
    allowDecimals: false,
  },
  medium: {
    name: 'Sedang',
    gridSize: 6,
    numberRange: { min: 1, max: 50 },
    operators: ['+', '-', '*'],
    timeBonus: 5,
    baseScore: 200,
    allowDecimals: false,
  },
  hard: {
    name: 'Sulit',
    gridSize: 7,
    numberRange: { min: 1, max: 100 },
    operators: ['+', '-', '*', '/'],
    timeBonus: 10,
    baseScore: 500,
    allowDecimals: true,
  },
};

export const HINT_COSTS = {
  reveal_cell: 50,
  highlight_wrong: 30,
  show_operation: 20,
};

export const TIME_LIMITS = {
  easy: 300, // 5 minutes
  medium: 600, // 10 minutes
  hard: 900, // 15 minutes
};