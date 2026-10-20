import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error no manejado:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0C0A09] text-brand-cream flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-brand-surface border border-brand-border rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 text-brand-red flex items-center justify-center border border-brand-red/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-black text-brand-cream tracking-wide">
              ¡Ups! Algo inesperado ocurrió
            </h2>
            <p className="text-xs text-zinc-400">
              Hemos detectado un problema al cargar esta vista. No te preocupes, tus pedidos y datos siguen a salvo.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-zinc-500 bg-black/40 p-2.5 rounded-xl overflow-x-auto text-left font-mono">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-amber text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recargar Menú</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
