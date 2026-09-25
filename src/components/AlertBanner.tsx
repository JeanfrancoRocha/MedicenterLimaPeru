import React from 'react';
import { CircleX, CircleAlert, Info } from 'lucide-react';
import clsx from 'clsx';

interface AlertBannerProps {
  message: string | null;
  type?: 'error' | 'success' | 'info';
  onClear?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  message,
  type = 'error',
  onClear,
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={clsx(
        'flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all shadow-lg',
        type === 'error'
          ? 'bg-red-50 border-red-100 text-red-800'
          : type === 'success'
          ? 'bg-green-50 border-green-100 text-green-800'
          : 'bg-blue-50 border-blue-100 text-blue-800'
      )}
    >
      <div className="shrink-0">
        {type === 'error' ? (
          <CircleX size={24} className="text-red-500" />
        ) : type === 'info' ? (
          <Info size={24} className="text-blue-500" />
        ) : (
          <CircleAlert size={24} className="text-green-500" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-black text-sm uppercase tracking-widest">
          {type === 'error' ? 'Atención' : 'Info'}
        </p>
        <p className="text-sm font-bold opacity-90">{message}</p>
      </div>
      {onClear && (
        <button
          onClick={onClear}
          className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          aria-label="Cerrar aviso"
        >
          <CircleX size={20} className="opacity-40 hover:opacity-80" />
        </button>
      )}
    </div>
  );
};
