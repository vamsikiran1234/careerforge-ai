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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#11141e] text-white border border-white/10 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Career Templates</h2>
              <p className="text-sm text-zinc-400">Choose a strategic template to jumpstart your conversation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-zinc-400 hover:text-white bg-transparent hover:bg-white/5 border-0"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Categories and Filters */}
          <div className="w-80 border-r border-white/[0.08] bg-[#0c0e15] p-6 overflow-y-auto custom-scrollbar">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-white/10 bg-[#141824] text-white placeholder-zinc-500 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-cyan-400" />
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                    selectedCategory === null ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
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
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                        selectedCategory === key ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.label}</span>
                        <span className="text-[10px] text-zinc-500">({count})</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Difficulty</h3>
              <div className="space-y-1.5">
                {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors capitalize ${
                      selectedDifficulty === difficulty ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
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
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Main Content - Templates */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#090b10]">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {selectedCategory 
                    ? templateCategories[selectedCategory as keyof typeof templateCategories]?.label 
                    : 'All Templates'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            {/* Templates Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5" 
                : "space-y-2.5"
            }>
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="border border-white/10 bg-[#121622] hover:border-cyan-500/40 rounded-xl p-4 transition-all cursor-pointer group"
                >
                  <div className={`flex ${viewMode === 'list' ? 'items-center space-x-4' : 'flex-col'}`}>
                    {/* Template Icon and Basic Info */}
                    <div className={`flex items-center ${viewMode === 'list' ? 'space-x-3' : 'space-x-2 mb-2'}`}>
                      <div className="text-2xl">{template.icon}</div>
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors text-sm">
                          {template.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 capitalize">
                            {template.difficulty}
                          </span>
                          <span className="text-[11px] text-zinc-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {template.estimatedTime}
                          </span>
                        </div>
                      </div>
                      {viewMode === 'list' && (
                        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                      )}
                    </div>

                    {/* Description */}
                    <div className={viewMode === 'list' ? 'flex-1 mx-4' : ''}>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-2.5">
                        {template.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center text-[10px] text-zinc-400 bg-[#181d2a] border border-white/5 px-2 py-0.5 rounded">
                            <Tag className="w-2.5 h-2.5 mr-1 text-cyan-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {viewMode === 'grid' && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                        <span className="text-[11px] text-zinc-500">
                          {template.followUpQuestions.length} guidance prompts
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-base font-medium text-white mb-1">No templates found</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
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