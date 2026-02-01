import { LEVEL_CONFIGS } from '../constants/Levels';
import { DifficultyLevel, GridCell, MathQuestion, OperatorType } from '../types';

interface QuestionTemplate {
  pattern: string;
  operator: OperatorType;
  solve: (a: number, b: number) => number;
  validate: (a: number, b: number, result: number, allowDecimals: boolean) => boolean;
}

const TEMPLATES: QuestionTemplate[] = [
  {
    pattern: 'a + x = c',
    operator: '+',
    solve: (a, c) => c - a,
    validate: (a, b, result, allowDecimals) => {
      return result > 0 && (allowDecimals || Number.isInteger(result));
    },
  },
  {
    pattern: 'x + b = c',
    operator: '+',
    solve: (b, c) => c - b,
    validate: (a, b, result, allowDecimals) => {
      return result > 0 && (allowDecimals || Number.isInteger(result));
    },
  },
  {
    pattern: 'a - x = c',
    operator: '-',
    solve: (a, c) => a - c,
    validate: (a, b, result, allowDecimals) => {
      return result > 0 && (allowDecimals || Number.isInteger(result));
    },
  },
  {
    pattern: 'x - b = c',
    operator: '-',
    solve: (b, c) => b + c,
    validate: (a, b, result, allowDecimals) => {
      return result > 0 && (allowDecimals || Number.isInteger(result));
    },
  },
  {
    pattern: 'a * x = c',
    operator: '*',
    solve: (a, c) => c / a,
    validate: (a, b, result, allowDecimals) => {
      return result > 0 && (allowDecimals || Number.isInteger(result));
    },
  },
  {
    pattern: 'x * b = c',
    operator: '*',
    solve: (b, c) => c / b,
    validate: (a, b, result, allowDecimals) => {
      return result > 0 && (allowDecimals || Number.isInteger(result));
    },
  },
  {
    pattern: 'a / x = c',
    operator: '/',
    solve: (a, c) => a / c,
    validate: (a, b, result, allowDecimals) => {
      return result > 0 && (allowDecimals || Number.isInteger(result));
    },
  },
  {
    pattern: 'x / b = c',
    operator: '/',
    solve: (b, c) => b * c,
    validate: (a, b, result, allowDecimals) => {
      return result > 0 && (allowDecimals || Number.isInteger(result));
    },
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSingleQuestion(
  difficulty: DifficultyLevel,
  fixedNumber?: number
): MathQuestion | null {
  const config = LEVEL_CONFIGS[difficulty];
  const availableTemplates = TEMPLATES.filter((t) =>
    config.operators.includes(t.operator)
  );

  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    attempts++;

    const template = availableTemplates[randomInt(0, availableTemplates.length - 1)];
    
    let a: number, b: number;

    if (fixedNumber !== undefined) {
      // Use fixed number and generate compatible pair
      if (Math.random() > 0.5) {
        a = fixedNumber;
        b = randomInt(config.numberRange.min, config.numberRange.max);
      } else {
        a = randomInt(config.numberRange.min, config.numberRange.max);
        b = fixedNumber;
      }
    } else {
      a = randomInt(config.numberRange.min, config.numberRange.max);
      b = randomInt(config.numberRange.min, config.numberRange.max);
    }

    // Calculate result based on pattern
    let result: number;
    let questionText: string;
    let numbers: number[];

    if (template.pattern.includes('a + x = c') || template.pattern.includes('a - x = c') || 
        template.pattern.includes('a * x = c') || template.pattern.includes('a / x = c')) {
      const c = randomInt(config.numberRange.min, config.numberRange.max * 2);
      result = template.solve(a, c);
      questionText = template.pattern.replace('a', a.toString()).replace('c', c.toString());
      numbers = [a, c, result];
    } else {
      const c = randomInt(config.numberRange.min, config.numberRange.max * 2);
      result = template.solve(b, c);
      questionText = template.pattern.replace('b', b.toString()).replace('c', c.toString());
      numbers = [b, c, result];
    }

    // Validate result
    if (template.validate(a, b, result, config.allowDecimals)) {
      return {
        id: `q_${Date.now()}_${Math.random()}`,
        question: questionText,
        answer: Math.round(result * 100) / 100, // Round to 2 decimals
        operators: [template.operator],
        numbers,
        difficulty,
        position: { row: 0, col: 0 }, // Will be set later
        direction: 'horizontal',
        length: 1,
      };
    }
  }

  return null;
}

export function generateCrosswordPuzzle(difficulty: DifficultyLevel): {
  grid: GridCell[][];
  questions: MathQuestion[];
} {
  const config = LEVEL_CONFIGS[difficulty];
  const size = config.gridSize;
  
  // Initialize empty grid
  const grid: GridCell[][] = Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({
      value: null,
      isCorrect: null,
      questionIds: [],
      isShared: false,
    }))
  );

  const questions: MathQuestion[] = [];
  const usedPositions = new Set<string>();

  // Generate horizontal questions
  for (let row = 0; row < size; row++) {
    const col = randomInt(0, size - 2);
    const question = generateSingleQuestion(difficulty);
    
    if (question) {
      question.id = `H${row}`;
      question.position = { row, col };
      question.direction = 'horizontal';
      questions.push(question);
      
      // Mark position as used
      grid[row][col].questionIds.push(question.id);
      usedPositions.add(`${row},${col}`);
    }
  }

  // Generate vertical questions using numbers from horizontal
  for (let col = 0; col < size; col++) {
    const row = randomInt(0, size - 2);
    
    // Try to use a number from horizontal question at this position
    let fixedNumber: number | undefined;
    const cellKey = `${row},${col}`;
    
    if (usedPositions.has(cellKey)) {
      const horizontalQ = questions.find(
        q => q.position.row === row && q.position.col === col && q.direction === 'horizontal'
      );
      if (horizontalQ) {
        fixedNumber = horizontalQ.numbers[randomInt(0, horizontalQ.numbers.length - 1)];
      }
    }

    const question = generateSingleQuestion(difficulty, fixedNumber);
    
    if (question) {
      question.id = `V${col}`;
      question.position = { row, col };
      question.direction = 'vertical';
      questions.push(question);
      
      if (grid[row][col].questionIds.length > 0) {
        grid[row][col].isShared = true;
      }
      grid[row][col].questionIds.push(question.id);
    }
  }

  return { grid, questions };
}

export function checkAnswer(
  answer: number,
  question: MathQuestion
): boolean {
  const tolerance = 0.01;
  return Math.abs(answer - question.answer) < tolerance;
}

export function getAvailableNumbers(): number[] {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
}