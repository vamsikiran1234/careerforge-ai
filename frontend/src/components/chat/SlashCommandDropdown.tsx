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

const categoryColors = {
  career: 'text-purple-600 bg-purple-50',
  resume: 'text-blue-600 bg-blue-50',
  interview: 'text-green-600 bg-green-50',
  salary: 'text-yellow-600 bg-yellow-50',
  skills: 'text-teal-600 bg-teal-50',
  networking: 'text-indigo-600 bg-indigo-50',
  general: 'text-gray-600 bg-gray-50'
} as const;

const SlashCommandDropdown: React.FC<SlashCommandDropdownProps> = ({
  isOpen,
  query,
  position,
  onSelectCommand,
  selectedIndex
}) => {
  if (!isOpen) return null;

  // Parse the query to get the command part
  const commandQuery = query.replace(/^\//, '').toLowerCase();
  
  // Get filtered commands
  const filteredCommands = commandQuery 
    ? searchCommands(commandQuery)
    : slashCommands.slice(0, 10); // Show first 10 commands by default

  if (filteredCommands.length === 0) {
    return (
      <div 
        className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-80 max-w-96"
        style={{ 
          top: position.top,
          left: position.left,
          maxHeight: '300px',
          overflow: 'auto'
        }}
      >
        <div className="p-4 text-center text-gray-500">
          <Command className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No commands found</p>
          <p className="text-xs text-gray-400 mt-1">Try typing /help to see all available commands</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl min-w-80 max-w-96"
      style={{ 
        top: position.top,
        left: position.left,
        maxHeight: '400px',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Command className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Slash Commands</span>
          <span className="text-xs text-gray-500">({filteredCommands.length})</span>
        </div>
      </div>

      {/* Commands List */}
      <div className="py-2">
        {filteredCommands.map((command, index) => (
          <button
            key={command.id}
            onClick={() => onSelectCommand(command)}
            className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-500 ${
              index === selectedIndex ? 'bg-blue-50 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Command Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-lg">{command.icon}</span>
              </div>

              {/* Command Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <code className="text-sm font-mono font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    {command.command}
                  </code>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[command.category]}`}>
                    {command.category}
                  </span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {command.title}
                </h4>
                
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {command.description}
                </p>

                {/* Keywords */}
                {command.keywords.slice(0, 3).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {command.keywords.slice(0, 3).map((keyword) => (
                      <span key={keyword} className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {keyword}
                      </span>
                    ))}
                    {command.keywords.length > 3 && (
                      <span className="text-xs text-gray-400">+{command.keywords.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>↑↓ Navigate</span>
            <span>⏎ Select</span>
            <span>Esc Cancel</span>
          </div>
          <span>/help for all commands</span>
        </div>
      </div>
    </div>
  );
};

export default SlashCommandDropdown;