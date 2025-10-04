import { useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

interface DailyStat {
  date: string;
  count: number;
}

interface ClaimTrendChartProps {
  dailyStats: DailyStat[] | null;
}

type TimeRange = '1day' | '7days' | '30days' | 'all';

export default function ClaimTrendChart({ dailyStats }: ClaimTrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');

  const getFilteredData = () => {
    if (!dailyStats || dailyStats.length === 0) return [];

    const now = new Date();
    let filteredStats = [...dailyStats].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (timeRange === '1day') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredStats = filteredStats.filter(stat => new Date(stat.date) >= oneDayAgo);
    } else if (timeRange === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredStats = filteredStats.filter(stat => new Date(stat.date) >= sevenDaysAgo);
    } else if (timeRange === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredStats = filteredStats.filter(stat => new Date(stat.date) >= thirtyDaysAgo);
    }

    let cumulativeCount = 0;
    return filteredStats.map(stat => {
      cumulativeCount += stat.count;
      return {
        date: new Date(stat.date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
        dailyCount: stat.count,
        cumulativeCount: cumulativeCount,
      };
    });
  };

  const chartData = getFilteredData();

  if (!dailyStats || dailyStats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暫無領取數據
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={timeRange === '1day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('1day')}
        >
          1天
        </Button>
        <Button
          variant={timeRange === '7days' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('7days')}
        >
          7天
        </Button>
        <Button
          variant={timeRange === '30days' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('30days')}
        >
          30天
        </Button>
        <Button
          variant={timeRange === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('all')}
        >
          全部
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left" 
            tick={{ fontSize: 12 }}
            label={{ value: '每日領取', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fontSize: 12 }}
            label={{ value: '累積領取', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Bar 
            yAxisId="left" 
            dataKey="dailyCount" 
            fill="#10b981" 
            name="每日領取" 
            radius={[4, 4, 0, 0]}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="cumulativeCount" 
            stroke="#3b82f6" 
            name="累積領取" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}