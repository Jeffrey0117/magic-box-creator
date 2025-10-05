import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAdmin } from '@/lib/admin';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Trash2, Plus } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import ClaimTrendChart from '@/components/ClaimTrendChart';
import ClaimRecordsTable from '@/components/ClaimRecordsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Keyword = Tables<'keywords'>;

interface PackageAnalytics {
  total_claims: number;
  first_claim: string | null;
  last_claim: string | null;
  daily_stats: Array<{
    date: string;
    count: number;
  }> | null;
}

interface WaitlistEntry {
  id: string;
  email: string;
  reason: string;
  status: string;
  created_at: string;
  notified_at: string | null;
}

export default function PackageDetail() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState<Keyword | null>(null);
  const [analytics, setAnalytics] = useState<PackageAnalytics | null>(null);
  const [creatorEmail, setCreatorEmail] = useState<string>('');
  const [claimRecords, setClaimRecords] = useState<Array<{ email: string; unlocked_at: string }>>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [customQuota, setCustomQuota] = useState<string>('');
  const [isAddingQuota, setIsAddingQuota] = useState(false);

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
        navigate('/admin');
        return;
      }

      await fetchPackageData();
    };

    checkAuth();
  }, [packageId, navigate]);

  const fetchPackageData = async () => {
    if (!packageId) return;
    
    try {
      setLoading(true);

      const { data: keyword, error: keywordError } = await supabase
        .from('keywords')
        .select('*')
        .eq('short_code', packageId)
        .single();

      if (keywordError) throw keywordError;
      setPackageData(keyword);

      const { data: userStat } = await supabase
        .from('user_stats')
        .select('email')
        .eq('user_id', keyword.creator_id)
        .single();

      setCreatorEmail(userStat?.email || 'Unknown');

      const { data: analyticsData, error: analyticsError } = await supabase
        .rpc('get_package_analytics', { package_id: keyword.id });

      if (analyticsError) {
        console.error('Analytics error:', analyticsError);
      } else {
        setAnalytics(analyticsData);
      }

      const { data: records, error: recordsError } = await supabase
        .from('email_logs')
        .select('email, unlocked_at')
        .eq('keyword_id', keyword.id)
        .order('unlocked_at', { ascending: false });

      if (recordsError) {
        console.error('Records error:', recordsError);
      } else {
        setClaimRecords(records || []);
      }

      const { data: waitlistData, error: waitlistError } = await supabase
        .from('waitlist')
        .select('*')
        .eq('keyword_id', keyword.id)
        .order('created_at', { ascending: true });

      if (waitlistError) {
        console.error('Waitlist error:', waitlistError);
      } else {
        setWaitlist(waitlistData || []);
      }
    } catch (error) {
      console.error('Failed to fetch package data:', error);
      toast.error('載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-TW');
  };

  const calculateCompletionTime = () => {
    if (!packageData || !analytics || !packageData.quota) return null;
    if (packageData.current_count < packageData.quota) return '進行中';
    if (!analytics.first_claim || !analytics.last_claim) return '-';

    const start = new Date(packageData.created_at).getTime();
    const end = new Date(analytics.last_claim).getTime();
    const diff = end - start;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}天${hours}小時`;
  };

  const calculateDailyAverage = () => {
    if (!packageData || !analytics) return 0;
    const now = new Date().getTime();
    const created = new Date(packageData.created_at).getTime();
    const days = Math.max((now - created) / (1000 * 60 * 60 * 24), 1);
    return (packageData.current_count / days).toFixed(1);
  };

  const getPeakClaim = () => {
    if (!analytics?.daily_stats || analytics.daily_stats.length === 0) return '-';
    const peak = analytics.daily_stats.reduce((max, stat) =>
      stat.count > max.count ? stat : max
    , analytics.daily_stats[0]);
    return `${peak.count} (${new Date(peak.date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })})`;
  };

  const copyShortUrl = () => {
    const url = `${window.location.origin}/${packageData?.short_code}`;
    navigator.clipboard.writeText(url);
    toast.success('短網址已複製到剪貼簿！');
  };

  const handleDeletePackage = async () => {
    if (!packageData) return;
    
    const userInput = prompt(
      `⚠️ 危險操作：刪除資料包\n\n` +
      `此操作無法復原，將會刪除：\n` +
      `• 資料包本身\n` +
      `• 所有領取記錄 (${packageData.current_count} 筆)\n` +
      `• 所有候補名單\n\n` +
      `請輸入關鍵字「${packageData.keyword}」以確認刪除：`
    );

    if (userInput !== packageData.keyword) {
      if (userInput !== null) {
        toast.error('關鍵字不符，取消刪除');
      }
      return;
    }

    try {
      const { error } = await supabase.from('keywords').delete().eq('id', packageData.id);
      if (error) throw error;
      
      toast.success('資料包已刪除');
      navigate('/admin');
    } catch (error) {
      console.error('Failed to delete package:', error);
      toast.error('刪除失敗');
    }
  };

  const handleAddQuota = async (amount: number) => {
    if (!packageData) return;
    setIsAddingQuota(true);

    try {
      const newQuota = (packageData.quota || 0) + amount;
      const { error } = await supabase
        .from('keywords')
        .update({ quota: newQuota })
        .eq('id', packageData.id);

      if (error) throw error;

      toast.success(`已加開 ${amount} 份配額`);
      await fetchPackageData();
    } catch (error) {
      console.error('Failed to add quota:', error);
      toast.error('加開配額失敗');
    } finally {
      setIsAddingQuota(false);
    }
  };

  const handleCustomQuotaAdd = async () => {
    const amount = parseInt(customQuota);
    if (!amount || amount <= 0) {
      toast.error('請輸入有效的數量');
      return;
    }
    await handleAddQuota(amount);
    setCustomQuota('');
  };

  const exportWaitlist = () => {
    if (waitlist.length === 0) {
      toast.error('候補名單為空');
      return;
    }

    const headers = ['Email', '加入原因', '狀態', '加入時間', '通知時間'];
    const rows = waitlist.map(entry => [
      entry.email,
      entry.reason,
      entry.status === 'pending' ? '等待中' : '已通知',
      new Date(entry.created_at).toLocaleString('zh-TW'),
      entry.notified_at ? new Date(entry.notified_at).toLocaleString('zh-TW') : '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `候補名單_${packageData?.keyword}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('候補名單已匯出');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">載入中...</div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">找不到資料包</div>
        </div>
      </div>
    );
  }

  const completionPercentage = packageData.quota 
    ? Math.round((packageData.current_count / packageData.quota) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回後台
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">📦 {packageData.keyword}</CardTitle>
                <CardDescription>
                  短網址：{window.location.origin}/{packageData.short_code || packageData.id}
                  <br />
                  創作者：{creatorEmail}
                  <br />
                  建立時間：{formatDate(packageData.created_at)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyShortUrl}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  複製短網址
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeletePackage}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  刪除資料包
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">總領取次數</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{packageData.current_count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">額度設定</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{packageData.quota || '∞'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">完成度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {packageData.quota ? `${completionPercentage}%` : '-'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">完成用時</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateCompletionTime()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">首次領取時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {analytics?.first_claim 
                  ? new Date(analytics.first_claim).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '-'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">最後領取時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {analytics?.last_claim 
                  ? new Date(analytics.last_claim).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '-'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">平均每日領取</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateDailyAverage()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">峰值領取</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{getPeakClaim()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">數據分析</TabsTrigger>
            <TabsTrigger value="waitlist">候補名單 ({waitlist.length})</TabsTrigger>
            <TabsTrigger value="content">資料包內容</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 領取趨勢圖表</CardTitle>
                <CardDescription>領取次數隨時間變化趨勢</CardDescription>
              </CardHeader>
              <CardContent>
                <ClaimTrendChart claimRecords={claimRecords} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📋 領取記錄</CardTitle>
                <CardDescription>所有領取此資料包的用戶記錄</CardDescription>
              </CardHeader>
              <CardContent>
                <ClaimRecordsTable records={claimRecords} keywordName={packageData.keyword} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🎫 候補管理</CardTitle>
                <CardDescription>
                  目前有 {waitlist.length} 人在候補名單中
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleAddQuota(20)}
                    disabled={isAddingQuota}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    加開 20 份
                  </Button>
                  <Button
                    onClick={() => handleAddQuota(50)}
                    disabled={isAddingQuota}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    加開 50 份
                  </Button>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="自訂數量"
                      value={customQuota}
                      onChange={(e) => setCustomQuota(e.target.value)}
                      className="w-24"
                      min="1"
                    />
                    <Button
                      onClick={handleCustomQuotaAdd}
                      disabled={isAddingQuota || !customQuota}
                      size="sm"
                    >
                      加開
                    </Button>
                  </div>
                  <Button
                    onClick={exportWaitlist}
                    variant="outline"
                    size="sm"
                    disabled={waitlist.length === 0}
                  >
                    匯出 CSV
                  </Button>
                </div>

                {waitlist.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    目前沒有候補者
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-2">#</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">加入原因</th>
                          <th className="text-left p-2">狀態</th>
                          <th className="text-left p-2">加入時間</th>
                        </tr>
                      </thead>
                      <tbody>
                        {waitlist.map((entry, index) => (
                          <tr key={entry.id} className="border-b hover:bg-secondary/20">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2 font-mono text-xs">{entry.email}</td>
                            <td className="p-2 max-w-xs truncate">{entry.reason}</td>
                            <td className="p-2">
                              {entry.status === 'pending' ? (
                                <span className="text-yellow-600">⏳ 等待中</span>
                              ) : (
                                <span className="text-green-600">✅ 已通知</span>
                              )}
                            </td>
                            <td className="p-2 text-xs text-muted-foreground">
                              {new Date(entry.created_at).toLocaleString('zh-TW', {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>📄 資料包內容</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap bg-secondary/30 p-4 rounded-lg text-sm">
                  {packageData.content}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}