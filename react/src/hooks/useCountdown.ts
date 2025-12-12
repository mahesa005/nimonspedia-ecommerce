import { useState, useEffect, useCallback } from 'react';

interface UseCountdownProps {
  targetDate: string | Date;
  serverOffset?: number;
  onEnd?: () => void;
  interval?: number;
}

export const useCountdown = ({targetDate, serverOffset = 0, onEnd, interval = 1000}: UseCountdownProps) => {

  const calculateTimeLeft = useCallback(() => {
    const now = Date.now() + serverOffset;
    const end = new Date(targetDate).getTime();
    const distance = end - now;
    return distance > 0 ? distance : 0;
  }, [targetDate, serverOffset]);

  const [timeLeft, setTimeLeft] = useState<number>(calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);

      if (newTime <= 0) {
        clearInterval(timer);
        if (onEnd) onEnd();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, interval, onEnd]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return { timeLeft, days, hours, minutes, seconds, isExpired: timeLeft <= 0 };
};