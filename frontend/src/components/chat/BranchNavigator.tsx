import React, { useState } from 'react';
import { 
  GitBranch, 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ConversationBranch } from '@/types/threading';

interface BranchNavigatorProps {
  branches: ConversationBranch[];
  currentBranchId: string | null;
  onSelectBranch: (branchId: string | null) => void;
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
      setEditingBranchId(null);
      setEditingName('');
    }
  };

  const handleCancelRename = () => {
    setEditingBranchId(null);
    setEditingName('');
  };

  return (
    <div className={`bg-[#11141e] border border-white/10 rounded-xl shadow-xl text-white ${className}`}>
      {/* Header */}
      <div className="p-3.5 border-b border-white/[0.08] bg-[#0c0e15] rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">Conversation Branches</span>
          </div>
          {branchFromMessageId && (
            <button
              onClick={() => setIsCreatingBranch(true)}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium shadow-sm"
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
          className={`w-full flex items-center space-x-3 p-2.5 rounded-xl transition-all ${
            currentBranchId === null
              ? 'bg-cyan-500/15 border-cyan-500/30 text-white shadow-sm'
              : 'hover:bg-white/[0.05] border-transparent text-zinc-300'
          } border`}
        >
          <div className="flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-xs text-white">Main Thread</div>
            <div className="text-[10px] text-zinc-400">Original conversation stream</div>
          </div>
          {currentBranchId === null && (
            <CheckCircle className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* Create New Branch Form */}
        {isCreatingBranch && (
          <div className="p-3 bg-[#151926] border border-cyan-500/30 rounded-xl">
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-cyan-300 mb-1">
                  Branch Name (optional)
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g., Alternative Career Direction..."
                  className="w-full px-2.5 py-1.5 text-xs bg-[#0c0e15] border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateBranch}
                  className="flex-1 px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                >
                  Create Branch
                </button>
                <button
                  onClick={() => {
                    setIsCreatingBranch(false);
                    setNewBranchName('');
                  }}
                  className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
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
                className={`border rounded-xl transition-all ${
                  currentBranchId === branch.id
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                    : 'border-white/[0.06] bg-[#141824] hover:border-white/20'
                }`}
              >
                <div className="flex items-center space-x-2 p-2.5">
                  <button
                    onClick={() => onSelectBranch(branch.id)}
                    className="flex-1 flex items-center space-x-2 text-left"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-mono">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingBranchId === branch.id ? (
                        <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2 py-0.5 text-xs bg-[#0c0e15] border border-white/20 rounded text-white"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename();
                              if (e.key === 'Escape') handleCancelRename();
                            }}
                            autoFocus
                          />
                          <button onClick={handleSaveRename} className="p-0.5 text-cyan-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={handleCancelRename} className="p-0.5 text-zinc-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium text-xs text-white truncate">
                            {branch.branchName || `Branch ${index + 1}`}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {formatDistanceToNow(new Date(branch.createdAt), { addSuffix: true })}
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartRename(branch)}
                      className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded"
                      title="Rename"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteBranch(branch.id)}
                      className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-zinc-500">
            No active conversation branches yet
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchNavigator;
