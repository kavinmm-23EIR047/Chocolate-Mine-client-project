import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full flex flex-col items-center justify-center p-6 text-center bg-card rounded-3xl border-2 border-border/30 my-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-lg font-black text-heading uppercase tracking-widest mb-2">
            Something went wrong
          </h3>
          <p className="text-xs text-muted font-medium max-w-md mb-6 leading-relaxed">
            {this.props.fallbackMessage || 'An unexpected error occurred in this section. Please try refreshing.'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-button-text font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            <RotateCcw size={14} /> Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
