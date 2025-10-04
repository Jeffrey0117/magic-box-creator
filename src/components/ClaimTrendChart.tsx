import { useState, useMemo } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

interface ClaimRecord {
  email: string;
  unlocked_at: string;
}

interface ClaimTrendChartProps {
  claimRecords: ClaimRecord[];
}

type TimeRange = '1hour' | '6hours' | '1day' | '7days' | 'all';

export default function ClaimTrendChart({ claimRecords }: ClaimTrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1hour');

  const chartData = useMemo(() => {
    if (!claimRecords || claimRecords.length === 0) return [];

    const now = new Date();
    let filteredRecords = [...claimRecords];

    if (timeRange === '1hour') {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      filteredRecords = filteredRecords.filter(r => new Date(r.unlocked_at) >= oneHourAgo);
    } else if (timeRange === '6hours') {
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      filteredRecords = filteredRecords.filter(r => new Date(r.unlocked_at) >= sixHoursAgo);
    } else if (timeRange === '1day') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredRecords = filteredRecords.filter(r => new Date(r.unlocked_at) >= oneDayAgo);
    } else if (timeRange === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredRecords = filteredRecords.filter(r => new Date(r.unlocked_at) >= sevenDaysAgo);
    }

    const timeMap = new Map<string, number>();
    
    filteredRecords.forEach(record => {
      const date = new Date(record.unlocked_at);
      let key: string;
      
      if (timeRange === '1hour' || timeRange === '6hours') {
        key = `${date.getHours()}:${String(Math.floor(date.getMinutes() / 10) * 10).padStart(2, '0')}`;
      } else if (timeRange === '1day') {
        key = `${date.getHours()}:00`;
      } else {
        key = `${date.getMonth() + 1}/${date.getDate()}`;
      }
      
      timeMap.set(key, (timeMap.get(key) || 0) + 1);
    });

    const sortedData = Array.from(timeMap.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => {
        if (timeRange === '1hour' || timeRange === '6hours' || timeRange === '1day') {
          const [aH, aM] = a.time.split(':').map(Number);
          const [bH, bM] = b.time.split(':').map(Number);
          return (aH * 60 + aM) - (bH * 60 + bM);
        } else {
          const [aM, aD] = a.time.split('/').map(Number);
          const [bM, bD] = b.time.split('/').map(Number);
          return (aM * 100 + aD) - (bM * 100 + bD);
        }
      });

    let cumulative = 0;
    return sortedData.map(item => {
      cumulative += item.count;
      return {
        time: item.time,
        count: item.count,
        cumulative: cumulative,
      };
    });
  }, [claimRecords, timeRange]);

  if (!claimRecords || claimRecords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暫無領取數據
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={timeRange === '1hour' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('1hour')}
        >
          1小時
        </Button>
        <Button
          variant={timeRange === '6hours' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('6hours')}
        >
          6小時
        </Button>
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
            dataKey="time"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            label={{ value: '領取次數', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
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
            dataKey="count"
            fill="#10b981"
            name="領取次數"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
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