export type Point = {
  x: number;
  y: number;
};

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameStatus = 'running' | 'gameOver' | 'won';

export type Config = {
  width: number;
  height: number;
  tickMs: number;
  initialSnake: Point[];
  initialDirection: Direction;
};

export type GameState = {
  config: Config;
  snake: Point[];
  direction: Direction;
  food: Point | null;
  score: number;
  status: GameStatus;
};

export const DEFAULT_CONFIG: Config = {
  width: 32,
  height: 32,
  tickMs: 150,
  initialSnake: [
    { x: 16, y: 16 },
    { x: 15, y: 16 },
    { x: 14, y: 16 }
  ],
  initialDirection: 'right'
};

const DELTAS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITES: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

const samePoint = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

const inBounds = (p: Point, config: Config): boolean =>
  p.x >= 0 && p.x < config.width && p.y >= 0 && p.y < config.height;

export const placeFood = (
  snake: Point[],
  config: Pick<Config, 'width' | 'height'>,
  rng: () => number = Math.random
): Point | null => {
  const occupied = new Set(snake.map((part) => `${part.x},${part.y}`));
  const freeCells: Point[] = [];

  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * freeCells.length);
  return freeCells[Math.min(index, freeCells.length - 1)];
};

export const createInitialState = (
  config: Config = DEFAULT_CONFIG,
  rng: () => number = Math.random
): GameState => {
  const snake = config.initialSnake.map((p) => ({ ...p }));

  return {
    config,
    snake,
    direction: config.initialDirection,
    food: placeFood(snake, config, rng),
    score: 0,
    status: 'running'
  };
};

export const setDirection = (state: GameState, nextDirection: Direction): GameState => {
  if (state.status !== 'running') {
    return state;
  }

  if (OPPOSITES[state.direction] === nextDirection) {
    return state;
  }

  if (state.direction === nextDirection) {
    return state;
  }

  return {
    ...state,
    direction: nextDirection
  };
};

export const step = (state: GameState, rng: () => number = Math.random): GameState => {
  if (state.status !== 'running') {
    return state;
  }

  const head = state.snake[0];
  const delta = DELTAS[state.direction];
  const nextHead = { x: head.x + delta.x, y: head.y + delta.y };

  if (!inBounds(nextHead, state.config)) {
    return {
      ...state,
      status: 'gameOver'
    };
  }

  const isEating = state.food !== null && samePoint(nextHead, state.food);
  const collisionBody = isEating ? state.snake : state.snake.slice(0, -1);

  if (collisionBody.some((part) => samePoint(part, nextHead))) {
    return {
      ...state,
      status: 'gameOver'
    };
  }

  const movedSnake = isEating
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)];

  if (isEating) {
    const nextFood = placeFood(movedSnake, state.config, rng);
    if (nextFood === null) {
      return {
        ...state,
        snake: movedSnake,
        score: state.score + 1,
        food: null,
        status: 'won'
      };
    }

    return {
      ...state,
      snake: movedSnake,
      score: state.score + 1,
      food: nextFood
    };
  }

  return {
    ...state,
    snake: movedSnake
  };
};

export const restart = (
  config: Config = DEFAULT_CONFIG,
  rng: () => number = Math.random
): GameState => createInitialState(config, rng);
