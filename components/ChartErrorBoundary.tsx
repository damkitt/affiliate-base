"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { HiExclamationTriangle } from "react-icons/hi2";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

/**
 * Specialized Error Boundary for Analytics Charts.
 * Prevents Recharts/D3 crashes from taking down the entire dashboard.
 */
export class ChartErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[ChartErrorBoundary] Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-[var(--bg-secondary)] border border-dashed border-[var(--border)] rounded-2xl min-h-[200px]">
                    <HiExclamationTriangle className="w-8 h-8 text-[var(--accent-solid)] mb-3 opacity-50" />
                    <p className="text-sm font-medium text-[var(--text-secondary)] text-center">
                        Failed to load chart data
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-4 text-xs font-semibold text-[var(--accent-solid)] hover:underline"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
