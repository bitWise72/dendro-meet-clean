import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground text-center">
                    <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center">
                        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>

                        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-muted-foreground mb-6 text-sm">
                            The application encountered a critical error. This might be due to a network issue or a recent update.
                        </p>

                        <div className="bg-muted/50 rounded-lg p-4 mb-6 w-full text-left overflow-auto max-h-32">
                            <code className="text-xs text-red-400 font-mono break-all">
                                {this.state.error?.message || "Unknown error"}
                            </code>
                        </div>

                        <Button
                            onClick={this.handleReload}
                            className="w-full gap-2"
                            variant="default"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reload Application
                        </Button>

                        <p className="text-xs text-muted-foreground mt-4">
                            If this persists, please try clearing your browser cache.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
