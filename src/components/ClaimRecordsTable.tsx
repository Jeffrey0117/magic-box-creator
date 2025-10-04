import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronUp, Download } from 'lucide-react';

interface ClaimRecord {
  email: string;
  unlocked_at: string;
}

interface ClaimRecordsTableProps {
  records: ClaimRecord[];
  keywordName: string;
}

export default function ClaimRecordsTable({ records, keywordName }: ClaimRecordsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const sortedRecords = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      const dateA = new Date(a.unlocked_at).getTime();
      const dateB = new Date(b.unlocked_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [records, sortOrder]);

  const filteredRecords = useMemo(() => {
    return sortedRecords.filter(record =>
      record.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedRecords, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const exportToCSV = () => {
    const headers = ['Email', '領取時間'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => 
        `${record.email},${new Date(record.unlocked_at).toLocaleString('zh-TW')}`
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${keywordName}_領取記錄_${new Date().toLocaleDateString('zh-TW')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        尚無領取記錄
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="font-medium">
            {isExpanded ? '摺疊記錄' : `展開記錄（${records.length} 筆）`}
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          匯出 CSV
        </Button>
      </div>

      {isExpanded && (
        <>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋 Email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-sm"
            />
            <span className="text-sm text-gray-500">
              共 {filteredRecords.length} 筆
            </span>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <button
                      onClick={toggleSortOrder}
                      className="flex items-center gap-1 hover:text-accent transition-colors"
                    >
                      領取時間
                      {sortOrder === 'desc' ? '↓' : '↑'}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      沒有符合的記錄
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-gray-500">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(record.unlocked_at).toLocaleString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                顯示 {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} 筆，共 {filteredRecords.length} 筆
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  上一頁
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  下一頁
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}