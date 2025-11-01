"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-2xl w-full p-6 space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-red-600">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                The application encountered an unexpected error. Please try
                refreshing the page or contact support if the problem persists.
              </p>
            </div>

            {this.state.error && (
              <details className="bg-gray-100 p-4 rounded-lg">
                <summary className="cursor-pointer font-semibold text-gray-700">
                  Error details
                </summary>
                <div className="mt-4 space-y-2">
                  <div>
                    <strong className="text-gray-700">Error:</strong>
                    <pre className="mt-1 text-sm text-red-600 whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong className="text-gray-700">Stack trace:</strong>
                      <pre className="mt-1 text-xs text-gray-600 overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-4">
              <Button onClick={this.handleReset} variant="default">
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = "/dashboard"}
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
