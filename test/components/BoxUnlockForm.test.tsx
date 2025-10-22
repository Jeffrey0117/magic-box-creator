/**
 * BoxUnlockForm 組件測試
 * 
 * 測試解鎖表單的各種場景：
 * - 表單渲染
 * - 用戶輸入處理
 * - 表單提交
 * - 必填欄位驗證
 * - 載入狀態
 * - 創作者預覽模式
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoxUnlockForm } from '@/components/BoxUnlockForm';

describe('BoxUnlockForm', () => {
  const mockSetKeyword = vi.fn();
  const mockSetEmail = vi.fn();
  const mockSetExtraData = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    boxData: {
      required_fields: null,
    },
    keyword: '',
    setKeyword: mockSetKeyword,
    email: '',
    setEmail: mockSetEmail,
    extraData: { nickname: '' },
    setExtraData: mockSetExtraData,
    onSubmit: mockOnSubmit,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('應該渲染所有必要的表單欄位', () => {
      render(<BoxUnlockForm {...defaultProps} />);

      expect(screen.getByLabelText('關鍵字')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /立即解鎖/i })).toBeInTheDocument();
    });

    it('應該顯示提示文字', () => {
      render(<BoxUnlockForm {...defaultProps} />);

      expect(screen.getByText(/請向創作者索取關鍵字/i)).toBeInTheDocument();
      expect(screen.getByText(/僅創作者可見/i)).toBeInTheDocument();
    });

    it('當需要 nickname 時應該顯示暱稱欄位', () => {
      const props = {
        ...defaultProps,
        boxData: {
          required_fields: { nickname: true },
        },
      };

      render(<BoxUnlockForm {...props} />);

      expect(screen.getByLabelText(/稱呼.*暱稱/i)).toBeInTheDocument();
    });
  });

  describe('用戶輸入', () => {
    it('應該處理關鍵字輸入', async () => {
      const user = userEvent.setup();
      render(<BoxUnlockForm {...defaultProps} />);

      const keywordInput = screen.getByLabelText('關鍵字');
      await user.type(keywordInput, 'TEST2024');

      expect(mockSetKeyword).toHaveBeenCalledWith('TEST2024');
    });

    it('應該處理 email 輸入', async () => {
      const user = userEvent.setup();
      render(<BoxUnlockForm {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'test@example.com');

      expect(mockSetEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('應該處理暱稱輸入', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        boxData: {
          required_fields: { nickname: true },
        },
      };

      render(<BoxUnlockForm {...props} />);

      const nicknameInput = screen.getByLabelText(/稱呼.*暱稱/i);
      await user.type(nicknameInput, 'TestUser');

      expect(mockSetExtraData).toHaveBeenCalledWith({ nickname: 'TestUser' });
    });
  });

  describe('表單提交', () => {
    it('應該在提交時調用 onSubmit', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        keyword: 'TEST2024',
        email: 'test@example.com',
      };

      render(<BoxUnlockForm {...props} />);

      const submitButton = screen.getByRole('button', { name: /立即解鎖/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('應該阻止空表單提交', () => {
      render(<BoxUnlockForm {...defaultProps} />);

      const keywordInput = screen.getByLabelText('關鍵字');
      const emailInput = screen.getByLabelText('Email');

      expect(keywordInput).toBeRequired();
      expect(emailInput).toBeRequired();
    });
  });

  describe('載入狀態', () => {
    it('應該在載入時禁用提交按鈕', () => {
      const props = {
        ...defaultProps,
        loading: true,
      };

      render(<BoxUnlockForm {...props} />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
    });

    it('應該在載入時顯示載入文字', () => {
      const props = {
        ...defaultProps,
        loading: true,
      };

      render(<BoxUnlockForm {...props} />);

      expect(screen.getByText('解鎖中...')).toBeInTheDocument();
    });

    it('應該在載入時顯示旋轉動畫', () => {
      const props = {
        ...defaultProps,
        loading: true,
      };

      render(<BoxUnlockForm {...props} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('創作者預覽模式', () => {
    it('應該在創作者預覽模式下禁用提交', () => {
      const props = {
        ...defaultProps,
        isCreatorPreview: true,
      };

      render(<BoxUnlockForm {...props} />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
    });

    it('應該在創作者預覽模式下顯示提示文字', () => {
      const props = {
        ...defaultProps,
        isCreatorPreview: true,
      };

      render(<BoxUnlockForm {...props} />);

      expect(screen.getByText('創作者無法領取')).toBeInTheDocument();
    });

    it('應該顯示創作者無法領取的提示標題', () => {
      const props = {
        ...defaultProps,
        isCreatorPreview: true,
      };

      render(<BoxUnlockForm {...props} />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toHaveAttribute('title', '創作者無法領取自己的資料包');
    });
  });

  describe('樣式變體', () => {
    it('應該在 minimal 模式下使用簡化樣式', () => {
      const props = {
        ...defaultProps,
        variant: 'minimal' as const,
      };

      render(<BoxUnlockForm {...props} />);

      const submitButton = screen.getByRole('button', { name: /立即解鎖/i });
      expect(submitButton).toHaveClass('w-full');
      expect(submitButton).not.toHaveClass('gradient-magic');
    });

    it('應該在 default 模式下使用漸層樣式', () => {
      const props = {
        ...defaultProps,
        variant: 'default' as const,
      };

      render(<BoxUnlockForm {...props} />);

      const submitButton = screen.getByRole('button', { name: /立即解鎖/i });
      expect(submitButton).toHaveClass('gradient-magic');
    });
  });

  describe('欄位顯示邏輯', () => {
    it('當 required_fields 為 null 時不應顯示暱稱欄位', () => {
      const props = {
        ...defaultProps,
        boxData: {
          required_fields: null,
        },
      };

      render(<BoxUnlockForm {...props} />);

      expect(screen.queryByLabelText(/稱呼.*暱稱/i)).not.toBeInTheDocument();
    });

    it('當 required_fields.nickname 為 false 時不應顯示暱稱欄位', () => {
      const props = {
        ...defaultProps,
        boxData: {
          required_fields: { nickname: false },
        },
      };

      render(<BoxUnlockForm {...props} />);

      expect(screen.queryByLabelText(/稱呼.*暱稱/i)).not.toBeInTheDocument();
    });
  });

  describe('可訪問性', () => {
    it('所有輸入欄位應該有對應的 label', () => {
      const props = {
        ...defaultProps,
        boxData: {
          required_fields: { nickname: true },
        },
      };

      render(<BoxUnlockForm {...props} />);

      expect(screen.getByLabelText('關鍵字')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText(/稱呼.*暱稱/i)).toBeInTheDocument();
    });

    it('提交按鈕應該是可聚焦的', () => {
      render(<BoxUnlockForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /立即解鎖/i });
      submitButton.focus();
      
      expect(submitButton).toHaveFocus();
    });
  });
});