import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star, Bookmark, MessageSquare, X } from 'lucide-react';
import { useChatStore } from '@/store/chat';

interface MessageReactionsProps {
  messageId: string;
  sessionId: string;
  isAIMessage?: boolean;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  sessionId,
  isAIMessage = false,
}) => {
  const { messageReactions, addReaction, removeReaction } = useChatStore();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [activeFeedbackType, setActiveFeedbackType] = useState<string | null>(null);

  const reactions = messageReactions[messageId] || [];

  const handleReaction = async (reactionType: string) => {
    const existingReaction = reactions.find(r => r.reactionType === reactionType);
    
    if (existingReaction) {
      await removeReaction(existingReaction.id);
      if (reactionType === 'THUMBS_DOWN' && showFeedback) {
        setShowFeedback(false);
        setFeedbackText('');
        setActiveFeedbackType(null);
      }
    } else {
      if (reactionType === 'THUMBS_DOWN') {
        setActiveFeedbackType(reactionType);
        setShowFeedback(true);
      } else {
        await addReaction(sessionId, messageId, reactionType);
      }
    }
  };

  const submitFeedback = async () => {
    if (activeFeedbackType) {
      await addReaction(sessionId, messageId, activeFeedbackType, feedbackText.trim() || undefined);
      setShowFeedback(false);
      setFeedbackText('');
      setActiveFeedbackType(null);
    }
  };

  const cancelFeedback = () => {
    setShowFeedback(false);
    setFeedbackText('');
    setActiveFeedbackType(null);
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'THUMBS_UP':
        return ThumbsUp;
      case 'THUMBS_DOWN':
        return ThumbsDown;
      case 'STAR':
        return Star;
      case 'BOOKMARK':
        return Bookmark;
      default:
        return MessageSquare;
    }
  };

  const getReactionColor = (type: string, isActive: boolean) => {
    if (!isActive) return 'text-zinc-500 hover:text-zinc-300';
    
    switch (type) {
      case 'THUMBS_UP':
        return 'text-emerald-400';
      case 'THUMBS_DOWN':
        return 'text-red-400';
      case 'STAR':
        return 'text-amber-400';
      case 'BOOKMARK':
        return 'text-cyan-400';
      default:
        return 'text-zinc-400';
    }
  };

  if (!isAIMessage) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Reaction Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['THUMBS_UP', 'THUMBS_DOWN', 'STAR', 'BOOKMARK'].map((reactionType) => {
          const isActive = reactions.some(r => r.reactionType === reactionType);
          const Icon = getReactionIcon(reactionType);
          
          const getLabel = (type: string) => {
            switch (type) {
              case 'THUMBS_UP': return 'Helpful';
              case 'THUMBS_DOWN': return 'Not helpful';
              case 'STAR': return 'Excellent';
              case 'BOOKMARK': return 'Bookmark';
              default: return '';
            }
          };
          
          return (
            <button
              key={reactionType}
              onClick={() => handleReaction(reactionType)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-150 
                text-[11px] font-medium border
                ${isActive 
                  ? getReactionColor(reactionType, true) + ' bg-cyan-500/10 border-cyan-500/30 shadow-sm' 
                  : 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06]'
                }
              `}
              title={getLabel(reactionType)}
            >
              <Icon className={`w-3 h-3 transition-all ${isActive ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{getLabel(reactionType)}</span>
            </button>
          );
        })}
        
        {/* Reaction count indicator */}
        {reactions.length > 0 && (
          <span className="ml-1 text-[10px] text-zinc-500 font-mono">
            {reactions.length}
          </span>
        )}
      </div>

      {/* Feedback Input Modal */}
      {showFeedback && (
        <div className="bg-[#121622] border border-white/10 rounded-xl p-3.5 space-y-2.5 shadow-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
                <ThumbsDown className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white">
                  Help improve responses
                </span>
                <p className="text-[10px] text-zinc-400">
                  What could be better about this guidance?
                </p>
              </div>
            </div>
            <button
              onClick={cancelFeedback}
              className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Describe what could be improved... (optional)"
            className="w-full px-2.5 py-2 border border-white/10 rounded-lg text-xs bg-[#0b0d14] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            rows={2}
          />
          
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelFeedback}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={submitFeedback}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* Show existing feedback if present */}
      {reactions.some(r => r.reactionType === 'THUMBS_DOWN' && r.feedback) && !showFeedback && (
        <div className="text-xs bg-red-950/30 rounded-lg p-2.5 border border-red-500/20 text-red-300">
          <div className="flex items-start gap-2">
            <ThumbsDown className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <strong className="text-white text-xs">Your feedback:</strong>
              <p className="text-zinc-300 italic mt-0.5">
                "{reactions.find(r => r.reactionType === 'THUMBS_DOWN')?.feedback}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
