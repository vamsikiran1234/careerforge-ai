import React from 'react';
import { Command } from 'lucide-react';
import { slashCommands, searchCommands } from '@/data/slashCommands';
import type { SlashCommand } from '@/data/slashCommands';

interface SlashCommandDropdownProps {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  onSelectCommand: (command: SlashCommand) => void;
  selectedIndex: number;
}

const SlashCommandDropdown: React.FC<SlashCommandDropdownProps> = ({
  isOpen,
  query,
  position,
  onSelectCommand,
  selectedIndex
}) => {
  if (!isOpen) return null;

  const commandQuery = query.replace(/^\//, '').toLowerCase();
  const filteredCommands = commandQuery 
    ? searchCommands(commandQuery)
    : slashCommands.slice(0, 10);

  if (filteredCommands.length === 0) {
    return (
      <div 
        className="absolute z-50 bg-[#121622] border border-white/10 rounded-xl shadow-2xl min-w-80 max-w-96 text-white"
        style={{ 
          top: position.top,
          left: position.left,
          maxHeight: '300px',
          overflow: 'auto'
        }}
      >
        <div className="p-4 text-center text-zinc-400">
          <Command className="w-5 h-5 mx-auto mb-2 text-cyan-400" />
          <p className="text-sm font-medium">No commands found</p>
          <p className="text-xs text-zinc-500 mt-1">Try typing / to see all available career commands</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute z-50 bg-[#121622] border border-white/10 rounded-xl shadow-2xl min-w-80 max-w-96 text-white overflow-hidden"
      style={{ 
        top: position.top,
        left: position.left,
        maxHeight: '400px',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div className="p-2.5 border-b border-white/[0.08] bg-[#0d1017]">
        <div className="flex items-center space-x-2">
          <Command className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-white">Career Commands</span>
          <span className="text-[10px] text-zinc-500">({filteredCommands.length})</span>
        </div>
      </div>

      {/* Commands List */}
      <div className="py-1">
        {filteredCommands.map((command, index) => (
          <button
            key={command.id}
            onClick={() => onSelectCommand(command)}
            className={`w-full text-left px-3.5 py-2.5 hover:bg-white/[0.06] transition-colors border-l-2 border-transparent hover:border-cyan-400 ${
              index === selectedIndex ? 'bg-cyan-500/10 border-cyan-400' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-base">{command.icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-0.5">
                  <code className="text-xs font-mono font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                    {command.command}
                  </code>
                </div>
                
                <h4 className="text-xs font-medium text-white truncate">
                  {command.title}
                </h4>
                
                <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                  {command.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-white/[0.08] bg-[#0d1017]">
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>⏎ Select</span>
            <span>Esc Cancel</span>
          </div>
          <span className="text-zinc-500 font-mono text-[10px]">Commands</span>
        </div>
      </div>
    </div>
  );
};

export default SlashCommandDropdown;
