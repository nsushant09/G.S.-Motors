import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bone px-6 text-center">
          <p className="mb-4 font-mono text-xs tracking-[0.2em] text-moss">SOMETHING WENT WRONG</p>
          <h1 className="mb-4 font-display text-3xl tracking-tight text-forest md:text-5xl">
            This page hit a snag.
          </h1>
          <p className="mb-8 max-w-md text-slate">
            Refresh the page, or head back to the homepage and try again.
          </p>
          <a href="/" className="rounded-full bg-forest px-6 py-3 font-medium text-cream">
            Back to homepage
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
