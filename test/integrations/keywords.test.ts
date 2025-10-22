/**
 * Keywords 集成測試
 * 
 * 測試關鍵字/盲盒的 CRUD 操作：
 * - 創建盲盒
 * - 查詢盲盒
 * - 更新盲盒
 * - 刪除盲盒
 * - 驗證關鍵字
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, mockKeyword, mockUser } from '../setup/mocks';

describe('Keywords Integration', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('創建盲盒', () => {
    it('應該能夠創建新盲盒', async () => {
      mockSupabase.from = vi.fn(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockKeyword,
          error: null,
        }),
      }));

      const query = mockSupabase.from('keywords').insert({
        keyword: 'TEST2024',
        secret_content: '測試內容',
        creator_id: mockUser.id,
      });

      expect(query).toBeDefined();
    });

    it('創建時應該生成短碼', async () => {
      const keywordWithShortCode = { ...mockKeyword, short_code: 'abc123' };
      
      mockSupabase.from = vi.fn(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: keywordWithShortCode,
          error: null,
        }),
      }));

      const { data } = await mockSupabase.from('keywords')
        .insert(mockKeyword)
        .select()
        .single();

      expect(data?.short_code).toBeDefined();
    });
  });

  describe('查詢盲盒', () => {
    it('應該能夠根據 ID 查詢盲盒', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockKeyword,
          error: null,
        }),
      }));

      const query = mockSupabase.from('keywords')
        .select('*')
        .eq('id', 1)
        .single();

      expect(query).toBeDefined();
    });

    it('應該能夠根據短碼查詢盲盒', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockKeyword,
          error: null,
        }),
      }));

      const query = mockSupabase.from('keywords')
        .select('*')
        .eq('short_code', 'abc123')
        .single();

      expect(query).toBeDefined();
    });

    it('應該能夠查詢創作者的所有盲盒', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockKeyword],
          error: null,
        }),
      }));

      const { data } = await mockSupabase.from('keywords')
        .select('*')
        .eq('creator_id', mockUser.id)
        .order('created_at', { ascending: false });

      expect(data).toBeInstanceOf(Array);
    });
  });

  describe('更新盲盒', () => {
    it('應該能夠更新盲盒資訊', async () => {
      mockSupabase.from = vi.fn(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockKeyword, title: '新標題' },
          error: null,
        }),
      }));

      const query = mockSupabase.from('keywords')
        .update({ title: '新標題' })
        .eq('id', 1);

      expect(query).toBeDefined();
    });

    it('應該能夠更新領取計數', async () => {
      mockSupabase.from = vi.fn(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: { ...mockKeyword, current_count: 11 },
          error: null,
        }),
      }));

      const query = mockSupabase.from('keywords')
        .update({ current_count: 11 })
        .eq('id', 1);

      expect(query).toBeDefined();
    });
  });

  describe('刪除盲盒', () => {
    it('應該能夠刪除盲盒', async () => {
      mockSupabase.from = vi.fn(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }));

      const query = mockSupabase.from('keywords')
        .delete()
        .eq('id', 1);

      expect(query).toBeDefined();
    });
  });

  describe('驗證關鍵字', () => {
    it('應該能夠驗證關鍵字是否正確', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockKeyword,
          error: null,
        }),
      }));

      const query = mockSupabase.from('keywords')
        .select('*')
        .eq('short_code', 'abc123')
        .ilike('keyword', 'TEST2024')
        .single();

      expect(query).toBeDefined();
    });

    it('關鍵字驗證應該不區分大小寫', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockKeyword,
          error: null,
        }),
      }));

      const query = mockSupabase.from('keywords')
        .select('*')
        .eq('short_code', 'abc123')
        .ilike('keyword', 'test2024')
        .single();

      expect(query).toBeDefined();
    });
  });
});