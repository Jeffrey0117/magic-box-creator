import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAdmin } from '@/lib/admin';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import ClaimTrendChart from '@/components/ClaimTrendChart';
import ClaimRecordsTable from '@/components/ClaimRecordsTable';

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

export default function PackageDetail() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState<Keyword | null>(null);
  const [analytics, setAnalytics] = useState<PackageAnalytics | null>(null);
  const [creatorEmail, setCreatorEmail] = useState<string>('');
  const [claimRecords, setClaimRecords] = useState<Array<{ email: string; unlocked_at: string }>>([]);

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
    if (!confirm(`確定要刪除資料包「${packageData.keyword}」嗎？\n\n此操作無法復原，將會刪除所有相關的領取記錄。`)) return;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回後台
        </Button>

        <Card className="mb-6 border-emerald-200 bg-white/80 backdrop-blur-sm">
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
          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">總領取次數</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{packageData.current_count}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">額度設定</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{packageData.quota || '∞'}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">完成度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {packageData.quota ? `${completionPercentage}%` : '-'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">完成用時</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateCompletionTime()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
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

          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
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

          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">平均每日領取</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateDailyAverage()}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">峰值領取</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{getPeakClaim()}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle>📊 領取趨勢圖表</CardTitle>
            <CardDescription>領取次數隨時間變化趨勢</CardDescription>
          </CardHeader>
          <CardContent>
            <ClaimTrendChart dailyStats={analytics?.daily_stats || null} />
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle>📋 領取記錄</CardTitle>
            <CardDescription>所有領取此資料包的用戶記錄</CardDescription>
          </CardHeader>
          <CardContent>
            <ClaimRecordsTable records={claimRecords} keywordName={packageData.keyword} />
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>📄 資料包內容</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-emerald-50/80 p-4 rounded-lg text-sm text-gray-800">
              {packageData.content}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}