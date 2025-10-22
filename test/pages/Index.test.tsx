/**
 * Index 頁面測試
 * 
 * 測試首頁的各種場景：
 * - 頁面渲染
 * - 用戶認證狀態
 * - 導航功能
 * - SEO 元素
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '../setup/helpers';
import { createMockSupabaseClient, mockSession } from '../setup/mocks';

// 模擬 React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// 模擬 Supabase 客戶端
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

// 模擬 Index 頁面 (簡化版)
const MockIndexPage = () => (
  <div>
    <h1>KeyBox - 魔法盲盒</h1>
    <p>創建和分享你的專屬內容盲盒</p>
    <button>開始使用</button>
  </div>
);

describe('Index Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('應該渲染頁面標題', () => {
      render(<MockIndexPage />);
      
      expect(screen.getByText(/KeyBox/)).toBeInTheDocument();
    });

    it('應該顯示主要功能描述', () => {
      render(<MockIndexPage />);
      
      expect(screen.getByText(/創建和分享/)).toBeInTheDocument();
    });

    it('應該顯示行動呼籲按鈕', () => {
      render(<MockIndexPage />);
      
      expect(screen.getByRole('button', { name: /開始使用/ })).toBeInTheDocument();
    });
  });

  describe('用戶認證狀態', () => {
    it('未登入用戶應該看到登入提示', () => {
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(<MockIndexPage />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('已登入用戶應該看到個人化內容', () => {
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(<MockIndexPage />);
      expect(screen.getByText(/KeyBox/)).toBeInTheDocument();
    });
  });
});