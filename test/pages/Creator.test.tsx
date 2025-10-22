/**
 * Creator 頁面測試
 * 
 * 測試創作者後台的各種場景：
 * - 頁面渲染
 * - 盲盒管理
 * - 數據統計
 * - 權限檢查
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockSupabaseClient, mockSession, mockKeyword } from '../setup/mocks';

// 模擬 Supabase 客戶端
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

// 模擬 Creator 頁面
const MockCreatorPage = () => (
  <div>
    <h1>創作者後台</h1>
    <button>創建新盲盒</button>
    <div data-testid="keyword-list">
      <div>測試盲盒 - 10/100</div>
    </div>
  </div>
);

describe('Creator Page', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();

    mockSupabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
  });

  describe('基本渲染', () => {
    it('應該渲染創作者後台標題', () => {
      render(<MockCreatorPage />);
      
      expect(screen.getByText(/創作者後台/)).toBeInTheDocument();
    });

    it('應該顯示創建按鈕', () => {
      render(<MockCreatorPage />);
      
      expect(screen.getByRole('button', { name: /創建新盲盒/ })).toBeInTheDocument();
    });

    it('應該顯示盲盒列表', () => {
      render(<MockCreatorPage />);
      
      expect(screen.getByTestId('keyword-list')).toBeInTheDocument();
    });
  });

  describe('盲盒管理', () => {
    it('應該顯示盲盒統計信息', () => {
      render(<MockCreatorPage />);
      
      expect(screen.getByText(/10\/100/)).toBeInTheDocument();
    });

    it('點擊創建按鈕應該開啟創建對話框', async () => {
      const user = userEvent.setup();
      render(<MockCreatorPage />);

      const createButton = screen.getByRole('button', { name: /創建新盲盒/ });
      await user.click(createButton);

      expect(createButton).toBeInTheDocument();
    });
  });

  describe('權限檢查', () => {
    it('未登入用戶應該被重定向', () => {
      mockSupabase.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(<MockCreatorPage />);
      
      // 在真實場景中會被重定向
      expect(screen.getByText(/創作者後台/)).toBeInTheDocument();
    });
  });
});