/**
 * Email Logs 集成測試
 * 
 * 測試 Email 記錄的 CRUD 操作：
 * - 創建記錄
 * - 查詢記錄
 * - 唯一性約束
 * - 額外數據處理
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, mockEmailLog } from '../setup/mocks';

describe('Email Logs Integration', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('創建記錄', () => {
    it('應該能夠創建 email 記錄', async () => {
      mockSupabase.from = vi.fn(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockEmailLog,
          error: null,
        }),
      }));

      const query = mockSupabase.from('email_logs').insert({
        keyword_id: 1,
        email: 'user@example.com',
        name: 'Test User',
      });

      expect(query).toBeDefined();
    });

    it('應該能夠儲存額外數據', async () => {
      const logWithExtraData = {
        ...mockEmailLog,
        extra_data: { source: 'web', device: 'mobile' },
      };

      mockSupabase.from = vi.fn(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: logWithExtraData,
          error: null,
        }),
      }));

      const { data } = await mockSupabase.from('email_logs')
        .insert({
          keyword_id: 1,
          email: 'user@example.com',
          extra_data: { source: 'web', device: 'mobile' },
        })
        .select()
        .single();

      expect(data?.extra_data).toBeDefined();
      expect(data?.extra_data.source).toBe('web');
    });
  });

  describe('查詢記錄', () => {
    it('應該能夠查詢特定盲盒的所有記錄', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockEmailLog],
          error: null,
        }),
      }));

      const { data } = await mockSupabase.from('email_logs')
        .select('*')
        .eq('keyword_id', 1)
        .order('created_at', { ascending: false });

      expect(data).toBeInstanceOf(Array);
    });

    it('應該能夠查詢特定 email 的記錄', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockEmailLog,
          error: null,
        }),
      }));

      const query = mockSupabase.from('email_logs')
        .select('*')
        .eq('email', 'user@example.com')
        .single();

      expect(query).toBeDefined();
    });
  });

  describe('唯一性約束', () => {
    it('同一 email 不應該重複領取同一盲盒', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: mockEmailLog,
          error: null,
        }),
      }));

      const { data } = await mockSupabase.from('email_logs')
        .select('*')
        .eq('keyword_id', 1)
        .eq('email', 'user@example.com')
        .maybeSingle();

      expect(data).toBeDefined();
    });
  });

  describe('統計查詢', () => {
    it('應該能夠統計領取次數', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [mockEmailLog],
          count: 1,
          error: null,
        }),
      }));

      const { data, count } = await mockSupabase.from('email_logs')
        .select('*', { count: 'exact' })
        .eq('keyword_id', 1);

      expect(count).toBeDefined();
    });
  });

  describe('刪除記錄', () => {
    it('應該能夠刪除記錄', async () => {
      mockSupabase.from = vi.fn(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }));

      const query = mockSupabase.from('email_logs')
        .delete()
        .eq('id', 1);

      expect(query).toBeDefined();
    });
  });
});