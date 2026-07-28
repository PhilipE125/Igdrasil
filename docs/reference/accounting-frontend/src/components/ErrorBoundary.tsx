import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
            <p className="text-sm font-medium text-foreground">Something went wrong</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {this.state.error.message}
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              className="text-xs underline text-muted-foreground hover:text-foreground"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
