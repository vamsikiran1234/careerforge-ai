import { useState } from 'react';
import type { LearningResource } from '../../store/career';
import { useCareerStore } from '../../store/career';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Award,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  Star,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import AddResourceModal from './modals/AddResourceModal';
import EditResourceModal from './modals/EditResourceModal';

interface LearningResourceListProps {
  goalId: string;
  resources: LearningResource[];
  highlightSkill?: string;
  onClearFilter?: () => void;
}

type ResourceType = 'COURSE' | 'BOOK' | 'VIDEO' | 'ARTICLE' | 'CERTIFICATION' | 'PROJECT' | 'OTHER';
type ResourceStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export default function LearningResourceList({ goalId, resources, highlightSkill, onClearFilter }: LearningResourceListProps) {
  const { updateResourceStatus, isLoading } = useCareerStore();
  const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ResourceStatus | 'ALL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);

  // Auto-filter by skill if highlightSkill is provided
  const effectiveResources = highlightSkill
    ? resources.filter(r => 
        r.relatedSkills?.some(s => 
          s.toLowerCase().includes(highlightSkill.toLowerCase())
        )
      )
    : resources;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COURSE':
        return <BookOpen className="w-5 h-5" />;
      case 'VIDEO':
        return <Video className="w-5 h-5" />;
      case 'BOOK':
        return <FileText className="w-5 h-5" />;
      case 'CERTIFICATION':
        return <Award className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COURSE':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'VIDEO':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      case 'BOOK':
        return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
      case 'CERTIFICATION':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
      case 'ARTICLE':
        return 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const handleStatusChange = async (resourceId: string, status: ResourceStatus) => {
    await updateResourceStatus(goalId, resourceId, status);
  };

  // Filter resources
  const filteredResources = effectiveResources.filter(resource => {
    if (filterType !== 'ALL' && resource.type !== filterType) return false;
    if (filterStatus !== 'ALL' && resource.status !== filterStatus) return false;
    return true;
  });

  // Sort by relevance and status
  const sortedResources = [...filteredResources].sort((a, b) => {
    // Prioritize in-progress
    if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
    if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;
    
    // Then by relevance score
    return (b.relevanceScore || 0) - (a.relevanceScore || 0);
  });

  if (resources.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Learning Resources Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click "Find Resources" on any skill in the Skills tab to generate AI-powered learning resources.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add Resource Manually
          </button>
        </div>
        <AddResourceModal 
          goalId={goalId} 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
        />
      </>
    );
  }

  // Check if filtered resources is empty (after filtering by skill)
  if (sortedResources.length === 0 && highlightSkill) {
    return (
      <div className="space-y-6">
        {/* Skill Filter Banner */}
        <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Filtered Resources
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Showing resources for: <strong className="font-bold">{highlightSkill}</strong>
            </p>
          </div>
          <button
            onClick={onClearFilter}
            className="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Clear Filter
          </button>
        </div>

        {/* No filtered resources found */}
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Resources Found for "{highlightSkill}"
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The system generated resources, but none are specifically tagged for this skill.
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={onClearFilter}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All Resources
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
          </div>
        </div>
        <AddResourceModal 
          goalId={goalId} 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skill Filter Badge */}
      {highlightSkill && (
        <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Filtered Resources
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Showing resources for: <strong className="font-bold">{highlightSkill}</strong>
            </p>
          </div>
          <button
            onClick={onClearFilter}
            className="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Learning Resources ({sortedResources.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {effectiveResources.filter(r => r.status === 'COMPLETED').length} completed, {' '}
            {effectiveResources.filter(r => r.status === 'IN_PROGRESS').length} in progress
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ResourceType | 'ALL')}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="ALL">All Types</option>
            <option value="COURSE">Courses</option>
            <option value="VIDEO">Videos</option>
            <option value="BOOK">Books</option>
            <option value="ARTICLE">Articles</option>
            <option value="CERTIFICATION">Certifications</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ResourceStatus | 'ALL')}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                  {getTypeIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {resource.title}
                  </h4>
                  {resource.platform && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {resource.platform}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusBadge(resource.status)}`}>
                  {resource.status === 'NOT_STARTED' ? 'To Do' : resource.status.replace('_', ' ')}
                </span>
              </div>

              {/* Description */}
              {resource.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {resource.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                {resource.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {resource.duration}
                  </div>
                )}
                {resource.relevanceScore !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {(resource.relevanceScore * 10).toFixed(1)}/10
                    </span>
                  </div>
                )}
                {resource.cost !== undefined && resource.cost !== null && (
                  <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-medium">
                    {resource.cost === 0 ? '✓ Free' : `$${resource.cost}`}
                  </div>
                )}
              </div>

              {/* Skills Tags */}
              {resource.relatedSkills && resource.relatedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.relatedSkills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {resource.relatedSkills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                      +{resource.relatedSkills.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {/* Status Buttons */}
                <div className="flex-1 flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => handleStatusChange(resource.id, 'NOT_STARTED')}
                    disabled={isLoading}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                      resource.status === 'NOT_STARTED'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    To Do
                  </button>
                  <button
                    onClick={() => handleStatusChange(resource.id, 'IN_PROGRESS')}
                    disabled={isLoading}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                      resource.status === 'IN_PROGRESS'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Learning
                  </button>
                  <button
                    onClick={() => handleStatusChange(resource.id, 'COMPLETED')}
                    disabled={isLoading}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                      resource.status === 'COMPLETED'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Done
                  </button>
                </div>

                {/* Link */}
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {/* Edit/Delete */}
                <button 
                  onClick={() => setEditingResource(resource)}
                  className="px-2 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button className="px-2 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Completion Badge */}
            {resource.status === 'COMPLETED' && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800 px-5 py-2">
                <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State for Filters */}
      {sortedResources.length === 0 && resources.length > 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            No resources match the selected filters
          </p>
          <button
            onClick={() => {
              setFilterType('ALL');
              setFilterStatus('ALL');
            }}
            className="mt-4 text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Add Resource Modal */}
      <AddResourceModal 
        goalId={goalId} 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />

      {/* Edit Resource Modal */}
      {editingResource && (
        <EditResourceModal 
          goalId={goalId} 
          resource={editingResource}
          isOpen={true} 
          onClose={() => setEditingResource(null)} 
        />
      )}
    </div>
  );
}
