import { useEffect, useState, useRef } from 'react';

interface TimerProps {
  targetDate: string | Date;
  onEnd?: () => void;
  label?: string;
  serverOffset: number;
}

export default function AuctionTimer({ targetDate, onEnd, label, serverOffset }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const onEndCalled = useRef(false);

  useEffect(() => {
    onEndCalled.current = false;

    const calculateTimeLeft = () => {
      const now = Date.now() + serverOffset;
      const end = new Date(targetDate).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft(0);
        if (onEnd && !onEndCalled.current) {
          onEndCalled.current = true;
          onEnd();
        }
        return false;
      } else {
        setTimeLeft(distance);
        return true;
      }
    };

    if (!calculateTimeLeft()) return;

    const interval = setInterval(() => {
      const shouldContinue = calculateTimeLeft();
      if (!shouldContinue) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [targetDate, onEnd, serverOffset]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor(totalSeconds / 3600);

    if (totalSeconds < 60 && label?.includes("END")) {
        return (ms / 1000).toFixed(1) + "s";
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (timeLeft === null) return null;

  const isUrgent = timeLeft < 15000;

  return (
    <div className="inline-block">
      {label && <div className="text-xs text-[#666] font-bold uppercase tracking-wider mb-1">{label}</div>}
      <div className={`font-mono font-bold text-4xl tabular-nums tracking-tight ${
          isUrgent ? 'text-[#dc3545] animate-pulse' : 'text-[#333]'
      }`}>
        {timeLeft === 0 ? "00:00:00" : formatTime(timeLeft)}
      </div>
      
      {label?.includes("END") && timeLeft > 0 && timeLeft <= 15000 && (
          <div className="h-2 w-full bg-[#e9ecef] rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-[#dc3545] transition-all duration-100 ease-linear"
                style={{ width: `${(timeLeft / 15000) * 100}%` }}
              />
          </div>
      )}
    </div>
  );
}