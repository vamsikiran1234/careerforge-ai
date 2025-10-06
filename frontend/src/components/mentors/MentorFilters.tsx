import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useMentorStore } from '@/store/mentors';
import { X, Filter, RotateCcw } from 'lucide-react';

// Common expertise areas
const EXPERTISE_OPTIONS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'AI/ML',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'Backend Development',
  'Frontend Development',
  'Full Stack Development',
  'UI/UX Design',
  'Product Management',
  'System Design',
  'Database Design',
  'Blockchain',
  'Game Development',
  'Quality Assurance',
];

// Common industries
const INDUSTRY_OPTIONS = [
  'Software & Technology',
  'Finance & Banking',
  'Healthcare',
  'E-commerce',
  'Education',
  'Consulting',
  'Entertainment & Media',
  'Telecommunications',
  'Automotive',
  'Other',
];

export const MentorFilters: React.FC = () => {
  const { filters, updateFilters, resetFilters } = useMentorStore();
  
  const [localFilters, setLocalFilters] = useState(filters);

  const handleExpertiseToggle = (expertise: string) => {
    const current = localFilters.expertise || [];
    const updated = current.includes(expertise)
      ? current.filter((e) => e !== expertise)
      : [...current, expertise];
    
    setLocalFilters({ ...localFilters, expertise: updated });
  };

  const handleApplyFilters = () => {
    updateFilters(localFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      expertise: [],
      industry: '',
      company: '',
      minExperience: 0,
      maxExperience: 50,
      rating: 0,
      page: 1,
      limit: 12,
    };
    setLocalFilters(defaultFilters);
    resetFilters();
  };

  const activeFiltersCount = 
    (localFilters.expertise?.length || 0) +
    (localFilters.industry ? 1 : 0) +
    (localFilters.company ? 1 : 0) +
    (localFilters.minExperience > 0 ? 1 : 0) +
    (localFilters.maxExperience < 50 ? 1 : 0) +
    (localFilters.rating > 0 ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <CardTitle>Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Expertise Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Expertise Areas
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPERTISE_OPTIONS.map((expertise) => {
              const isSelected = localFilters.expertise?.includes(expertise);
              return (
                <Badge
                  key={expertise}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleExpertiseToggle(expertise)}
                >
                  {expertise}
                  {isSelected && <X className="w-3 h-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Industry
          </label>
          <select
            value={localFilters.industry}
            onChange={(e) => setLocalFilters({ ...localFilters, industry: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Industries</option>
            {INDUSTRY_OPTIONS.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company
          </label>
          <Input
            type="text"
            placeholder="e.g., Google, Microsoft"
            value={localFilters.company}
            onChange={(e) => setLocalFilters({ ...localFilters, company: e.target.value })}
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Years of Experience: {localFilters.minExperience} - {localFilters.maxExperience}+
          </label>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Minimum</label>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={localFilters.minExperience}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, minExperience: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Maximum</label>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={localFilters.maxExperience}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, maxExperience: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Minimum Rating: {localFilters.rating === 0 ? 'Any' : `${localFilters.rating}+ ⭐`}
          </label>
          <div className="flex gap-2">
            {[0, 3, 4, 4.5, 5].map((rating) => (
              <Button
                key={rating}
                variant={localFilters.rating === rating ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setLocalFilters({ ...localFilters, rating })}
              >
                {rating === 0 ? 'Any' : `${rating}+`}
              </Button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleApplyFilters}
            className="w-full"
            size="lg"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
