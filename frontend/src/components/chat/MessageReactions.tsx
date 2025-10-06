import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Star, Bookmark, MessageSquare, X } from 'lucide-react';
import { useChatStore } from '@/store/chat';
import type { MessageReaction } from '@/store/chat';

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

  // Load reactions when component mounts or messageId changes
  useEffect(() => {
    // Reactions are loaded globally, but we track them per message
  }, [messageId]);

  const handleReaction = async (reactionType: string) => {
    const existingReaction = reactions.find(r => r.reactionType === reactionType);
    
    if (existingReaction) {
      // Remove existing reaction (toggle off)
      await removeReaction(existingReaction.id);
      if (reactionType === 'THUMBS_DOWN' && showFeedback) {
        setShowFeedback(false);
        setFeedbackText('');
        setActiveFeedbackType(null);
      }
    } else {
      // Add new reaction
      if (reactionType === 'THUMBS_DOWN') {
        // Show feedback input for thumbs down
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
    if (!isActive) return 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300';
    
    switch (type) {
      case 'THUMBS_UP':
        return 'text-green-600 dark:text-green-400';
      case 'THUMBS_DOWN':
        return 'text-red-600 dark:text-red-400';
      case 'STAR':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'BOOKMARK':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Only show reactions for AI messages
  if (!isAIMessage) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Reaction Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 
                text-xs font-medium
                ${isActive 
                  ? getReactionColor(reactionType, true) + ' bg-gray-100 dark:bg-slate-700 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }
              `}
              title={getLabel(reactionType)}
            >
              <Icon className={`w-4 h-4 transition-all ${isActive ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{getLabel(reactionType)}</span>
            </button>
          );
        })}
        
        {/* Reaction count indicator */}
        {reactions.length > 0 && (
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            {reactions.length} {reactions.length === 1 ? 'reaction' : 'reactions'}
          </span>
        )}
      </div>

      {/* Feedback Input Modal */}
      {showFeedback && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 
          border border-gray-200 dark:border-slate-600 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <ThumbsDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Help us improve
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  What could be better about this response?
                </p>
              </div>
            </div>
            <button
              onClick={cancelFeedback}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Please describe what went wrong or how we can improve this response... (optional)"
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 
              rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 
              focus:border-transparent bg-white dark:bg-slate-900 
              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            rows={3}
            maxLength={2000}
            autoFocus
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {feedbackText.length}/2000 characters
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelFeedback}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                  hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 
                  dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="px-4 py-2 bg-blue-600 dark:bg-emerald-600 text-white text-sm 
                  rounded-lg hover:bg-blue-700 dark:hover:bg-emerald-700 transition-colors 
                  shadow-sm hover:shadow-md"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show feedback for negative reactions */}
      {reactions.some(r => r.reactionType === 'THUMBS_DOWN' && r.feedback) && !showFeedback && (
        <div className="text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5 
          border-l-2 border-red-400 dark:border-red-500">
          <div className="flex items-start gap-2">
            <ThumbsDown className="w-3 h-3 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <strong className="text-gray-900 dark:text-white text-xs">Your feedback:</strong>
              <p className="text-gray-700 dark:text-gray-300 italic mt-0.5">
                "{reactions.find(r => r.reactionType === 'THUMBS_DOWN')?.feedback}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};