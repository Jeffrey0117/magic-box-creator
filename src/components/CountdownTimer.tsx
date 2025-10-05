import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  expiresAt: string;
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        return '已過期';
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `剩餘 ${days} 天 ${hours} 小時 ${minutes} 分鐘`;
      } else if (hours > 0) {
        return `剩餘 ${hours} 小時 ${minutes} 分鐘`;
      } else {
        return `剩餘 ${minutes} 分鐘`;
      }
    };

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (isExpired) return null;

  return (
    <div className="text-red-500 font-bold animate-pulse flex items-center gap-2">
      ⏰ 限時：{timeLeft}後失效
    </div>
  );
}