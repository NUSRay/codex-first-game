import { describe, expect, it } from 'vitest';
import {
  Config,
  createInitialState,
  placeFood,
  restart,
  setDirection,
  step
} from './game';

const TEST_CONFIG: Config = {
  width: 6,
  height: 6,
  tickMs: 100,
  initialSnake: [
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 2 }
  ],
  initialDirection: 'right'
};

describe('snake game logic', () => {
  it('initializes with snake, direction, score 0, and food off snake', () => {
    const state = createInitialState(TEST_CONFIG, () => 0);

    expect(state.snake).toHaveLength(3);
    expect(state.direction).toBe('right');
    expect(state.score).toBe(0);
    expect(state.food).not.toBeNull();
    expect(state.snake.some((part) => part.x === state.food!.x && part.y === state.food!.y)).toBe(false);
  });

  it('moves head one cell each step and shifts body', () => {
    const initial = createInitialState(TEST_CONFIG, () => 0.5);
    const next = step(initial, () => 0.5);

    expect(next.snake[0]).toEqual({ x: 3, y: 2 });
    expect(next.snake[1]).toEqual({ x: 2, y: 2 });
    expect(next.snake[2]).toEqual({ x: 1, y: 2 });
  });

  it('rejects immediate opposite direction', () => {
    const initial = createInitialState(TEST_CONFIG, () => 0.5);
    const next = setDirection(initial, 'left');

    expect(next.direction).toBe('right');
  });

  it('grows and increments score when eating food', () => {
    const initial = createInitialState(TEST_CONFIG, () => 0.5);
    const withFoodAhead = { ...initial, food: { x: 3, y: 2 } };

    const next = step(withFoodAhead, () => 0.5);

    expect(next.score).toBe(1);
    expect(next.snake).toHaveLength(initial.snake.length + 1);
    expect(next.snake[0]).toEqual({ x: 3, y: 2 });
    expect(next.food).not.toBeNull();
  });

  it('ends game on wall collision', () => {
    const nearWall = {
      ...createInitialState(TEST_CONFIG, () => 0.5),
      snake: [
        { x: 5, y: 2 },
        { x: 4, y: 2 },
        { x: 3, y: 2 }
      ],
      direction: 'right' as const
    };

    const next = step(nearWall, () => 0.5);
    expect(next.status).toBe('gameOver');
  });

  it('ends game on self collision', () => {
    const state = {
      ...createInitialState(TEST_CONFIG, () => 0.5),
      snake: [
        { x: 2, y: 2 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 }
      ],
      direction: 'up' as const,
      food: { x: 5, y: 5 }
    };

    const next = step(state, () => 0.5);
    expect(next.status).toBe('gameOver');
  });

  it('placeFood never returns snake-occupied cells', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ];

    for (const random of [0, 0.2, 0.8, 0.999]) {
      const food = placeFood(snake, { width: 3, height: 3 }, () => random);
      expect(food).not.toBeNull();
      expect(snake.some((part) => part.x === food!.x && part.y === food!.y)).toBe(false);
    }
  });

  it('restart creates a fresh running state with score reset', () => {
    const progressed = {
      ...createInitialState(TEST_CONFIG, () => 0.5),
      score: 5,
      status: 'gameOver' as const
    };

    const restarted = restart(progressed.config, () => 0.1);

    expect(restarted.status).toBe('running');
    expect(restarted.score).toBe(0);
    expect(restarted.snake).toEqual(TEST_CONFIG.initialSnake);
  });
});
