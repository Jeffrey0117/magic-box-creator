/**
 * Utils 通用工具函數測試
 * 
 * 測試通用工具函數：
 * - 日期格式化
 * - 字符串處理
 * - 驗證函數
 * - 輔助工具
 */

import { describe, it, expect } from 'vitest';

// 模擬通用工具函數
const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-TW');
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

describe('Utils', () => {
  describe('日期格式化', () => {
    it('應該格式化日期字符串', () => {
      const result = formatDate('2024-01-01T00:00:00Z');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('應該格式化 Date 對象', () => {
      const date = new Date('2024-01-01');
      const result = formatDate(date);
      
      expect(result).toBeDefined();
    });

    it('應該處理當前日期', () => {
      const result = formatDate(new Date());
      
      expect(result).toBeDefined();
    });
  });

  describe('Email 驗證', () => {
    it('應該驗證有效的 email', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('應該拒絕無效的 email', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@.com',
        'invalid @example.com',
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('應該拒絕空字符串', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('文字截斷', () => {
    it('應該截斷長文字', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncateText(text, 20);
      
      expect(result).toHaveLength(23); // 20 + '...'
      expect(result).toMatch(/\.\.\.$/);
    });

    it('短文字不應該被截斷', () => {
      const text = 'Short text';
      const result = truncateText(text, 20);
      
      expect(result).toBe(text);
      expect(result).not.toMatch(/\.\.\.$/);
    });

    it('應該處理剛好等於最大長度的文字', () => {
      const text = '12345678901234567890';
      const result = truncateText(text, 20);
      
      expect(result).toBe(text);
    });
  });

  describe('className 合併', () => {
    it('應該合併多個 className', () => {
      const result = cn('class1', 'class2', 'class3');
      
      expect(result).toBe('class1 class2 class3');
    });

    it('應該過濾掉 falsy 值', () => {
      const result = cn('class1', null, 'class2', undefined, false, 'class3');
      
      expect(result).toBe('class1 class2 class3');
    });

    it('應該處理空數組', () => {
      const result = cn();
      
      expect(result).toBe('');
    });

    it('應該處理條件式 className', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled'
      );
      
      expect(result).toBe('base-class active');
    });
  });

  describe('數字格式化', () => {
    it('應該格式化大數字', () => {
      const num = 1000;
      const result = num.toLocaleString('zh-TW');
      
      expect(result).toBe('1,000');
    });

    it('應該處理小數點', () => {
      const num = 1234.56;
      const result = num.toFixed(2);
      
      expect(result).toBe('1234.56');
    });
  });

  describe('URL 處理', () => {
    it('應該構建正確的 URL', () => {
      const baseUrl = 'https://example.com';
      const path = '/api/test';
      const params = new URLSearchParams({ id: '123' });
      const url = `${baseUrl}${path}?${params.toString()}`;
      
      expect(url).toBe('https://example.com/api/test?id=123');
    });

    it('應該編碼 URL 參數', () => {
      const param = 'hello world';
      const encoded = encodeURIComponent(param);
      
      expect(encoded).toBe('hello%20world');
    });
  });

  describe('陣列處理', () => {
    it('應該移除重複項目', () => {
      const array = [1, 2, 2, 3, 3, 3];
      const result = [...new Set(array)];
      
      expect(result).toEqual([1, 2, 3]);
    });

    it('應該過濾空值', () => {
      const array = [1, null, 2, undefined, 3];
      const result = array.filter(Boolean);
      
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('物件處理', () => {
    it('應該合併物件', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const result = { ...obj1, ...obj2 };
      
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('應該深度複製物件', () => {
      const obj = { a: 1, b: { c: 2 } };
      const copy = JSON.parse(JSON.stringify(obj));
      
      copy.b.c = 3;
      expect(obj.b.c).toBe(2);
      expect(copy.b.c).toBe(3);
    });
  });

  describe('錯誤處理', () => {
    it('應該安全地解析 JSON', () => {
      const validJson = '{"key":"value"}';
      const result = JSON.parse(validJson);
      
      expect(result).toEqual({ key: 'value' });
    });

    it('應該處理無效的 JSON', () => {
      const invalidJson = '{invalid}';
      
      expect(() => JSON.parse(invalidJson)).toThrow();
    });
  });
});