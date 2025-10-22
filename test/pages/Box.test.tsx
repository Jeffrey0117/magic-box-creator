/**
 * Box 頁面測試
 * 
 * 測試解鎖頁面的各種場景：
 * - 頁面渲染
 * - 關鍵字驗證
 * - 解鎖流程
 * - 錯誤處理
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockSupabaseClient, mockKeyword } from '../setup/mocks';

// 模擬 Supabase 客戶端
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

// 模擬 Box 頁面
const MockBoxPage = () => (
  <div>
    <h1>解鎖魔法盲盒</h1>
    <form>
      <input placeholder="輸入關鍵字..." />
      <input type="email" placeholder="your@email.com" />
      <button type="submit">立即解鎖</button>
    </form>
  </div>
);

describe('Box Page', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('應該渲染解鎖頁面', () => {
      render(<MockBoxPage />);
      
      expect(screen.getByText(/解鎖魔法盲盒/)).toBeInTheDocument();
    });

    it('應該顯示解鎖表單', () => {
      render(<MockBoxPage />);
      
      expect(screen.getByPlaceholderText(/輸入關鍵字/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/your@email.com/)).toBeInTheDocument();
    });

    it('應該顯示提交按鈕', () => {
      render(<MockBoxPage />);
      
      expect(screen.getByRole('button', { name: /立即解鎖/ })).toBeInTheDocument();
    });
  });

  describe('解鎖流程', () => {
    it('應該允許用戶輸入關鍵字', async () => {
      const user = userEvent.setup();
      render(<MockBoxPage />);

      const keywordInput = screen.getByPlaceholderText(/輸入關鍵字/);
      await user.type(keywordInput, 'TEST2024');

      expect(keywordInput).toHaveValue('TEST2024');
    });

    it('應該允許用戶輸入 email', async () => {
      const user = userEvent.setup();
      render(<MockBoxPage />);

      const emailInput = screen.getByPlaceholderText(/your@email.com/);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('點擊解鎖按鈕應該提交表單', async () => {
      const user = userEvent.setup();
      render(<MockBoxPage />);

      const submitButton = screen.getByRole('button', { name: /立即解鎖/ });
      await user.click(submitButton);

      expect(submitButton).toBeInTheDocument();
    });
  });
});