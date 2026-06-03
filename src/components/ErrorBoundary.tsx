import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="telegram-safe-shell flex min-h-screen items-center justify-center bg-transparent px-4 py-8">
        <section className="w-full max-w-xl border border-accent bg-card p-6">
          <p className="label-text text-accent">Ошибка интерфейса</p>
          <h1 className="section-title mt-3 text-ink">
            Экран не смог отрисоваться
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Обновите приложение. Если ошибка повторится, передайте разработчику
            текст ниже.
          </p>
          <pre className="mt-4 max-h-48 overflow-auto border border-line bg-mutedSurface p-3 font-mono text-xs text-muted">
            {this.state.error.message}
          </pre>
          <Button className="mt-5" onClick={() => window.location.reload()}>
            Обновить приложение
          </Button>
        </section>
      </main>
    );
  }
}
