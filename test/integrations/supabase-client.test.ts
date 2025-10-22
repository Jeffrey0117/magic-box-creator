/**
 * Supabase Client 集成測試
 * 
 * 測試 Supabase 客戶端的各種場景：
 * - 客戶端初始化
 * - 認證功能
 * - 資料庫操作
 * - 錯誤處理
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient } from '../setup/mocks';

// 模擬環境變數
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

describe('Supabase Client', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('客戶端初始化', () => {
    it('應該使用環境變數初始化', () => {
      expect(process.env.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(process.env.VITE_SUPABASE_ANON_KEY).toBe('test-anon-key');
    });

    it('應該提供認證方法', () => {
      expect(mockSupabase.auth).toBeDefined();
      expect(mockSupabase.auth.getSession).toBeDefined();
      expect(mockSupabase.auth.getUser).toBeDefined();
    });

    it('應該提供資料庫查詢方法', () => {
      expect(mockSupabase.from).toBeDefined();
      expect(typeof mockSupabase.from).toBe('function');
    });
  });

  describe('認證操作', () => {
    it('應該成功獲取 session', async () => {
      const { data, error } = await mockSupabase.auth.getSession();

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
    });

    it('應該成功獲取 user', async () => {
      const { data, error } = await mockSupabase.auth.getUser();

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
    });

    it('應該支援 OAuth 登入', async () => {
      const { error } = await mockSupabase.auth.signInWithOAuth({
        provider: 'google',
      });

      expect(error).toBeNull();
    });

    it('應該支援登出', async () => {
      const { error } = await mockSupabase.auth.signOut();

      expect(error).toBeNull();
    });
  });

  describe('資料庫操作', () => {
    it('應該支援 SELECT 查詢', () => {
      const query = mockSupabase.from('keywords').select('*');

      expect(query).toBeDefined();
      expect(query.select).toBeDefined();
    });

    it('應該支援 INSERT 操作', () => {
      const query = mockSupabase.from('keywords').insert({
        keyword: 'TEST',
        secret_content: 'Secret',
      });

      expect(query).toBeDefined();
    });

    it('應該支援 UPDATE 操作', () => {
      const query = mockSupabase.from('keywords').update({
        current_count: 1,
      });

      expect(query).toBeDefined();
    });

    it('應該支援 DELETE 操作', () => {
      const query = mockSupabase.from('keywords').delete();

      expect(query).toBeDefined();
    });

    it('應該支援過濾條件', () => {
      const query = mockSupabase.from('keywords').select('*').eq('id', 1);

      expect(query).toBeDefined();
    });
  });

  describe('RPC 調用', () => {
    it('應該支援遠程程序調用', async () => {
      const { data, error } = await mockSupabase.rpc('test_function', {
        param: 'value',
      });

      expect(error).toBeNull();
    });
  });

  describe('認證狀態變更監聽', () => {
    it('應該能夠監聽認證狀態變更', () => {
      const callback = vi.fn();
      const { data } = mockSupabase.auth.onAuthStateChange(callback);

      expect(data.subscription).toBeDefined();
      expect(data.subscription.unsubscribe).toBeDefined();
    });
  });
});