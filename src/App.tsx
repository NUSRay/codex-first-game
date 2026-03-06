import SnakePage from './pages/SnakePage';

const BASE_URL = import.meta.env.BASE_URL;
const trimTrailingSlash = (value: string): string => value.replace(/\/$/, '');
const normalizePath = (value: string): string => value.replace(/\/+/g, '/').replace(/\/$/, '') || '/';

const appBase = trimTrailingSlash(BASE_URL);
const snakePath = normalizePath(`${appBase}/snake`);

function HomePage() {
  return (
    <main className="page">
      <section className="home-shell">
        <h1>Codex First Game</h1>
        <p>
          Open the Snake game at <a href={snakePath}>{snakePath}</a>.
        </p>
      </section>
    </main>
  );
}

export default function App() {
  const currentPath = normalizePath(window.location.pathname);

  if (currentPath === snakePath) {
    return <SnakePage />;
  }

  return <HomePage />;
}
