import { Component, ReactNode } from 'react';

interface Props {
  /** Anything that, when changed, resets the boundary. Compared by reference (`!==`). */
  resetCondition?: unknown;
  error?: boolean;
  fallBackComponent: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  resetCondition?: unknown;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      resetCondition: props.resetCondition,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.resetCondition !== state.resetCondition)
      return {
        hasError: false,
        resetCondition: props.resetCondition,
      };
    return null;
  }

  render() {
    if (this.state.hasError) return this.props.fallBackComponent;
    return this.props.children;
  }
}