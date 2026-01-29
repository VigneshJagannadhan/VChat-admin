/**
 * Error Boundary Component
 * Catches and displays React component errors gracefully
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Error Boundary caught an error:', error, errorInfo);

        // TODO: Log error to monitoring service (e.g., Sentry)
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-100">
                    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-red-600 mb-4">
                                Something went wrong
                            </h2>
                            <p className="text-gray-600 mb-4">
                                We're sorry for the inconvenience. An unexpected error occurred.
                            </p>
                            {this.state.error && (
                                <details className="text-left mb-4">
                                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                        Error details
                                    </summary>
                                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                                        {this.state.error.message}
                                    </pre>
                                </details>
                            )}
                            <button
                                onClick={this.handleReset}
                                className="w-full py-2 px-4 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
