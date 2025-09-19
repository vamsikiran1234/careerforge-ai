import React from 'react';
import { useMentorStore } from '@/store/mentors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { X } from 'lucide-react';

export const MentorFilters: React.FC = () => {
  const { filters, updateFilters, clearFilters } = useMentorStore();

  const expertiseOptions = [
    'Software Engineering',
    'Product Management',
    'Data Science',
    'UX Design',
    'Marketing',
    'Sales',
    'Leadership',
    'Strategy',
    'Career Growth',
    'Technical Leadership',
  ];

  const experienceOptions = [
    { label: '0-3 years', value: '0-3' },
    { label: '4-7 years', value: '4-7' },
    { label: '8+ years', value: '8+' },
  ];

  const availabilityOptions = [
    { label: 'Available', value: 'available' },
    { label: 'Busy', value: 'busy' },
    { label: 'All', value: '' },
  ];

  const handleExpertiseToggle = (expertise: string) => {
    const currentExpertise = filters.expertise;
    const newExpertise = currentExpertise.includes(expertise)
      ? currentExpertise.filter(e => e !== expertise)
      : [...currentExpertise, expertise];
    
    updateFilters({ expertise: newExpertise });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    updateFilters({ priceRange: range });
  };

  const hasActiveFilters = 
    filters.expertise.length > 0 ||
    filters.experience !== '' ||
    filters.rating > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200 ||
    filters.availability !== '';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Expertise */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Expertise</h4>
          <div className="flex flex-wrap gap-2">
            {expertiseOptions.map((expertise) => (
              <button
                key={expertise}
                onClick={() => handleExpertiseToggle(expertise)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  filters.expertise.includes(expertise)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {expertise}
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Experience</h4>
          <div className="space-y-2">
            {experienceOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="experience"
                  value={option.value}
                  checked={filters.experience === option.value}
                  onChange={(e) => updateFilters({ experience: e.target.value })}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
          <div className="space-y-2">
            {[4.5, 4.0, 3.5, 0].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.rating === rating}
                  onChange={(e) => updateFilters({ rating: parseFloat(e.target.value) })}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {rating === 0 ? 'Any rating' : `${rating}+ stars`}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}/hour
          </h4>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceRangeChange([parseInt(e.target.value), filters.priceRange[1]])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceRangeChange([filters.priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>$200</span>
          </div>
        </div>

        {/* Availability */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Availability</h4>
          <div className="space-y-2">
            {availabilityOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={filters.availability === option.value}
                  onChange={(e) => updateFilters({ availability: e.target.value })}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.expertise.map((expertise) => (
                <Badge
                  key={expertise}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-gray-200"
                  onClick={() => handleExpertiseToggle(expertise)}
                >
                  {expertise}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              {filters.experience && (
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-gray-200"
                  onClick={() => updateFilters({ experience: '' })}
                >
                  {filters.experience} years
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {filters.rating > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-gray-200"
                  onClick={() => updateFilters({ rating: 0 })}
                >
                  {filters.rating}+ stars
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {filters.availability && (
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-gray-200"
                  onClick={() => updateFilters({ availability: '' })}
                >
                  {filters.availability}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
