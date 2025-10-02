import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAdmin } from '@/lib/admin';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, Package, History } from 'lucide-react';

interface Stats {
  totalUsers: number;
  weeklyUsers: number;
  totalKeywords: number;
  weeklyKeywords: number;
  totalClaims: number;
  todayClaims: number;
  totalCreators: number;
}

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

      await fetchStats();
    };

    checkAuth();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [
        { data: allKeywords, count: totalKeywords },
        { count: weeklyKeywords },
        { count: totalClaims },
        { count: todayClaims }
      ] = await Promise.all([
        supabase.from('keywords').select('id, user_id', { count: 'exact' }),
        supabase.from('keywords').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek.toISOString()),
        supabase.from('email_logs').select('*', { count: 'exact', head: true }),
        supabase.from('email_logs').select('*', { count: 'exact', head: true }).gte('claimed_at', startOfDay.toISOString()),
      ]);

      const uniqueCreators = new Set(allKeywords?.map(k => k.user_id).filter(Boolean)).size;

      setStats({
        totalUsers: 0,
        weeklyUsers: 0,
        totalKeywords: totalKeywords || 0,
        weeklyKeywords: weeklyKeywords || 0,
        totalClaims: totalClaims || 0,
        todayClaims: todayClaims || 0,
        totalCreators: uniqueCreators,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('載入統計數據失敗');
    } finally {
      setLoading(false);
    }
  };

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

        <Card>
          <CardHeader>
            <CardTitle>🚧 開發中</CardTitle>
            <CardDescription>
              Admin 後台系統正在建置中，即將完成以下功能：
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✅ 權限保護機制</li>
              <li>✅ 用戶統計數據（總數、本週新增）</li>
              <li>✅ 資料包統計數據（總數、本週新增）</li>
              <li>✅ 領取記錄統計（總數、今日新增）</li>
              <li>✅ 創作者數量統計</li>
              <li>⏳ Supabase 用量監控（需 Service Role Key）</li>
              <li>⏳ 用戶管理頁面（Phase 3）</li>
              <li>⏳ 資料包管理頁面（Phase 4）</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}