/**
 * ClaimRecordsTable 組件測試
 * 
 * 測試領取記錄表格的各種場景：
 * - 組件渲染
 * - 搜尋功能
 * - 分頁功能
 * - 排序功能
 * - 匯出 CSV
 * - 展開/摺疊
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClaimRecordsTable from '@/components/ClaimRecordsTable';
import { mockClaimRecords } from '../setup/mocks';

describe('ClaimRecordsTable', () => {
  const defaultProps = {
    records: mockClaimRecords,
    keywordName: '測試盲盒',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('應該渲染記錄表格', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      expect(screen.getByText(/展開記錄/)).toBeInTheDocument();
    });

    it('當沒有記錄時應該顯示空狀態', () => {
      render(<ClaimRecordsTable records={[]} keywordName="測試" />);

      expect(screen.getByText('尚無領取記錄')).toBeInTheDocument();
    });

    it('應該顯示記錄總數', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      expect(screen.getByText(/2 筆/)).toBeInTheDocument();
    });
  });

  describe('展開/摺疊功能', () => {
    it('預設應該是展開狀態', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      expect(screen.getByPlaceholderText('搜尋 Email...')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('點擊摺疊按鈕應該隱藏表格', async () => {
      const user = userEvent.setup();
      render(<ClaimRecordsTable {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /摺疊記錄/ });
      await user.click(toggleButton);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.getByText(/展開記錄.*2 筆/)).toBeInTheDocument();
    });

    it('摺疊後再次點擊應該展開表格', async () => {
      const user = userEvent.setup();
      render(<ClaimRecordsTable {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /摺疊記錄/ });
      await user.click(toggleButton);
      await user.click(screen.getByRole('button', { name: /展開記錄/ }));

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('表格內容', () => {
    it('應該顯示所有記錄', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      mockClaimRecords.forEach(record => {
        expect(screen.getByText(record.email)).toBeInTheDocument();
      });
    });

    it('應該顯示序號', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(within(table).getByText('1')).toBeInTheDocument();
      expect(within(table).getByText('2')).toBeInTheDocument();
    });

    it('應該顯示格式化的時間', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      const table = screen.getByRole('table');
      const cells = within(table).getAllByRole('cell');
      
      // 檢查是否有時間格式的文字
      const hasTimeFormat = cells.some(cell => 
        /\d{4}\/\d{2}\/\d{2}/.test(cell.textContent || '')
      );
      expect(hasTimeFormat).toBe(true);
    });
  });

  describe('搜尋功能', () => {
    it('應該根據 email 過濾記錄', async () => {
      const user = userEvent.setup();
      render(<ClaimRecordsTable {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('搜尋 Email...');
      await user.type(searchInput, 'user1');

      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.queryByText('user2@example.com')).not.toBeInTheDocument();
    });

    it('搜尋應該不區分大小寫', async () => {
      const user = userEvent.setup();
      render(<ClaimRecordsTable {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('搜尋 Email...');
      await user.type(searchInput, 'USER1');

      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    it('搜尋時應該更新記錄計數', async () => {
      const user = userEvent.setup();
      render(<ClaimRecordsTable {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('搜尋 Email...');
      await user.type(searchInput, 'user1');

      expect(screen.getByText(/共 1 筆/)).toBeInTheDocument();
    });

    it('沒有符合的搜尋結果時應該顯示提示', async () => {
      const user = userEvent.setup();
      render(<ClaimRecordsTable {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('搜尋 Email...');
      await user.type(searchInput, 'notfound');

      expect(screen.getByText('沒有符合的記錄')).toBeInTheDocument();
    });

    it('搜尋時應該重置到第一頁', async () => {
      const user = userEvent.setup();
      const manyRecords = Array.from({ length: 25 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`,
        created_at: '2024-01-01T10:00:00Z',
      }));

      render(<ClaimRecordsTable records={manyRecords} keywordName="測試" />);

      // 先翻到第二頁
      const page2Button = screen.getByRole('button', { name: '2' });
      await user.click(page2Button);

      // 進行搜尋
      const searchInput = screen.getByPlaceholderText('搜尋 Email...');
      await user.type(searchInput, 'user1');

      // 應該回到第一頁
      expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
    });
  });

  describe('排序功能', () => {
    it('預設應該按時間降序排列', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      const firstDataRow = rows[1]; // 跳過表頭
      
      expect(within(firstDataRow).getByText('user2@example.com')).toBeInTheDocument();
    });

    it('點擊排序按鈕應該切換排序方向', async () => {
      const user = userEvent.setup();
      render(<ClaimRecordsTable {...defaultProps} />);

      const sortButton = screen.getByRole('button', { name: /領取時間/ });
      await user.click(sortButton);

      const rows = screen.getAllByRole('row');
      const firstDataRow = rows[1];
      
      expect(within(firstDataRow).getByText('user1@example.com')).toBeInTheDocument();
    });

    it('應該顯示排序方向指示器', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      expect(screen.getByText('領取時間')).toBeInTheDocument();
      expect(screen.getByText(/↓/)).toBeInTheDocument();
    });

    it('切換排序後應該更新指示器', async () => {
      const user = userEvent.setup();
      render(<ClaimRecordsTable {...defaultProps} />);

      const sortButton = screen.getByRole('button', { name: /領取時間/ });
      await user.click(sortButton);

      expect(screen.getByText(/↑/)).toBeInTheDocument();
    });
  });

  describe('分頁功能', () => {
    const manyRecords = Array.from({ length: 25 }, (_, i) => ({
      email: `user${i}@example.com`,
      name: `User ${i}`,
      created_at: `2024-01-0${Math.floor(i / 9) + 1}T${String(10 + i % 14).padStart(2, '0')}:00:00Z`,
    }));

    it('當記錄超過 10 筆時應該顯示分頁', () => {
      render(<ClaimRecordsTable records={manyRecords} keywordName="測試" />);

      expect(screen.getByRole('button', { name: '上一頁' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '下一頁' })).toBeInTheDocument();
    });

    it('第一頁時上一頁按鈕應該被禁用', () => {
      render(<ClaimRecordsTable records={manyRecords} keywordName="測試" />);

      const prevButton = screen.getByRole('button', { name: '上一頁' });
      expect(prevButton).toBeDisabled();
    });

    it('最後一頁時下一頁按鈕應該被禁用', async () => {
      const user = userEvent.setup();
      render(<ClaimRecordsTable records={manyRecords} keywordName="測試" />);

      // 跳到最後一頁 (第3頁)
      const page3Button = screen.getByRole('button', { name: '3' });
      await user.click(page3Button);

      const nextButton = screen.getByRole('button', { name: '下一頁' });
      expect(nextButton).toBeDisabled();
    });

    it('應該正確顯示當前頁範圍', () => {
      render(<ClaimRecordsTable records={manyRecords} keywordName="測試" />);

      expect(screen.getByText(/顯示 1-10 筆，共 25 筆/)).toBeInTheDocument();
    });

    it('點擊頁碼應該切換頁面', async () => {
      const user = userEvent.setup();
      render(<ClaimRecordsTable records={manyRecords} keywordName="測試" />);

      const page2Button = screen.getByRole('button', { name: '2' });
      await user.click(page2Button);

      expect(screen.getByText(/顯示 11-20 筆/)).toBeInTheDocument();
    });

    it('當前頁應該有不同的樣式', () => {
      render(<ClaimRecordsTable records={manyRecords} keywordName="測試" />);

      const page1Button = screen.getByRole('button', { name: '1' });
      expect(page1Button).toHaveClass('default');
    });
  });

  describe('匯出 CSV 功能', () => {
    it('應該顯示匯出按鈕', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      expect(screen.getByRole('button', { name: /匯出 CSV/ })).toBeInTheDocument();
    });

    it('點擊匯出按鈕應該下載 CSV 文件', async () => {
      const user = userEvent.setup();
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ClaimRecordsTable {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /匯出 CSV/ });
      await user.click(exportButton);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('CSV 檔名應該包含關鍵字名稱和日期', async () => {
      const user = userEvent.setup();
      let downloadLink: HTMLAnchorElement | null = null;

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        if (node instanceof HTMLAnchorElement) {
          downloadLink = node;
        }
        return node;
      });

      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ClaimRecordsTable {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /匯出 CSV/ });
      await user.click(exportButton);

      expect(downloadLink?.download).toMatch(/測試盲盒_領取記錄/);
      expect(downloadLink?.download).toMatch(/\.csv$/);

      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('響應式佈局', () => {
    it('表格應該在容器內滾動', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      const tableContainer = screen.getByRole('table').parentElement;
      expect(tableContainer).toHaveClass('overflow-hidden');
    });

    it('搜尋框應該有最大寬度限制', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('搜尋 Email...');
      expect(searchInput).toHaveClass('max-w-sm');
    });
  });

  describe('可訪問性', () => {
    it('表格應該有正確的語義結構', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
    });

    it('按鈕應該有描述性的文字', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      expect(screen.getByRole('button', { name: /展開記錄|摺疊記錄/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /匯出 CSV/ })).toBeInTheDocument();
    });

    it('搜尋框應該有 placeholder', () => {
      render(<ClaimRecordsTable {...defaultProps} />);

      expect(screen.getByPlaceholderText('搜尋 Email...')).toBeInTheDocument();
    });
  });

  describe('邊界情況', () => {
    it('應該處理只有一筆記錄的情況', () => {
      const singleRecord = [mockClaimRecords[0]];
      render(<ClaimRecordsTable records={singleRecord} keywordName="測試" />);

      expect(screen.getByText(/共 1 筆/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '上一頁' })).not.toBeInTheDocument();
    });

    it('應該處理剛好 10 筆記錄的情況', () => {
      const tenRecords = Array.from({ length: 10 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`,
        created_at: '2024-01-01T10:00:00Z',
      }));

      render(<ClaimRecordsTable records={tenRecords} keywordName="測試" />);

      expect(screen.getByText(/共 10 筆/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
    });

    it('應該處理剛好 11 筆記錄的情況', () => {
      const elevenRecords = Array.from({ length: 11 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`,
        created_at: '2024-01-01T10:00:00Z',
      }));

      render(<ClaimRecordsTable records={elevenRecords} keywordName="測試" />);

      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    });
  });
});