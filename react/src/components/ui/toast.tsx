import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-[#42b549]',
    error: 'bg-[#dc3545]',
    info: 'bg-[#007bff]'
  };

  return (
    <div className="fixed top-4 right-4 z-99999">
      <div className={`${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right-full duration-300`}>
        <span className="font-bold text-sm">{message}</span>
        <button onClick={onClose} className="opacity-80 hover:opacity-100 font-bold">×</button>
      </div>
    </div>
  );
}