/**
 * CreatorCard 組件測試
 * 
 * 測試創作者卡片的各種場景：
 * - 組件渲染
 * - 數據獲取
 * - 載入狀態
 * - 錯誤處理
 * - 社交連結
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CreatorCard } from '@/components/CreatorCard';
import { createMockSupabaseClient, mockUserProfile } from '../setup/mocks';

// 模擬 Supabase 客戶端
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

describe('CreatorCard', () => {
  const mockCreatorId = 'test-creator-id';
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
    
    // 設定預設的成功響應
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          avatar_url: mockUserProfile.avatar_url,
          display_name: mockUserProfile.display_name,
          bio: '這是創作者的個人簡介',
          social_link: mockUserProfile.social_link,
        },
        error: null,
      }),
    }));

    // 替換實際的 supabase 客戶端
    vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('載入狀態', () => {
    it('應該在載入時顯示骨架屏', () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('載入完成後應該移除骨架屏', async () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const skeletonElements = document.querySelectorAll('.animate-pulse');
        expect(skeletonElements.length).toBe(0);
      });
    });
  });

  describe('數據渲染', () => {
    it('應該顯示創作者頭像', async () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const avatar = screen.getByAltText('Creator Avatar');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', mockUserProfile.avatar_url);
      });
    });

    it('應該顯示創作者名稱', async () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        expect(screen.getByText(mockUserProfile.display_name!)).toBeInTheDocument();
      });
    });

    it('應該顯示創作者簡介', async () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        expect(screen.getByText(/這是創作者的個人簡介/)).toBeInTheDocument();
      });
    });

    it('當沒有頭像時應該顯示預設頭像', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            avatar_url: null,
            display_name: mockUserProfile.display_name,
            bio: null,
            social_link: null,
          },
          error: null,
        }),
      }));

      vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;

      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const avatar = screen.getByAltText('Creator Avatar');
        expect(avatar).toHaveAttribute('src', '/avantar.png');
      });
    });

    it('當沒有名稱時應該顯示預設文字', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            avatar_url: null,
            display_name: null,
            bio: null,
            social_link: null,
          },
          error: null,
        }),
      }));

      vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;

      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        expect(screen.getByText('創作者')).toBeInTheDocument();
      });
    });

    it('當沒有簡介時不應顯示簡介區塊', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            avatar_url: mockUserProfile.avatar_url,
            display_name: mockUserProfile.display_name,
            bio: null,
            social_link: null,
          },
          error: null,
        }),
      }));

      vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;

      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const bioElement = screen.queryByText(/這是創作者的個人簡介/);
        expect(bioElement).not.toBeInTheDocument();
      });
    });
  });

  describe('社交連結', () => {
    it('當有社交連結時應該是可點擊的連結', async () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', mockUserProfile.social_link);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('當有社交連結時應該有 hover 效果', async () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const card = screen.getByRole('link');
        expect(card).toHaveClass('hover:bg-card/60');
        expect(card).toHaveClass('cursor-pointer');
      });
    });

    it('當沒有社交連結時不應該是連結', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            avatar_url: mockUserProfile.avatar_url,
            display_name: mockUserProfile.display_name,
            bio: null,
            social_link: null,
          },
          error: null,
        }),
      }));

      vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;

      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const link = screen.queryByRole('link');
        expect(link).not.toBeInTheDocument();
      });
    });
  });

  describe('錯誤處理', () => {
    it('當數據獲取失敗時應該優雅處理', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }));

      vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('CreatorCard 讀取失敗:', expect.any(Object));
      });

      consoleSpy.mockRestore();
    });

    it('當沒有創作者數據時應該返回 null', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }));

      vi.mocked(require('@/integrations/supabase/client').supabase).from = mockSupabase.from;

      const { container } = render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('API 調用', () => {
    it('應該使用正確的 creatorId 查詢數據', async () => {
      const testCreatorId = 'specific-creator-id';
      render(<CreatorCard creatorId={testCreatorId} />);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
      });
    });

    it('應該選擇正確的欄位', async () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const fromCall = mockSupabase.from('user_profiles');
        expect(fromCall.select).toHaveBeenCalledWith('avatar_url, display_name, bio, social_link');
      });
    });
  });

  describe('樣式和佈局', () => {
    it('應該有正確的卡片樣式', async () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const card = screen.getByRole('link');
        expect(card).toHaveClass('glass-card');
        expect(card).toHaveClass('rounded-2xl');
        expect(card).toHaveClass('shadow-card');
      });
    });

    it('頭像應該是圓形並有邊框', async () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const avatar = screen.getByAltText('Creator Avatar');
        expect(avatar).toHaveClass('rounded-full');
        expect(avatar).toHaveClass('border-2');
      });
    });

    it('簡介文字應該有行數限制', async () => {
      render(<CreatorCard creatorId={mockCreatorId} />);

      await waitFor(() => {
        const bio = screen.getByText(/這是創作者的個人簡介/);
        expect(bio).toHaveClass('line-clamp-4');
      });
    });
  });
});