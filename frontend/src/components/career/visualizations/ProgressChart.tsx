import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProgressChartProps {
  goalId: string;
}

interface ProgressDataPoint {
  date: string;
  progress: number;
  milestones: number;
}

export default function ProgressChart({ goalId }: ProgressChartProps) {
  const [chartData, setChartData] = useState<ProgressDataPoint[]>([]);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    // In a real implementation, fetch historical progress data from API
    // For now, generate mock data based on current progress
    generateMockData();
  }, [goalId]);

  const generateMockData = () => {
    // Generate 10 data points over the past weeks
    const now = new Date();
    const data: ProgressDataPoint[] = [];
    
    for (let i = 9; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7)); // Weekly intervals
      
      // Simulate progressive growth with some variance
      const baseProgress = ((10 - i) / 10) * 100;
      const variance = Math.random() * 10 - 5;
      const progress = Math.max(0, Math.min(100, baseProgress + variance));
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        progress: Math.round(progress * 10) / 10,
        milestones: Math.floor((10 - i) / 2),
      });
    }

    setChartData(data);

    // Calculate trend
    if (data.length >= 2) {
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));
      const avgFirst = firstHalf.reduce((acc, d) => acc + d.progress, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((acc, d) => acc + d.progress, 0) / secondHalf.length;
      
      if (avgSecond > avgFirst + 5) setTrend('up');
      else if (avgSecond < avgFirst - 5) setTrend('down');
      else setTrend('stable');
    }
  };

  const currentProgress = chartData.length > 0 ? chartData[chartData.length - 1].progress : 0;
  const previousProgress = chartData.length > 1 ? chartData[chartData.length - 2].progress : 0;
  const progressChange = currentProgress - previousProgress;

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Progress</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {currentProgress.toFixed(1)}%
              </div>
            </div>
            <div className={`p-3 rounded-lg ${
              trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 
              trend === 'down' ? 'bg-red-100 dark:bg-red-900/30' : 
              'bg-gray-100 dark:bg-gray-700'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              ) : (
                <TrendingUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Weekly Change</div>
          <div className={`text-2xl font-bold mt-1 ${
            progressChange > 0 ? 'text-emerald-600 dark:text-emerald-400' :
            progressChange < 0 ? 'text-red-600 dark:text-red-400' :
            'text-gray-900 dark:text-white'
          }`}>
            {progressChange > 0 ? '+' : ''}{progressChange.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Trend</div>
          <div className="text-lg font-semibold mt-1">
            {trend === 'up' && (
              <span className="text-emerald-600 dark:text-emerald-400">📈 Improving</span>
            )}
            {trend === 'down' && (
              <span className="text-red-600 dark:text-red-400">📉 Declining</span>
            )}
            {trend === 'stable' && (
              <span className="text-gray-600 dark:text-gray-400">➡️ Steady</span>
            )}
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Progress Timeline
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'Progress %', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Progress']}
            />
            <Area
              type="monotone"
              dataKey="progress"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#progressGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Milestones Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Milestones Completed
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'Milestones', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [value, 'Milestones']}
            />
            <Line
              type="stepAfter"
              dataKey="milestones"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          📊 Insights
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {trend === 'up' && (
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Your progress is trending upward! Keep up the great work.</span>
            </li>
          )}
          {trend === 'down' && (
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">!</span>
              <span>Progress has slowed recently. Consider reviewing your milestones and focusing on high-priority tasks.</span>
            </li>
          )}
          {progressChange === 0 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">→</span>
              <span>No progress this week. Try completing at least one milestone to maintain momentum.</span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">💡</span>
            <span>Consistent weekly progress of 10-15% is ideal for staying on track with your timeline.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
