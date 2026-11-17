import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Check, FileText, Edit, GitBranch } from 'lucide-react';
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

  // USER MESSAGE - Right-aligned sleek dark card
  if (isUser) {
    return (
      <div className="group py-2 px-1">
        <div className="max-w-3xl mx-auto flex justify-end">
          <div className="max-w-2xl bg-[#151924] border border-white/[0.1] rounded-2xl px-5 py-3.5 shadow-lg text-zinc-100">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                You
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-3 mt-2">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-3 border border-white/20 rounded-xl resize-none min-h-[90px] focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-[#0d0f17] text-white text-sm"
                  placeholder="Edit your message..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-cyan-600 text-white rounded-lg text-xs font-medium hover:bg-cyan-500 transition-colors shadow-sm"
                  >
                    Save & Resend
                  </button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words text-sm text-zinc-100 leading-relaxed">
                {message.content}
              </div>
            )}

            {/* Attached Files */}
            {message.files && message.files.length > 0 && (
              <div className="mt-3 pt-2 border-t border-white/[0.08] flex flex-wrap gap-2">
                {message.files.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#10131d] border border-white/10 rounded-lg text-xs text-zinc-300"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate max-w-[140px] font-medium">{file.name}</span>
                    <span className="text-[10px] text-zinc-500">({(file.size / 1024).toFixed(0)}KB)</span>
                  </div>
                ))}
              </div>
            )}

            {/* Edit button */}
            {!isEditing && onEdit && (
              <div className="mt-2 pt-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleEdit}
                  className="text-[11px] text-zinc-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                  title="Edit prompt"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ASSISTANT MESSAGE - Left-aligned card with dark markdown and reactions
  return (
    <div className="group py-2 px-1">
      <div className="max-w-3xl mx-auto bg-[#10131d]/90 border border-white/[0.08] rounded-2xl p-5 shadow-xl flex gap-3.5 sm:gap-4 backdrop-blur-md">
        {/* Glowing Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          <CareerForgeAvatar size="sm" showGradient={true} className="w-8 h-8 rounded-xl shadow-md shadow-cyan-500/20" />
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-white text-sm">CareerForge AI</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-auto">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
          </div>
          
          <div className="prose prose-invert prose-base max-w-none text-zinc-200 leading-relaxed font-normal">
            <ReactMarkdown
              components={{
                code: ({ className, children }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const inline = !match;
                  return !inline ? (
                    <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                      <CodeBlock className={className}>
                        {String(children).replace(/\n$/, '')}
                      </CodeBlock>
                    </div>
                  ) : (
                    <code className="px-1.5 py-0.5 bg-[#171b28] text-cyan-300 rounded text-xs font-mono border border-white/10">
                      {String(children)}
                    </code>
                  );
                },
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mb-3 mt-5 text-white border-b border-white/10 pb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mb-2.5 mt-4 text-white">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mb-2 mt-3.5 text-cyan-300">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-sm font-semibold mb-1.5 mt-2.5 text-zinc-200">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="mb-3 text-zinc-200 leading-7 text-sm">{children}</p>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-cyan-500 pl-4 py-1.5 my-3 bg-cyan-950/20 text-zinc-300 rounded-r-lg italic text-sm">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1.5 my-3 ml-1 text-sm">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-1.5 my-3 ml-1 list-decimal list-inside text-sm">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-zinc-200 leading-6 flex items-start gap-2.5">
                    <span className="text-cyan-400 font-bold select-none mt-0.5">•</span>
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                  >
                    {children}
                  </a>
                ),
                hr: () => (
                  <hr className="my-5 border-white/10" />
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 rounded-xl border border-white/10">
                    <table className="min-w-full text-xs">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-[#151926] text-zinc-300">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-white/[0.06] bg-[#0d1017]">
                    {children}
                  </tbody>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left font-semibold text-white border-b border-white/10">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 text-zinc-300">
                    {children}
                  </td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Reactions */}
          {currentSession && (
            <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <MessageReactions
                messageId={message.id}
                sessionId={currentSession.id}
                isAIMessage={true}
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors text-xs flex items-center gap-1"
                  title="Copy response"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] text-cyan-400 font-mono">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCreateBranch}
                  className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.08] rounded-lg transition-colors text-xs flex items-center gap-1"
                  title="Branch conversation"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Branch</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
