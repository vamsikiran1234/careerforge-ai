import React, { useState } from 'react';
import { 
  GitBranch, 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  MessageCircle, 
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ConversationBranch } from '@/types/threading';

interface BranchNavigatorProps {
  branches: ConversationBranch[];
  currentBranchId: string | null;
  onSelectBranch: (branchId: string | null) => void; // null for main thread
  onCreateBranch: (fromMessageId: string, branchName?: string) => void;
  onRenameBranch: (branchId: string, newName: string) => void;
  onDeleteBranch: (branchId: string) => void;
  className?: string;
  branchFromMessageId?: string;
}

const BranchNavigator: React.FC<BranchNavigatorProps> = ({
  branches,
  currentBranchId,
  onSelectBranch,
  onCreateBranch,
  onRenameBranch,
  onDeleteBranch,
  className = '',
  branchFromMessageId
}) => {
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeBranches = branches.filter(b => b.isActive);

  const handleCreateBranch = () => {
    if (!branchFromMessageId) return;
    
    const branchName = newBranchName.trim() || undefined;
    onCreateBranch(branchFromMessageId, branchName);
    setNewBranchName('');
    setIsCreatingBranch(false);
  };

  const handleStartRename = (branch: ConversationBranch) => {
    setEditingBranchId(branch.id);
    setEditingName(branch.branchName || '');
  };

  const handleSaveRename = () => {
    if (editingBranchId) {
      onRenameBranch(editingBranchId, editingName.trim());
    }
    setEditingBranchId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingBranchId(null);
    setEditingName('');
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Conversation Branches</span>
          </div>
          {branchFromMessageId && (
            <button
              onClick={() => setIsCreatingBranch(true)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>New Branch</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2">
        {/* Main Thread Option */}
        <button
          onClick={() => onSelectBranch(null)}
          className={`w-full flex items-center space-x-3 p-2 rounded-md transition-all ${
            currentBranchId === null
              ? 'bg-blue-100 border-blue-300 text-blue-800'
              : 'hover:bg-gray-50 border-transparent text-gray-700'
          } border`}
        >
          <div className="flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-sm">Main Thread</div>
            <div className="text-xs opacity-70">Original conversation</div>
          </div>
          {currentBranchId === null && (
            <CheckCircle className="w-4 h-4 text-blue-600" />
          )}
        </button>

        {/* Create New Branch Form */}
        {isCreatingBranch && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-purple-800 mb-1">
                  Branch Name (optional)
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g., Alternative approach, What if..."
                  className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateBranch}
                  className="flex-1 px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  Create Branch
                </button>
                <button
                  onClick={() => {
                    setIsCreatingBranch(false);
                    setNewBranchName('');
                  }}
                  className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Branches */}
        {activeBranches.length > 0 ? (
          <div className="space-y-1">
            {activeBranches.map((branch, index) => (
              <div
                key={branch.id}
                className={`border rounded-md transition-all ${
                  currentBranchId === branch.id
                    ? 'bg-purple-100 border-purple-300'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center space-x-2 p-2">
                  <button
                    onClick={() => onSelectBranch(branch.id)}
                    className="flex-1 flex items-center space-x-2 text-left"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        currentBranchId === branch.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingBranchId === branch.id ? (
                        <div className="flex space-x-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2 py-0.5 text-sm border border-purple-300 rounded focus:ring-1 focus:ring-purple-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename();
                              if (e.key === 'Escape') handleCancelRename();
                            }}
                            autoFocus
                          />
                          <button
                            onClick={handleSaveRename}
                            className="p-0.5 text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </button>
                          <button
                            onClick={handleCancelRename}
                            className="p-0.5 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {branch.branchName || `Branch ${index + 1}`}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{branch.messages.length} messages</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDistanceToNow(new Date(branch.updatedAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Branch Actions */}
                  {editingBranchId !== branch.id && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleStartRename(branch)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Rename branch"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteBranch(branch.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete branch"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {currentBranchId === branch.id && (
                  <div className="px-2 pb-2">
                    <div className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded">
                      Currently viewing this branch
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No branches created yet</p>
            <p className="text-xs mt-1">Click "Branch" next to any message to create alternate paths</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchNavigator;