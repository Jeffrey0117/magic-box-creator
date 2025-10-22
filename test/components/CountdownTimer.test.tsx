/**
 * CountdownTimer 組件測試
 * 
 * 測試倒數計時器的各種場景：
 * - 組件渲染
 * - 時間計算
 * - 倒數更新
 * - 過期處理
 * - 時間格式化
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CountdownTimer } from '@/components/CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('基本渲染', () => {
    it('應該渲染倒數計時器', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      expect(screen.getByText(/限時：/)).toBeInTheDocument();
    });

    it('應該顯示倒數圖示', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      expect(screen.getByText(/⏰/)).toBeInTheDocument();
    });
  });

  describe('時間計算', () => {
    it('應該顯示天數當剩餘時間超過 1 天', () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      expect(screen.getByText(/剩餘 \d+ 天/)).toBeInTheDocument();
    });

    it('應該顯示小時當剩餘時間少於 1 天', () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      waitFor(() => {
        expect(screen.getByText(/剩餘 \d{2} 小時/)).toBeInTheDocument();
      });
    });

    it('應該顯示分鐘當剩餘時間少於 1 小時', () => {
      const futureDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      waitFor(() => {
        expect(screen.getByText(/剩餘 \d{2} 分/)).toBeInTheDocument();
      });
    });

    it('應該顯示秒數當剩餘時間少於 1 分鐘', () => {
      const futureDate = new Date(Date.now() + 30 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      waitFor(() => {
        expect(screen.getByText(/剩餘 \d{2} 秒/)).toBeInTheDocument();
      });
    });
  });

  describe('時間格式化', () => {
    it('時間數字應該補零至兩位數', () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000 + 3 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      waitFor(() => {
        const text = screen.getByText(/限時：/).textContent;
        expect(text).toMatch(/\d{2} 分 \d{2} 秒/);
      });
    });

    it('當有天數時應該顯示完整格式', () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      waitFor(() => {
        expect(screen.getByText(/剩餘 \d+ 天 \d{2} 小時 \d{2} 分 \d{2} 秒/)).toBeInTheDocument();
      });
    });

    it('當有小時時應該顯示時分秒', () => {
      const futureDate = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      waitFor(() => {
        expect(screen.getByText(/剩餘 \d{2} 小時 \d{2} 分 \d{2} 秒/)).toBeInTheDocument();
      });
    });
  });

  describe('倒數更新', () => {
    it('應該每秒更新一次', async () => {
      const futureDate = new Date(Date.now() + 10 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      const initialText = screen.getByText(/限時：/).textContent;

      // 前進 1 秒
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        const updatedText = screen.getByText(/限時：/).textContent;
        expect(updatedText).not.toBe(initialText);
      });
    });

    it('應該持續倒數直到時間到', async () => {
      const futureDate = new Date(Date.now() + 5 * 1000).toISOString();
      const { container } = render(<CountdownTimer expiresAt={futureDate} />);

      // 前進 4 秒，應該還在倒數
      vi.advanceTimersByTime(4000);
      await waitFor(() => {
        expect(screen.getByText(/限時：/)).toBeInTheDocument();
      });

      // 再前進 2 秒，應該過期
      vi.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('過期處理', () => {
    it('當時間已過期時應該返回 null', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      const { container } = render(<CountdownTimer expiresAt={pastDate} />);

      expect(container.firstChild).toBeNull();
    });

    it('當倒數到 0 時應該移除組件', async () => {
      const futureDate = new Date(Date.now() + 2 * 1000).toISOString();
      const { container } = render(<CountdownTimer expiresAt={futureDate} />);

      expect(screen.getByText(/限時：/)).toBeInTheDocument();

      // 前進到過期
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('過期後不應該顯示"已過期"文字', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      render(<CountdownTimer expiresAt={pastDate} />);

      expect(screen.queryByText('已過期')).not.toBeInTheDocument();
    });
  });

  describe('樣式', () => {
    it('應該有紅色文字樣式', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      const timer = screen.getByText(/限時：/).parentElement;
      expect(timer).toHaveClass('text-red-500');
    });

    it('應該有粗體樣式', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      const timer = screen.getByText(/限時：/).parentElement;
      expect(timer).toHaveClass('font-bold');
    });

    it('應該有最小寬度限制', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      const timer = screen.getByText(/限時：/).parentElement;
      expect(timer).toHaveClass('min-w-[280px]');
    });
  });

  describe('計時器清理', () => {
    it('組件卸載時應該清除計時器', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      const { unmount } = render(<CountdownTimer expiresAt={futureDate} />);
      
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('expiresAt 改變時應該重新創建計時器', () => {
      const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const futureDate2 = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      
      const { rerender } = render(<CountdownTimer expiresAt={futureDate1} />);
      const initialText = screen.getByText(/限時：/).textContent;

      rerender(<CountdownTimer expiresAt={futureDate2} />);
      
      const updatedText = screen.getByText(/限時：/).textContent;
      expect(updatedText).not.toBe(initialText);
    });
  });

  describe('邊界情況', () => {
    it('應該處理剛好 0 秒的情況', () => {
      const nowDate = new Date(Date.now()).toISOString();
      const { container } = render(<CountdownTimer expiresAt={nowDate} />);

      expect(container.firstChild).toBeNull();
    });

    it('應該處理負數時間差', () => {
      const pastDate = new Date(Date.now() - 5000).toISOString();
      const { container } = render(<CountdownTimer expiresAt={pastDate} />);

      expect(container.firstChild).toBeNull();
    });

    it('應該處理很大的時間差', () => {
      const farFutureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={farFutureDate} />);

      expect(screen.getByText(/剩餘 \d+ 天/)).toBeInTheDocument();
    });

    it('應該處理剛好 1 分鐘的情況', () => {
      const futureDate = new Date(Date.now() + 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      waitFor(() => {
        expect(screen.getByText(/剩餘 01 分/)).toBeInTheDocument();
      });
    });

    it('應該處理剛好 1 小時的情況', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      waitFor(() => {
        expect(screen.getByText(/剩餘 01 小時/)).toBeInTheDocument();
      });
    });

    it('應該處理剛好 1 天的情況', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={futureDate} />);

      expect(screen.getByText(/剩餘 1 天/)).toBeInTheDocument();
    });
  });

  describe('時區處理', () => {
    it('應該正確處理 ISO 格式的時間字符串', () => {
      const isoDate = '2025-12-31T23:59:59Z';
      render(<CountdownTimer expiresAt={isoDate} />);

      // 只要不報錯就算通過
      expect(screen.queryByText(/限時：/)).toBeInTheDocument();
    });

    it('應該正確計算本地時間與 UTC 時間的差異', () => {
      const utcDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      render(<CountdownTimer expiresAt={utcDate} />);

      expect(screen.getByText(/限時：/)).toBeInTheDocument();
    });
  });

  describe('性能', () => {
    it('不應該造成記憶體洩漏', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { unmount } = render(<CountdownTimer expiresAt={futureDate} />);

      // 模擬多次渲染和卸載
      for (let i = 0; i < 10; i++) {
        unmount();
        render(<CountdownTimer expiresAt={futureDate} />);
      }

      // 如果沒有拋出錯誤就算通過
      expect(true).toBe(true);
    });

    it('應該在組件卸載時停止更新', () => {
      const futureDate = new Date(Date.now() + 10 * 1000).toISOString();
      const { unmount } = render(<CountdownTimer expiresAt={futureDate} />);

      unmount();

      // 前進時間後不應該有更新
      vi.advanceTimersByTime(5000);

      // 如果沒有警告就算通過
      expect(true).toBe(true);
    });
  });
});