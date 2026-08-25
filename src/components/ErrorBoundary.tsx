import React, { Component, type ReactNode } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Application-level Error Boundary.
 * Catches render errors in child components (e.g. WebGL crashes, chart failures)
 * and shows a styled recovery UI instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-[60vh] p-6">
                    <div
                        className="max-w-md w-full text-center p-10 rounded-3xl"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--glass-border)',
                        }}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle
                                size={32}
                                className="text-amber-500"
                            />
                        </div>
                        <h3
                            className="text-xl font-bold mb-2"
                            style={{ color: 'var(--text-main)' }}
                        >
                            Something went wrong
                        </h3>
                        <p
                            className="text-sm mb-6 leading-relaxed"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {this.props.fallbackMessage ||
                                'A component encountered an error. Try again or reload the page.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="btn btn-primary btn-md gap-2"
                            >
                                <RefreshCcw size={14} />
                                Retry
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-secondary btn-md"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
