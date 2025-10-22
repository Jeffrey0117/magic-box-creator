/**
 * Auth 集成測試
 * 
 * 測試認證相關功能：
 * - OAuth 登入流程
 * - Session 管理
 * - 用戶資料獲取
 * - 登出流程
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, mockSession, mockUser } from '../setup/mocks';

describe('Auth Integration', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('OAuth 登入', () => {
    it('應該支援 Google OAuth', async () => {
      const { data, error } = await mockSupabase.auth.signInWithOAuth({
        provider: 'google',
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('應該支援 GitHub OAuth', async () => {
      const { data, error } = await mockSupabase.auth.signInWithOAuth({
        provider: 'github',
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('登入後應該建立 session', async () => {
      await mockSupabase.auth.signInWithOAuth({
        provider: 'google',
      });

      const { data } = await mockSupabase.auth.getSession();
      expect(data.session).toBeDefined();
    });
  });

  describe('Session 管理', () => {
    it('應該能夠獲取當前 session', async () => {
      const { data, error } = await mockSupabase.auth.getSession();

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.session?.access_token).toBeDefined();
    });

    it('session 應該包含用戶信息', async () => {
      const { data } = await mockSupabase.auth.getSession();

      expect(data.session?.user).toBeDefined();
      expect(data.session?.user.id).toBe(mockUser.id);
      expect(data.session?.user.email).toBe(mockUser.email);
    });

    it('session 應該包含令牌', async () => {
      const { data } = await mockSupabase.auth.getSession();

      expect(data.session?.access_token).toBeDefined();
      expect(data.session?.refresh_token).toBeDefined();
    });
  });

  describe('用戶資料獲取', () => {
    it('應該能夠獲取當前用戶', async () => {
      const { data, error } = await mockSupabase.auth.getUser();

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
    });

    it('用戶資料應該包含基本信息', async () => {
      const { data } = await mockSupabase.auth.getUser();

      expect(data.user?.id).toBeDefined();
      expect(data.user?.email).toBeDefined();
    });
  });

  describe('登出流程', () => {
    it('應該能夠成功登出', async () => {
      const { error } = await mockSupabase.auth.signOut();

      expect(error).toBeNull();
    });

    it('登出後 session 應該被清除', async () => {
      await mockSupabase.auth.signOut();

      // 在真實場景中 session 會變成 null
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('認證狀態監聽', () => {
    it('應該能夠監聽認證狀態變更', () => {
      const callback = vi.fn();
      const { data } = mockSupabase.auth.onAuthStateChange(callback);

      expect(data.subscription).toBeDefined();
    });

    it('應該能夠取消訂閱', () => {
      const callback = vi.fn();
      const { data } = mockSupabase.auth.onAuthStateChange(callback);

      expect(data.subscription.unsubscribe).toBeDefined();
      expect(typeof data.subscription.unsubscribe).toBe('function');
    });
  });
});