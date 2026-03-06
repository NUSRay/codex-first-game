import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_CONFIG,
  Direction,
  GameState,
  createInitialState,
  restart,
  setDirection,
  step
} from '../features/snake/game';

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right'
};

type Speed = 'slow' | 'medium' | 'fast';

const SPEED_TO_TICK_MS: Record<Speed, number> = {
  slow: 220,
  medium: 150,
  fast: 90
};

const statusLabel = (status: GameState['status'], paused: boolean): string => {
  if (paused && status === 'running') {
    return 'Paused';
  }

  if (status === 'gameOver') {
    return 'Game Over';
  }

  if (status === 'won') {
    return 'You Win';
  }

  return 'Running';
};

export default function SnakePage() {
  const [state, setState] = useState<GameState>(() => createInitialState(DEFAULT_CONFIG));
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<Speed>('medium');

  useEffect(() => {
    if (state.status !== 'running' || paused) {
      return undefined;
    }

    const id = window.setInterval(() => {
      setState((previous) => step(previous));
    }, state.config.tickMs);

    return () => {
      window.clearInterval(id);
    };
  }, [state.status, state.config.tickMs, paused]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.key];
      if (!direction) {
        return;
      }

      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
      }

      setState((previous) => setDirection(previous, direction));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const snakeCells = useMemo(
    () => new Set(state.snake.map((part) => `${part.x},${part.y}`)),
    [state.snake]
  );
  const head = state.snake[0];
  const tail = state.snake[state.snake.length - 1];
  const shouldEnlargeTailPhoto = state.snake.length >= state.config.initialSnake.length * 2;

  const onDirectionClick = (direction: Direction) => {
    setState((previous) => setDirection(previous, direction));
  };

  const onRestart = () => {
    setState(restart(state.config));
    setPaused(false);
  };

  const onPauseToggle = () => {
    if (state.status === 'running') {
      setPaused((value) => !value);
    }
  };

  const onSpeedChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSpeed = event.target.value as Speed;
    setSpeed(nextSpeed);
    setState((previous) => ({
      ...previous,
      config: {
        ...previous.config,
        tickMs: SPEED_TO_TICK_MS[nextSpeed]
      }
    }));
  };

  return (
    <main className="page">
      <section className="snake-shell" style={{ ["--snake-photo-url" as any]: `url(${import.meta.env.BASE_URL}snake-head.jpg)` }}>
        <header className="snake-hud">
          <h1>Snake</h1>
          <p>Score: {state.score}</p>
          <p>Status: {statusLabel(state.status, paused)}</p>
          <label htmlFor="speed-select">Speed:</label>
          <select id="speed-select" value={speed} onChange={onSpeedChange}>
            <option value="slow">Slow</option>
            <option value="medium">Medium</option>
            <option value="fast">Fast</option>
          </select>
          <button type="button" onClick={onPauseToggle} disabled={state.status !== 'running'}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" onClick={onRestart}>
            Restart
          </button>
        </header>

        <div
          className="snake-board"
          style={{
            gridTemplateColumns: `repeat(${state.config.width}, 1fr)`,
            gridTemplateRows: `repeat(${state.config.height}, 1fr)`
          }}
          aria-label="Snake board"
        >
          {Array.from({ length: state.config.width * state.config.height }).map((_, index) => {
            const x = index % state.config.width;
            const y = Math.floor(index / state.config.width);
            const key = `${x},${y}`;
            const isHead = head.x === x && head.y === y;
            const isTail = tail.x === x && tail.y === y;
            const isBody = snakeCells.has(key);
            const isFood = state.food !== null && state.food.x === x && state.food.y === y;

            let className = 'cell';
            if (isFood) {
              className += ' food';
            }
            if (isBody) {
              className += isHead ? ' snake-head' : ' snake-body';
              if (isTail && !isHead) {
                className += shouldEnlargeTailPhoto ? ' snake-tail-photo snake-tail-photo-large' : ' snake-tail-photo';
              }
            }

            return <div key={key} className={className} />;
          })}
        </div>

        <div className="touch-controls" aria-label="Touch controls">
          <button type="button" onClick={() => onDirectionClick('up')}>
            Up
          </button>
          <div className="touch-row">
            <button type="button" onClick={() => onDirectionClick('left')}>
              Left
            </button>
            <button type="button" onClick={() => onDirectionClick('down')}>
              Down
            </button>
            <button type="button" onClick={() => onDirectionClick('right')}>
              Right
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}



