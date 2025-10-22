/**
 * 測試輔助函數文件
 * 
 * 此文件提供常用的測試輔助函數，包括：
 * - 渲染組件的輔助函數
 * - 等待異步操作的工具
 * - 常用的測試工具函數
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// 創建測試用的 QueryClient
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// 自定義渲染函數，包含所有必要的 Provider
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialRoute = '/', queryClient = createTestQueryClient(), ...renderOptions } = options;

  // 設定初始路由
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute);
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </BrowserRouter>
    );
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

// 等待異步操作完成
export const waitForAsync = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

// 模擬延遲
export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// 模擬文件上傳
export const createMockFile = (
  name: string = 'test.png',
  size: number = 1024,
  type: string = 'image/png'
): File => {
  const blob = new Blob(['test'], { type });
  return new File([blob], name, { type });
};

// 模擬拖放事件
export const createMockDragEvent = (files: File[]) => {
  return {
    dataTransfer: {
      files,
      items: files.map((file) => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file,
      })),
      types: ['Files'],
    },
  };
};

// 模擬剪貼簿事件
export const createMockClipboardEvent = (text: string) => {
  return {
    clipboardData: {
      getData: () => text,
    },
  };
};

// 模擬表單提交
export const submitForm = (form: HTMLFormElement) => {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(submitEvent);
};

// 模擬輸入變更
export const changeInput = (input: HTMLInputElement, value: string) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;
  
  nativeInputValueSetter?.call(input, value);
  
  const event = new Event('input', { bubbles: true });
  input.dispatchEvent(event);
};

// 模擬選擇變更
export const changeSelect = (select: HTMLSelectElement, value: string) => {
  const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype,
    'value'
  )?.set;
  
  nativeSelectValueSetter?.call(select, value);
  
  const event = new Event('change', { bubbles: true });
  select.dispatchEvent(event);
};

// 等待元素出現
export const waitForElement = async (
  callback: () => HTMLElement | null,
  timeout: number = 3000
): Promise<HTMLElement> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = callback();
    if (element) {
      return element;
    }
    await delay(50);
  }
  
  throw new Error('Element not found within timeout');
};

// 模擬 localStorage
export const mockLocalStorage = () => {
  const storage: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
  };
};

// 模擬 sessionStorage
export const mockSessionStorage = mockLocalStorage;

// 模擬 fetch 響應
export const createMockFetchResponse = (data: any, ok: boolean = true, status: number = 200) => {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    headers: new Headers(),
  } as Response;
};

// 測試 ID 生成器
export const generateTestId = (prefix: string, id?: string | number) => {
  return id ? `${prefix}-${id}` : prefix;
};

// 模擬滾動
export const mockScroll = (element: HTMLElement, scrollTop: number) => {
  Object.defineProperty(element, 'scrollTop', {
    writable: true,
    value: scrollTop,
  });
  
  element.dispatchEvent(new Event('scroll'));
};

// 清理測試環境
export const cleanupTestEnvironment = () => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
};