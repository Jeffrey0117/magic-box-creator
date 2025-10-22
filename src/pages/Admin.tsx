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
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LayoutDashboard, Users, Package, History, Search, Eye, Trash2, Edit, UserCog } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';

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
  creator_email?: string;
};

type UserStats = {
  user_id: string;
  email: string;
  display_name: string | null;
  keyword_count: number;
  total_claims: number;
  created_at: string;
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
  const [users, setUsers] = useState<UserStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [editForm, setEditForm] = useState({
    keyword: '',
    content: '',
    quota: '',
    expires_at: '',
    images: ['', '', '', '', ''],
  });
  const [showBatchImageDialog, setShowBatchImageDialog] = useState(false);
  const [batchImageInput, setBatchImageInput] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserEmail, setEditingUserEmail] = useState<string>('');

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

      await Promise.all([fetchStats(), fetchKeywords(), fetchUsers()]);
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
      
      const keywordsWithEmailPromises = (data || []).map(async (kw) => {
        const { data: userStat } = await supabase
          .from('user_stats')
          .select('email')
          .eq('user_id', kw.creator_id)
          .single();
        
        return {
          ...kw,
          creator_email: userStat?.email || 'Unknown'
        };
      });
      
      const keywordsWithEmail = await Promise.all(keywordsWithEmailPromises);
      setKeywords(keywordsWithEmail);
    } catch (error) {
      console.error('Failed to fetch keywords:', error);
      toast.error('載入資料包列表失敗');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*');

      if (error) throw error;

      const userStats: UserStats[] = (data || []).map((row: any) => ({
        user_id: row.user_id,
        email: row.email,
        display_name: row.display_name,
        keyword_count: row.keyword_count,
        total_claims: row.total_claims,
        created_at: row.created_at
      }));

      setUsers(userStats);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('載入用戶列表失敗');
    }
  };

  const handleEditKeyword = (kw: Keyword) => {
    setEditingKeyword(kw);
    setEditForm({
      keyword: kw.keyword,
      content: kw.content,
      quota: kw.quota?.toString() || '',
      expires_at: kw.expires_at ? new Date(kw.expires_at).toISOString().slice(0, 16) : '',
      images: [
        ...(kw.images || []),
        ...Array(5 - (kw.images?.length || 0)).fill(''),
      ].slice(0, 5),
    });
  };

  const handleBatchImagePaste = () => {
    const urls = batchImageInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '')
      .slice(0, 5);
    
    const newImages = [...urls, ...Array(5 - urls.length).fill('')].slice(0, 5);
    setEditForm({ ...editForm, images: newImages });
    setShowBatchImageDialog(false);
    setBatchImageInput('');
    toast.success(`已匯入 ${urls.length} 張圖片`);
  };

  const handleSaveEdit = async () => {
    if (!editingKeyword) return;

    try {
      const filteredImages = editForm.images.filter(url => url.trim() !== '');
      
      const { error } = await supabase
        .from('keywords')
        .update({
          keyword: editForm.keyword,
          content: editForm.content,
          quota: editForm.quota ? parseInt(editForm.quota) : null,
          expires_at: editForm.expires_at || null,
          images: filteredImages.length > 0 ? filteredImages : null,
        })
        .eq('id', editingKeyword.id);

      if (error) throw error;

      toast.success('資料包已更新');
      setEditingKeyword(null);
      fetchKeywords();
    } catch (error) {
      console.error('Failed to update keyword:', error);
      toast.error('更新失敗');
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

  const getUserStatus = (keywordCount: number, totalClaims: number) => {
    if (keywordCount >= 3 && totalClaims >= 50) {
      return { label: '🟢 活躍', variant: 'default' as const };
    }
    if (keywordCount > 0) {
      return { label: '🟡 一般', variant: 'secondary' as const };
    }
    return { label: '🔵 領取者', variant: 'outline' as const };
  };

  const getPackageStatus = (currentCount: number, quota: number | null) => {
    if (quota === null) return { label: '🔄 進行中', variant: 'secondary' as const };
    if (currentCount >= quota) return { label: '✅ 已完成', variant: 'default' as const };
    if (currentCount >= quota * 0.8) return { label: '🟡 即將完成', variant: 'default' as const };
    if (currentCount === 0) return { label: '⏸️ 未啟用', variant: 'outline' as const };
    return { label: '🔄 進行中', variant: 'secondary' as const };
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.display_name && u.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredKeywords = keywords.filter(k =>
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.short_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.creator_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔐 Admin 後台</h1>
          <p className="text-muted-foreground">KeyBox 平台管理系統</p>
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
            <TabsTrigger value="users">👥 用戶管理</TabsTrigger>
            <TabsTrigger value="packages">📦 資料包管理</TabsTrigger>
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
                  <li>✅ 用戶管理功能</li>
                  <li>✅ 資料包列表管理</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>👥 用戶管理</CardTitle>
                <CardDescription>查看和管理所有用戶</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜尋 Email 或暱稱..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>暱稱</TableHead>
                      <TableHead>資料包數</TableHead>
                      <TableHead>總領取次數</TableHead>
                      <TableHead>加入時間</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500">
                          沒有資料
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => {
                        const status = getUserStatus(user.keyword_count, user.total_claims);
                        return (
                          <TableRow key={user.user_id}>
                            <TableCell className="font-mono text-sm">{user.email}</TableCell>
                            <TableCell>{user.display_name || '(未設定)'}</TableCell>
                            <TableCell>{user.keyword_count}</TableCell>
                            <TableCell>{user.total_claims}</TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString('zh-TW')}</TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingUserId(user.user_id);
                                  setEditingUserEmail(user.email);
                                }}
                              >
                                <UserCog className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>📦 資料包管理</CardTitle>
                <CardDescription>查看和管理所有資料包</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜尋關鍵字、短碼或創作者..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>關鍵字</TableHead>
                      <TableHead>短碼</TableHead>
                      <TableHead>創作者</TableHead>
                      <TableHead>領取進度</TableHead>
                      <TableHead>狀態</TableHead>
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
                      filteredKeywords.map((kw) => {
                        const status = getPackageStatus(kw.current_count, kw.quota);
                        const progress = kw.quota 
                          ? `${kw.current_count}/${kw.quota} (${Math.round((kw.current_count / kw.quota) * 100)}%)`
                          : `${kw.current_count}/∞`;
                        
                        return (
                          <TableRow key={kw.id}>
                            <TableCell className="font-medium">{kw.keyword}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-mono">
                                {kw.short_code}
                              </code>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{kw.creator_email}</TableCell>
                            <TableCell>{progress}</TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>{status.label}</Badge>
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
                                    <DialogTitle>📦 {kw.keyword}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="bg-secondary/30 p-4 rounded-lg">
                                      <p className="text-sm text-muted-foreground mb-2">短碼：{kw.short_code}</p>
                                      <p className="text-sm text-muted-foreground mb-2">創作者：{kw.creator_email}</p>
                                      <p className="text-sm text-muted-foreground mb-2">領取進度：{progress}</p>
                                      {kw.expires_at && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                          過期時間：{new Date(kw.expires_at).toLocaleString('zh-TW')}
                                        </p>
                                      )}
                                      {kw.images && kw.images.length > 0 && (
                                        <div>
                                          <p className="text-sm text-muted-foreground mb-2">圖片數量：{kw.images.length}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="bg-secondary/30 p-4 rounded-lg">
                                      <p className="text-sm font-medium mb-2">資料包內容：</p>
                                      <pre className="whitespace-pre-wrap text-sm">{kw.content}</pre>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog open={editingKeyword?.id === kw.id} onOpenChange={(open) => !open && setEditingKeyword(null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditKeyword(kw)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>✏️ 編輯資料包</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="edit-keyword">關鍵字</Label>
                                      <Input
                                        id="edit-keyword"
                                        value={editForm.keyword}
                                        onChange={(e) => setEditForm({ ...editForm, keyword: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-content">資料包內容</Label>
                                      <Textarea
                                        id="edit-content"
                                        value={editForm.content}
                                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                        rows={5}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="edit-quota">配額限制（選填）</Label>
                                        <Input
                                          id="edit-quota"
                                          type="number"
                                          placeholder="不限制"
                                          value={editForm.quota}
                                          onChange={(e) => setEditForm({ ...editForm, quota: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-expires">過期時間（選填）</Label>
                                        <Input
                                          id="edit-expires"
                                          type="datetime-local"
                                          value={editForm.expires_at}
                                          onChange={(e) => setEditForm({ ...editForm, expires_at: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <Label>圖片 URL（最多 5 張，選填）</Label>
                                        <Dialog open={showBatchImageDialog} onOpenChange={setShowBatchImageDialog}>
                                          <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" type="button">
                                              📋 批量貼入
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>批量貼入圖片 URL</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <Label htmlFor="batch-images">每行一個 URL（最多 5 個）</Label>
                                              <Textarea
                                                id="batch-images"
                                                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                                                value={batchImageInput}
                                                onChange={(e) => setBatchImageInput(e.target.value)}
                                                rows={8}
                                              />
                                              <div className="flex justify-end gap-2">
                                                <Button variant="outline" onClick={() => {
                                                  setShowBatchImageDialog(false);
                                                  setBatchImageInput('');
                                                }}>
                                                  取消
                                                </Button>
                                                <Button onClick={handleBatchImagePaste}>
                                                  確定匯入
                                                </Button>
                                              </div>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                      {editForm.images.map((url, idx) => (
                                        <Input
                                          key={idx}
                                          placeholder={`圖片 ${idx + 1} URL`}
                                          value={url}
                                          onChange={(e) => {
                                            const newImages = [...editForm.images];
                                            newImages[idx] = e.target.value;
                                            setEditForm({ ...editForm, images: newImages });
                                          }}
                                          className="mt-2"
                                        />
                                      ))}
                                    </div>

                                    <div className="flex justify-end gap-2 mt-4">
                                      <Button variant="outline" onClick={() => setEditingKeyword(null)}>
                                        取消
                                      </Button>
                                      <Button onClick={handleSaveEdit}>
                                        儲存
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/packages/${kw.short_code}`)}
                              >
                                查看詳情
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteKeyword(kw.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {editingUserId && (
          <ProfileEditDialog
            open={!!editingUserId}
            onOpenChange={(open) => {
              if (!open) {
                setEditingUserId(null);
                setEditingUserEmail('');
                fetchUsers();
              }
            }}
            userId={editingUserId}
            userEmail={editingUserEmail}
          />
        )}
      </div>
    </div>
  );
}