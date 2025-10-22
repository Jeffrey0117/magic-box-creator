/**
 * 測試環境設定文件
 * 
 * 此文件用於配置 Vitest 測試環境，包括：
 * - 設定全局測試環境
 * - 配置 DOM 環境
 * - 引入必要的測試工具
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// 擴展 Vitest 的 expect 斷言，加入 @testing-library/jest-dom 的匹配器
expect.extend(matchers);

// 每個測試後自動清理 DOM
afterEach(() => {
  cleanup();
});

// 模擬 window.matchMedia (用於響應式測試)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模擬 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// 模擬 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// 設定全域環境變數
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';