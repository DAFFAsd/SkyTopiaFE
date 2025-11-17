// Error Boundary Component untuk Parent Dashboard
'use client';

import { Component, ReactNode } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md rounded-lg bg-white p-8 shadow-sm text-center">
                        <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-brand-purple mb-2">
                            Terjadi Kesalahan
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman.
                        </p>
                        {this.state.error && (
                            <p className="text-xs text-gray-500 mb-4 font-mono bg-gray-100 p-2 rounded">
                                {this.state.error.message}
                            </p>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-md bg-brand-purple px-6 py-2 text-white hover:bg-brand-purple/90 transition-colors"
                        >
                            Muat Ulang Halaman
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
