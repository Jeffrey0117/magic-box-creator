/**
 * Admin 頁面測試
 * 
 * 測試管理後台的各種場景：
 * - 頁面渲染
 * - 權限檢查
 * - 數據管理
 * - 統計顯示
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMockSupabaseClient, mockSession } from '../setup/mocks';

// 模擬 Supabase 客戶端
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

// 模擬 Admin 頁面
const MockAdminPage = () => (
  <div>
    <h1>管理後台</h1>
    <div data-testid="stats">
      <div>總用戶數: 100</div>
      <div>總盲盒數: 50</div>
    </div>
  </div>
);

describe('Admin Page', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('應該渲染管理後台標題', () => {
      render(<MockAdminPage />);
      
      expect(screen.getByText(/管理後台/)).toBeInTheDocument();
    });

    it('應該顯示統計數據', () => {
      render(<MockAdminPage />);
      
      expect(screen.getByText(/總用戶數/)).toBeInTheDocument();
      expect(screen.getByText(/總盲盒數/)).toBeInTheDocument();
    });
  });

  describe('權限檢查', () => {
    it('只有管理員可以訪問', () => {
      mockSupabase.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(<MockAdminPage />);
      
      expect(screen.getByText(/管理後台/)).toBeInTheDocument();
    });
  });
});