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

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) {
        return `剩餘 ${days} 天 ${hours} 小時 ${minutes} 分 ${seconds} 秒`;
      } else if (hours > 0) {
        return `剩餘 ${hours} 小時 ${minutes} 分 ${seconds} 秒`;
      } else if (minutes > 0) {
        return `剩餘 ${minutes} 分 ${seconds} 秒`;
      } else {
        return `剩餘 ${seconds} 秒`;
      }
    };

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (isExpired) return null;

  return (
    <div className="text-red-500 font-bold flex items-center gap-2">
      ⏰ 限時：{timeLeft}後失效
    </div>
  );
}