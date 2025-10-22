/**
 * 測試模擬數據文件
 * 
 * 此文件提供各種測試所需的模擬數據，包括：
 * - Supabase 客戶端模擬
 * - 用戶數據模擬
 * - 關鍵字/盲盒數據模擬
 * - Email 記錄模擬
 */

import { vi } from 'vitest';

// 模擬 Supabase 認證用戶
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
};

// 模擬用戶資料
export const mockUserProfile = {
  user_id: 'test-user-id',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  social_link: 'https://twitter.com/testuser',
  membership_tier: 'free' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// 模擬關鍵字/盲盒數據
export const mockKeyword = {
  id: 1,
  keyword: 'TEST2024',
  secret_content: '恭喜你解鎖了測試內容！',
  creator_id: 'test-user-id',
  quota: 100,
  current_count: 10,
  short_code: 'abc123',
  title: '測試盲盒',
  description: '這是一個測試用的盲盒',
  package_image_url: 'https://example.com/package.jpg',
  require_email: true,
  require_name: false,
  expiry_date: '2024-12-31T23:59:59Z',
  enable_waitlist: true,
  template_type: 'default',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// 模擬 Email 記錄
export const mockEmailLog = {
  id: 1,
  keyword_id: 1,
  email: 'user@example.com',
  name: 'Test User',
  extra_data: { source: 'web' },
  created_at: '2024-01-01T00:00:00Z',
};

// 模擬領取記錄表格數據
export const mockClaimRecords = [
  {
    id: 1,
    email: 'user1@example.com',
    name: 'User 1',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 2,
    email: 'user2@example.com',
    name: 'User 2',
    created_at: '2024-01-01T11:00:00Z',
  },
];

// 模擬 Supabase Session
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: mockUser,
};

// 創建模擬的 Supabase 客戶端
export const createMockSupabaseClient = () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  return mockSupabase;
};

// 模擬 React Router 的 useNavigate
export const mockNavigate = vi.fn();

// 模擬 React Router 的 useParams
export const mockUseParams = (params: Record<string, string> = {}) => {
  return vi.fn().mockReturnValue(params);
};

// 模擬 toast 通知
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

// 重置所有模擬
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
  mockToast.success.mockClear();
  mockToast.error.mockClear();
  mockToast.info.mockClear();
  mockToast.warning.mockClear();
};