import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, Copy, Check, FileText, File, Edit, GitBranch } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { MessageReactions } from './MessageReactions';
import type { ChatMessage } from '@/store/chat';
import { useChatStore } from '@/store/chat';
import { CareerForgeAvatar } from '@/components/ui/CareerForgeAvatar';

interface MessageItemProps {
  message: ChatMessage;
  onEdit?: (messageId: string, newContent: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onEdit }) => {
  const { currentSession, createBranch } = useChatStore();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() !== message.content && onEdit) {
      // Show alert about regeneration
      const confirmEdit = window.confirm(
        'Editing this message will regenerate the AI response and remove all subsequent messages. Do you want to continue?'
      );
      
      if (confirmEdit) {
        onEdit(message.id, editedContent.trim());
      }
    }
    setIsEditing(false);
  };

  const handleCreateBranch = () => {
    createBranch(message.id);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className={`group py-6 px-6 ${isUser ? 'bg-transparent' : 'bg-gray-50/80 dark:bg-slate-800/30'} hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all duration-200 border-b border-gray-100/50 dark:border-slate-700/30`}>
      <div className="max-w-4xl mx-auto flex gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <CareerForgeAvatar size="sm" showGradient={true} />
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-semibold text-gray-900 dark:text-white">
              {isUser ? 'You' : 'CareerForge AI'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
          </div>
          
          <div className="prose prose-base max-w-none text-gray-900 dark:text-white leading-relaxed font-normal prose-p:text-gray-900 dark:prose-p:text-white prose-li:text-gray-900 dark:prose-li:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-white">
            {isUser ? (
              isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="Edit your message..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-blue-600 dark:bg-emerald-600 text-white rounded-md text-sm hover:bg-blue-700 dark:hover:bg-emerald-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-white rounded-md text-sm hover:bg-gray-400 dark:hover:bg-slate-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words text-gray-900 dark:text-white">
                  {message.content}
                </div>
              )
            ) : (
              <div className="formatted-response text-gray-900 dark:text-white leading-relaxed">
                <ReactMarkdown
                  components={{
                    code: ({ className, children }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const inline = !match;
                      return !inline ? (
                        <CodeBlock className={className}>
                          {String(children).replace(/\n$/, '')}
                        </CodeBlock>
                      ) : (
                        <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-red-600 dark:text-red-400 rounded text-sm font-mono border border-gray-200 dark:border-slate-600">
                          {String(children)}
                        </code>
                      );
                    },
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-white">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white">{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-base font-semibold mb-2 mt-3 text-gray-900 dark:text-white">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-gray-900 dark:text-white leading-7">{children}</p>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 dark:border-emerald-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-emerald-900/10 rounded-r-md italic">
                        {children}
                      </blockquote>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-800 dark:text-slate-200">{children}</em>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-2 my-4 ml-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-2 my-4 ml-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-900 dark:text-white leading-7 flex items-start gap-3 ml-0">
                        <span className="text-blue-600 dark:text-emerald-400 font-bold select-none flex-shrink-0 mt-1">•</span>
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                    a: ({ children, href }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-400 dark:decoration-blue-500 underline-offset-2"
                      >
                        {children}
                      </a>
                    ),
                    hr: () => (
                      <hr className="my-6 border-gray-200 dark:border-slate-700" />
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-gray-200 dark:border-slate-700 rounded-lg">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-gray-50 dark:bg-slate-800">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }) => (
                      <tr>{children}</tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* File attachments for user messages */}
          {isUser && message.files && message.files.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium">Attached Files:</div>
              <div className="flex flex-wrap gap-2">
                {message.files.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg text-sm"
                  >
                    <div className="flex-shrink-0">
                      {file.type === 'application/pdf' ? (
                        <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                      ) : file.type.includes('word') ? (
                        <File className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <File className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium text-gray-900 dark:text-white">{file.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">
                        {(file.size / 1024).toFixed(1)} KB
                        {file.pages && file.pages > 1 && ` • ${file.pages} pages`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Reactions for AI messages - Show in response area */}
          {currentSession && !isUser && (
            <MessageReactions
              messageId={message.id}
              sessionId={currentSession.id}
              isAIMessage={!isUser}
            />
          )}

          {/* Action buttons */}
          {!isEditing && (
            <div className="mt-3 flex items-center gap-2">
              {/* Copy button for AI messages */}
              {!isUser && (
                <button
                  onClick={handleCopy}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-slate-700"
                  title="Copy message"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}

              {/* Branch button - available for all messages */}
              <button
                onClick={handleCreateBranch}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 px-2 py-1 text-xs text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30"
                title="Create branch from this message"
              >
                <GitBranch className="w-3 h-3" />
                <span>Branch</span>
              </button>
              
              {/* Edit button for user messages */}
              {isUser && onEdit && (
                <button
                  onClick={handleEdit}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-slate-700"
                  title="Edit message"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
