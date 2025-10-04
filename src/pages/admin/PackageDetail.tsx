import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAdmin } from '@/lib/admin';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

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
        .eq('id', packageId)
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
        .rpc('get_package_analytics', { package_id: packageId });

      if (analyticsError) {
        console.error('Analytics error:', analyticsError);
      } else {
        setAnalytics(analyticsData);
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-6">
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
            <CardTitle className="text-2xl">📦 {packageData.keyword}</CardTitle>
            <CardDescription>
              短網址：{window.location.origin}/{packageData.short_code || packageData.id}
              <br />
              創作者：{creatorEmail}
              <br />
              建立時間：{formatDate(packageData.created_at)}
            </CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>📄 資料包內容</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-emerald-50 p-4 rounded-lg text-sm text-gray-800">
              {packageData.content}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}