/**
 * TemplateSelector 組件測試
 * 
 * 測試模板選擇器的各種場景：
 * - 組件渲染
 * - 模板選擇
 * - 會員權限檢查
 * - 預覽功能
 * - 分類顯示
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateSelector } from '@/components/TemplateSelector';
import { createMockSupabaseClient, mockUserProfile, mockSession } from '../setup/mocks';

// 模擬模板註冊表
vi.mock('@/components/templates/registry', () => ({
  getTemplatesByCategory: vi.fn(() => ({
    '基礎模板': [
      {
        id: 'default',
        name: '預設模板',
        description: '簡潔的預設樣式',
        tier: 'free',
        category: '基礎模板',
      },
      {
        id: 'layout1',
        name: '版型一',
        description: '經典佈局',
        tier: 'free',
        category: '基礎模板',
      },
    ],
    '進階模板': [
      {
        id: 'layout8',
        name: '版型八',
        description: '進階專屬版型',
        tier: 'premium',
        category: '進階模板',
      },
    ],
  })),
}));

// 模擬 Supabase 客戶端
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

describe('TemplateSelector', () => {
  const mockOnSelect = vi.fn();
  const mockOnPreview = vi.fn();
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  const defaultProps = {
    currentTemplate: 'default',
    onSelect: mockOnSelect,
    onPreview: mockOnPreview,
  };

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();

    // 設定預設的免費會員
    mockSupabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { ...mockUserProfile, membership_tier: 'free' },
        error: null,
      }),
    }));

    vi.mocked(require('@/integrations/supabase/client').supabase).auth = mockSupabase.auth;
    vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本渲染', () => {
    it('應該渲染模板選擇器', () => {
      render(<TemplateSelector {...defaultProps} />);

      expect(screen.getByText('選擇模板')).toBeInTheDocument();
    });

    it('應該顯示當前選中的模板', async () => {
      render(<TemplateSelector {...defaultProps} currentTemplate="default" />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });

    it('應該顯示提示文字', () => {
      render(<TemplateSelector {...defaultProps} />);

      expect(screen.getByText(/選擇後會立即儲存並生效/)).toBeInTheDocument();
    });
  });

  describe('會員等級顯示', () => {
    it('應該顯示免費會員狀態', async () => {
      render(<TemplateSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/目前方案:.*免費會員/)).toBeInTheDocument();
      });
    });

    it('應該顯示進階會員狀態', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { ...mockUserProfile, membership_tier: 'premium' },
          error: null,
        }),
      }));

      vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;

      render(<TemplateSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/⭐ 進階會員/)).toBeInTheDocument();
      });
    });
  });

  describe('模板選擇', () => {
    it('應該調用 onSelect 當選擇免費模板時', async () => {
      const user = userEvent.setup();
      render(<TemplateSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      await user.click(select);

      // 選擇免費模板
      const option = await screen.findByText('版型一');
      await user.click(option);

      expect(mockOnSelect).toHaveBeenCalledWith('layout1');
    });

    it('免費會員選擇進階模板時應該顯示提示', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<TemplateSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      await user.click(select);

      // 嘗試選擇進階模板
      const premiumOption = await screen.findByText('版型八');
      await user.click(premiumOption);

      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('此模板為進階會員專屬')
      );
      expect(mockOnSelect).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('進階會員應該可以選擇進階模板', async () => {
      const user = userEvent.setup();
      
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { ...mockUserProfile, membership_tier: 'premium' },
          error: null,
        }),
      }));

      vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;

      render(<TemplateSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      await user.click(select);

      const premiumOption = await screen.findByText('版型八');
      await user.click(premiumOption);

      expect(mockOnSelect).toHaveBeenCalledWith('layout8');
    });
  });

  describe('預覽功能', () => {
    it('當有 packageShortCode 時應該顯示預覽按鈕', () => {
      const props = {
        ...defaultProps,
        packageShortCode: 'test123',
      };

      render(<TemplateSelector {...props} />);

      expect(screen.getByRole('button', { name: /預覽效果/ })).toBeInTheDocument();
    });

    it('當沒有 packageShortCode 時不應該顯示預覽按鈕', () => {
      render(<TemplateSelector {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /預覽效果/ })).not.toBeInTheDocument();
    });

    it('點擊預覽按鈕應該開啟新視窗', async () => {
      const user = userEvent.setup();
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      const props = {
        ...defaultProps,
        packageShortCode: 'test123',
      };

      render(<TemplateSelector {...props} />);

      const previewButton = screen.getByRole('button', { name: /預覽效果/ });
      await user.click(previewButton);

      expect(windowOpenSpy).toHaveBeenCalledWith('/test123', '_blank');

      windowOpenSpy.mockRestore();
    });
  });

  describe('模板分類', () => {
    it('應該按分類顯示模板', async () => {
      const user = userEvent.setup();
      render(<TemplateSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      await user.click(select);

      // 檢查分類標題
      await waitFor(() => {
        expect(screen.getByText('基礎模板')).toBeInTheDocument();
        expect(screen.getByText('進階模板')).toBeInTheDocument();
      });
    });

    it('每個模板應該顯示名稱和描述', async () => {
      const user = userEvent.setup();
      render(<TemplateSelector {...defaultProps} />);

      const select = screen.getByRole('combobox');
      await user.click(select);

      await waitFor(() => {
        expect(screen.getByText('預設模板')).toBeInTheDocument();
        expect(screen.getByText('簡潔的預設樣式')).toBeInTheDocument();
      });
    });
  });

  describe('進階模板標記', () => {
    it('進階模板應該顯示進階徽章', async () => {
      const user = userEvent.setup();
      render(<TemplateSelector {...defaultProps} />);

      const select = screen.getByRole('combobox');
      await user.click(select);

      await waitFor(() => {
        const layout8Container = screen.getByText('版型八').closest('div');
        expect(within(layout8Container!).getByText(/進階/)).toBeInTheDocument();
      });
    });

    it('免費會員看到的進階模板應該顯示鎖定圖示', async () => {
      const user = userEvent.setup();
      render(<TemplateSelector {...defaultProps} />);

      const select = screen.getByRole('combobox');
      await user.click(select);

      await waitFor(() => {
        const layout8Container = screen.getByText('版型八').closest('div');
        expect(within(layout8Container!).getByText(/🔒 進階/)).toBeInTheDocument();
      });
    });

    it('進階會員看到的進階模板應該顯示星星圖示', async () => {
      const user = userEvent.setup();

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { ...mockUserProfile, membership_tier: 'premium' },
          error: null,
        }),
      }));

      vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;

      render(<TemplateSelector {...defaultProps} />);

      const select = screen.getByRole('combobox');
      await user.click(select);

      await waitFor(() => {
        const layout8Container = screen.getByText('版型八').closest('div');
        expect(within(layout8Container!).getByText(/⭐ 進階/)).toBeInTheDocument();
      });
    });
  });

  describe('使用者資料獲取', () => {
    it('應該在掛載時獲取使用者資料', async () => {
      render(<TemplateSelector {...defaultProps} />);

      await waitFor(() => {
        expect(mockSupabase.auth.getSession).toHaveBeenCalled();
        expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
      });
    });

    it('當沒有 session 時應該優雅處理', async () => {
      mockSupabase.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      });

      vi.mocked(require('@/integrations/supabase/client').supabase).auth = mockSupabase.auth;

      render(<TemplateSelector {...defaultProps} />);

      await waitFor(() => {
        expect(mockSupabase.from).not.toHaveBeenCalled();
      });
    });

    it('當獲取使用者資料失敗時應該使用預設值', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }));

      vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;

      render(<TemplateSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/免費會員/)).toBeInTheDocument();
      });
    });
  });

  describe('可訪問性', () => {
    it('選擇器應該有正確的標籤', () => {
      render(<TemplateSelector {...defaultProps} />);

      expect(screen.getByText('選擇模板')).toBeInTheDocument();
    });

    it('預覽按鈕應該有圖示和文字', () => {
      const props = {
        ...defaultProps,
        packageShortCode: 'test123',
      };

      render(<TemplateSelector {...props} />);

      const previewButton = screen.getByRole('button', { name: /預覽效果/ });
      expect(previewButton).toBeInTheDocument();
    });

    it('進階模板選項應該在免費會員時被禁用', async () => {
      const user = userEvent.setup();
      render(<TemplateSelector {...defaultProps} />);

      const select = screen.getByRole('combobox');
      await user.click(select);

      await waitFor(() => {
        const premiumOption = screen.getByText('版型八').closest('[role="option"]');
        expect(premiumOption).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('樣式和佈局', () => {
    it('選擇器應該是全寬', () => {
      render(<TemplateSelector {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveClass('w-full');
    });

    it('預覽按鈕應該是全寬並有圖示間距', () => {
      const props = {
        ...defaultProps,
        packageShortCode: 'test123',
      };

      render(<TemplateSelector {...props} />);

      const previewButton = screen.getByRole('button', { name: /預覽效果/ });
      expect(previewButton).toHaveClass('w-full');
      expect(previewButton).toHaveClass('gap-2');
    });

    it('提示區塊應該有正確的背景樣式', () => {
      render(<TemplateSelector {...defaultProps} />);

      const hint = screen.getByText(/選擇後會立即儲存並生效/).parentElement;
      expect(hint).toHaveClass('bg-muted/30');
      expect(hint).toHaveClass('rounded-lg');
    });
  });
});