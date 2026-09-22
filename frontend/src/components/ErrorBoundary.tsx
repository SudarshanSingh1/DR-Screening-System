import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", color: "red", background: "#fee", fontFamily: "monospace", position: "absolute", inset: 0, zIndex: 999999 }}>
          <h1>React Error Boundary caught an error</h1>
          <p><b>Message:</b> {this.state.error?.message}</p>
          <p><b>Stack:</b><br/>{this.state.error?.stack?.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
