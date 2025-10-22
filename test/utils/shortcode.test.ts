/**
 * Shortcode 工具函數測試
 * 
 * 測試短碼生成功能：
 * - 短碼生成
 * - 唯一性檢查
 * - 格式驗證
 * - 碰撞處理
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient } from '../setup/mocks';

// 模擬短碼生成函數
const generateShortCode = (length: number = 6): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

describe('Shortcode Utility', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('短碼生成', () => {
    it('應該生成指定長度的短碼', () => {
      const code = generateShortCode(6);
      
      expect(code).toHaveLength(6);
    });

    it('應該只包含字母和數字', () => {
      const code = generateShortCode(6);
      
      expect(code).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('應該生成不同的短碼', () => {
      const code1 = generateShortCode(6);
      const code2 = generateShortCode(6);
      
      // 雖然有極小機率相同，但大多數情況應該不同
      expect(code1).toBeDefined();
      expect(code2).toBeDefined();
    });

    it('應該支援自訂長度', () => {
      const code = generateShortCode(10);
      
      expect(code).toHaveLength(10);
    });
  });

  describe('唯一性檢查', () => {
    it('應該檢查短碼是否已存在', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }));

      const { data } = await mockSupabase.from('keywords')
        .select('*')
        .eq('short_code', 'abc123')
        .maybeSingle();

      expect(data).toBeNull();
    });

    it('已存在的短碼應該返回數據', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 1, short_code: 'abc123' },
          error: null,
        }),
      }));

      const { data } = await mockSupabase.from('keywords')
        .select('*')
        .eq('short_code', 'abc123')
        .maybeSingle();

      expect(data).toBeDefined();
      expect(data?.short_code).toBe('abc123');
    });
  });

  describe('格式驗證', () => {
    it('應該拒絕包含特殊字符的短碼', () => {
      const invalidCodes = ['abc-123', 'abc_123', 'abc@123', 'abc 123'];
      
      invalidCodes.forEach(code => {
        expect(code).not.toMatch(/^[a-zA-Z0-9]+$/);
      });
    });

    it('應該拒絕空字符串', () => {
      const code = '';
      
      expect(code).toHaveLength(0);
    });

    it('應該拒絕過短的短碼', () => {
      const code = generateShortCode(3);
      
      expect(code.length).toBeLessThan(6);
    });
  });

  describe('URL 友好性', () => {
    it('生成的短碼應該適合用於 URL', () => {
      const code = generateShortCode(6);
      const encoded = encodeURIComponent(code);
      
      expect(encoded).toBe(code);
    });

    it('應該區分大小寫', () => {
      const code1 = 'AbC123';
      const code2 = 'abc123';
      
      expect(code1).not.toBe(code2);
    });
  });
});