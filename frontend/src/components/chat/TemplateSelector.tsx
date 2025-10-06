import React, { useState, useMemo } from 'react';
import { X, Search, Clock, Tag, ChevronRight, Sparkles, Filter, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { careerTemplates, templateCategories, searchTemplates, getTemplatesByCategory } from '@/data/careerTemplates';
import type { CareerTemplate } from '@/data/careerTemplates';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CareerTemplate) => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const categoryColors = {
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  green: 'bg-green-50 border-green-200 text-green-800',
  purple: 'bg-purple-50 border-purple-200 text-purple-800',
  orange: 'bg-orange-50 border-orange-200 text-orange-800',
  teal: 'bg-teal-50 border-teal-200 text-teal-800',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800'
} as const;

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredTemplates = useMemo(() => {
    let templates = searchQuery ? searchTemplates(searchQuery) : careerTemplates;
    
    if (selectedCategory) {
      templates = templates.filter(t => t.category === selectedCategory);
    }
    
    if (selectedDifficulty) {
      templates = templates.filter(t => t.difficulty === selectedDifficulty);
    }
    
    return templates;
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const handleTemplateSelect = (template: CareerTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedDifficulty(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Career Templates</h2>
              <p className="text-sm text-gray-600">Choose a template to start your conversation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-400 hover:text-gray-600 bg-transparent hover:bg-gray-100 border-0"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Categories and Filters */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === null ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  All Categories ({careerTemplates.length})
                </button>
                {Object.entries(templateCategories).map(([key, category]) => {
                  const count = getTemplatesByCategory(key as CareerTemplate['category']).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === key ? categoryColors[category.color] : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.label}</span>
                        <span className="text-xs opacity-70">({count})</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Difficulty</h3>
              <div className="space-y-2">
                {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                      selectedDifficulty === difficulty ? difficultyColors[difficulty as keyof typeof difficultyColors] : 'hover:bg-gray-100'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory || selectedDifficulty) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Main Content - Templates */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCategory 
                    ? templateCategories[selectedCategory as keyof typeof templateCategories]?.label 
                    : 'All Templates'}
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            {/* Templates Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-3"
            }>
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`border border-gray-200 rounded-lg hover:border-gray-300 transition-all cursor-pointer group ${
                    viewMode === 'list' ? 'p-4' : 'p-5'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className={`flex ${viewMode === 'list' ? 'items-center space-x-4' : 'flex-col'}`}>
                    {/* Template Icon and Basic Info */}
                    <div className={`flex items-center ${viewMode === 'list' ? 'space-x-3' : 'space-x-2 mb-3'}`}>
                      <div className="text-2xl">{template.icon}</div>
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {template.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[template.difficulty]}`}>
                            {template.difficulty}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {template.estimatedTime}
                          </span>
                        </div>
                      </div>
                      {viewMode === 'list' && (
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      )}
                    </div>

                    {/* Description */}
                    <div className={viewMode === 'list' ? 'flex-1 mx-4' : ''}>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {template.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{template.tags.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {viewMode === 'grid' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {template.followUpQuestions.length} follow-up questions
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;