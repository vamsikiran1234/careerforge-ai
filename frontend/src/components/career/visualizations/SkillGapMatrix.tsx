import type { SkillGap } from '../../../store/career';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target } from 'lucide-react';

interface SkillGapMatrixProps {
  skillGaps: SkillGap[];
}

export default function SkillGapMatrix({ skillGaps }: SkillGapMatrixProps) {
  // Prepare data for radar chart
  const chartData = skillGaps.slice(0, 8).map(skill => ({
    skill: skill.skillName.length > 15 ? skill.skillName.substring(0, 15) + '...' : skill.skillName,
    current: skill.currentLevel,
    target: skill.targetLevel,
  }));

  const getGapColor = (gap: number) => {
    if (gap >= 5) return 'text-red-600 dark:text-red-400';
    if (gap >= 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const getGapBg = (gap: number) => {
    if (gap >= 5) return 'bg-red-100 dark:bg-red-900/30';
    if (gap >= 3) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-emerald-100 dark:bg-emerald-900/30';
  };

  if (skillGaps.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No skills identified yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      {chartData.length >= 3 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Skill Level Comparison
          </h4>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis 
                dataKey="skill" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 10]}
                tick={{ fill: '#6b7280' }}
              />
              <Radar
                name="Current Level"
                dataKey="current"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Radar
                name="Target Level"
                dataKey="target"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Legend />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Skills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillGaps.map((skill) => {
          const gap = skill.targetLevel - skill.currentLevel;
          // const progress = (skill.currentLevel / skill.targetLevel) * 100;

          return (
            <div
              key={skill.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {skill.skillName}
                  </h5>
                  {skill.category && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {skill.category}
                    </span>
                  )}
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${getGapBg(gap)} ${getGapColor(gap)}`}>
                  Gap: {gap}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Current: {skill.currentLevel}/10</span>
                  <span>Target: {skill.targetLevel}/10</span>
                </div>
                <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                    style={{ width: `${(skill.currentLevel / 10) * 100}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 border-2 border-emerald-500 rounded-full transition-all"
                    style={{ width: `${(skill.targetLevel / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Priority */}
              {skill.priority && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Priority:</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    skill.priority === 'HIGH'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : skill.priority === 'MEDIUM'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}>
                    {skill.priority}
                  </span>
                </div>
              )}

              {/* Learning Strategy */}
              {skill.learningStrategy && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    💡 {typeof skill.learningStrategy === 'string' ? skill.learningStrategy : JSON.stringify(skill.learningStrategy)}
                  </p>
                </div>
              )}

              {/* Resources Count */}
              {skill.resourceCount !== undefined && skill.resourceCount > 0 && (
                <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                  📚 {skill.resourceCount} learning resources available
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {skillGaps.filter(s => (s.targetLevel - s.currentLevel) <= 2).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Nearly Proficient
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {skillGaps.filter(s => {
              const gap = s.targetLevel - s.currentLevel;
              return gap >= 3 && gap < 5;
            }).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Needs Practice
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {skillGaps.filter(s => (s.targetLevel - s.currentLevel) >= 5).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Beginner Level
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {skillGaps.reduce((acc, s) => acc + s.currentLevel, 0) / skillGaps.length || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Avg Current Level
          </div>
        </div>
      </div>
    </div>
  );
}
