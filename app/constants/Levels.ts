import { DifficultyLevel, OperatorType } from '../types';

interface LevelConfig {
  name: string;
  gridSize: number;
  baseScore: number;
  targetTime: number; // in seconds
  cageCount: number;
  maxCageSize: number;
  operators: OperatorType[];
  numberRange: {
    min: number;
    max: number;
  };
}

export const LEVEL_CONFIGS: Record<DifficultyLevel, LevelConfig> = {
  easy: {
    name: 'Mudah',
    gridSize: 4,
    baseScore: 100,
    targetTime: 300, // 5 minutes
    cageCount: 6,
    maxCageSize: 3,
    operators: ['+', '-'],
    numberRange: {
      min: 1,
      max: 4,
    },
  },
  medium: {
    name: 'Sedang',
    gridSize: 5,
    baseScore: 200,
    targetTime: 480, // 8 minutes
    cageCount: 10,
    maxCageSize: 4,
    operators: ['+', '-', '*'],
    numberRange: {
      min: 1,
      max: 5,
    },
  },
  hard: {
    name: 'Sulit',
    gridSize: 6,
    baseScore: 300,
    targetTime: 600, // 10 minutes
    cageCount: 15,
    maxCageSize: 5,
    operators: ['+', '-', '*', '/'],
    numberRange: {
      min: 1,
      max: 6,
    },
  },
};

export const HINT_COSTS = {
  reveal_cell: 20,
  highlight_wrong: 15,
  show_cage: 10,
};