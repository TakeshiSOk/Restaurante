import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { activeNotification, setNotification } = useAppStore();

  if (!activeNotification) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-zinc-900/95 text-emerald-200',
    error: 'border-red-500/40 bg-zinc-900/95 text-red-200',
    warning: 'border-amber-500/40 bg-zinc-900/95 text-amber-200',
    info: 'border-sky-500/40 bg-zinc-900/95 text-sky-200',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-short">
      <div
        className={`flex items-center justify-between p-4 rounded-xl border shadow-2xl backdrop-blur-md ${borders[activeNotification.type]}`}
      >
        <div className="flex items-center gap-3">
          {icons[activeNotification.type]}
          <p className="text-sm font-medium">{activeNotification.message}</p>
        </div>
        <button
          onClick={() => setNotification(null)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
