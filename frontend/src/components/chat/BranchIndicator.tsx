import React from 'react';
import { GitBranch, Plus, Eye, MessageCircle } from 'lucide-react';
import type { BranchPoint } from '@/types/threading';

interface BranchIndicatorProps {
  branchPoint: BranchPoint;
  onCreateBranch: (messageId: string) => void;
  onViewBranch: (branchId: string) => void;
  currentBranchId?: string | null;
  className?: string;
}

const BranchIndicator: React.FC<BranchIndicatorProps> = ({
  branchPoint,
  onCreateBranch,
  onViewBranch,
  currentBranchId,
  className = ''
}) => {
  const { messageId, branches } = branchPoint;
  const hasActiveBranches = branches.filter(b => b.isActive).length > 0;

  return (
    <div className={`flex items-center space-x-2 mt-2 ${className}`}>
      {/* Branch visualization line */}
      {hasActiveBranches && (
        <div className="flex items-center space-x-1">
          <div className="w-6 h-6 flex items-center justify-center bg-purple-100 rounded-full">
            <GitBranch className="w-3 h-3 text-purple-600" />
          </div>
          <div className="h-px bg-gradient-to-r from-purple-300 to-transparent flex-1 min-w-8" />
        </div>
      )}

      {/* Branch controls */}
      <div className="flex items-center space-x-1">
        {/* Create new branch button */}
        <button
          onClick={() => onCreateBranch(messageId)}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md border border-purple-200 hover:border-purple-300 transition-all duration-200 group"
          title="Create new branch from this message"
        >
          <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
          <span>Branch</span>
        </button>

        {/* Existing branches */}
        {branches.filter(b => b.isActive).map((branch, index) => (
          <button
            key={branch.id}
            onClick={() => onViewBranch(branch.id)}
            className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-md border transition-all duration-200 ${
              currentBranchId === branch.id
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300'
            }`}
            title={`View branch: ${branch.branchName || `Branch ${index + 1}`}`}
          >
            <Eye className="w-3 h-3" />
            <span>{branch.branchName || `Branch ${index + 1}`}</span>
            <div className="flex items-center ml-1 text-xs opacity-70">
              <MessageCircle className="w-2.5 h-2.5 mr-0.5" />
              {branch.messages.length}
            </div>
          </button>
        ))}

        {/* Branch count indicator */}
        {branches.length > 3 && (
          <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
            +{branches.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchIndicator;