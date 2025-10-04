import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAdmin } from '@/lib/admin';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LayoutDashboard, Users, Package, History, Search, Eye, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface Stats {
  totalUsers: number;
  weeklyUsers: number;
  totalKeywords: number;
  weeklyKeywords: number;
  totalClaims: number;
  todayClaims: number;
  totalCreators: number;
}

type Keyword = Tables<'keywords'> & {
  claim_count?: number;
  creator_email?: string;
};

type EmailLog = Tables<'email_logs'> & {
  keyword?: string;
};

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    weeklyUsers: 0,
    totalKeywords: 0,
    weeklyKeywords: 0,
    totalClaims: 0,
    todayClaims: 0,
    totalCreators: 0,
  });
  const [loading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('請先登入');
        navigate('/login');
        return;
      }
      
      if (!isAdmin(user.email)) {
        toast.error('⛔ 權限不足');
        navigate('/');
        return;
      }

      await Promise.all([fetchStats(), fetchKeywords(), fetchEmailLogs()]);
    };

    checkAuth();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_admin_stats');

      if (error) {
        console.error('Failed to fetch stats:', error);
        toast.error('載入統計數據失敗');
        return;
      }

      if (data) {
        setStats({
          totalUsers: data.total_users || 0,
          weeklyUsers: data.weekly_users || 0,
          totalKeywords: data.total_keywords || 0,
          weeklyKeywords: data.weekly_keywords || 0,
          totalClaims: data.total_claims || 0,
          todayClaims: data.today_claims || 0,
          totalCreators: data.total_creators || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('載入統計數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchKeywords = async () => {
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeywords(data || []);
    } catch (error) {
      console.error('Failed to fetch keywords:', error);
      toast.error('載入資料包列表失敗');
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select(`
          *,
          keywords (keyword)
        `)
        .order('unlocked_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const logsWithKeyword = data?.map(log => ({
        ...log,
        keyword: (log.keywords as any)?.keyword || 'Unknown'
      })) || [];
      
      setEmailLogs(logsWithKeyword);
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
      toast.error('載入領取記錄失敗');
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (!confirm('確定要刪除此資料包嗎？此操作無法復原。')) return;

    try {
      const { error } = await supabase.from('keywords').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('資料包已刪除');
      fetchKeywords();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete keyword:', error);
      toast.error('刪除失敗');
    }
  };

  const filteredKeywords = keywords.filter(k =>
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.short_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = emailLogs.filter(log =>
    log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.keyword?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">🔐 Admin 後台</h1>
          <p className="text-emerald-600">KeyBox 平台管理系統</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">本週新增：{loading ? '...' : stats.weeklyUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總資料包</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalKeywords}</div>
              <p className="text-xs text-muted-foreground">本週新增：{loading ? '...' : stats.weeklyKeywords}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總領取次數</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalClaims}</div>
              <p className="text-xs text-muted-foreground">今日：{loading ? '...' : stats.todayClaims}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">創作者數量</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalCreators}</div>
              <p className="text-xs text-muted-foreground">活躍創作者</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">📊 統計總覽</TabsTrigger>
            <TabsTrigger value="keywords">📦 資料包管理</TabsTrigger>
            <TabsTrigger value="logs">📋 領取記錄</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>✅ 功能清單</CardTitle>
                <CardDescription>Admin 後台系統功能</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✅ 權限保護機制</li>
                  <li>✅ 用戶統計數據（總數、本週新增）</li>
                  <li>✅ 資料包統計數據（總數、本週新增）</li>
                  <li>✅ 領取記錄統計（總數、今日新增）</li>
                  <li>✅ 創作者數量統計</li>
                  <li>✅ 資料包列表管理</li>
                  <li>✅ 領取記錄查詢</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>📦 資料包管理</CardTitle>
                <CardDescription>查看和管理所有資料包</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜尋關鍵字或短網址..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>關鍵字</TableHead>
                      <TableHead>短網址</TableHead>
                      <TableHead>建立時間</TableHead>
                      <TableHead>領取次數</TableHead>
                      <TableHead>額度</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeywords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          沒有資料
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredKeywords.map((kw) => (
                        <TableRow key={kw.id}>
                          <TableCell className="font-medium">{kw.keyword}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {kw.short_code}
                            </code>
                          </TableCell>
                          <TableCell>{new Date(kw.created_at).toLocaleDateString('zh-TW')}</TableCell>
                          <TableCell>{kw.current_count || 0}</TableCell>
                          <TableCell>
                            {kw.quota ? `${kw.current_count || 0}/${kw.quota}` : '無限制'}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>資料包內容</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4">
                                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm max-h-96 overflow-y-auto">
                                    {kw.content}
                                  </pre>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteKeyword(kw.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>📋 領取記錄</CardTitle>
                <CardDescription>查看所有領取記錄（最近 100 筆）</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜尋 Email 或關鍵字..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>關鍵字</TableHead>
                      <TableHead>領取時間</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">
                          沒有記錄
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">{log.email}</TableCell>
                          <TableCell>{log.keyword}</TableCell>
                          <TableCell>
                            {new Date(log.unlocked_at).toLocaleString('zh-TW')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}