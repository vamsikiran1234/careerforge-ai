import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { keyboardShortcuts } from '@/data/slashCommands';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'General',
      shortcuts: keyboardShortcuts.filter(s => 
        ['new-chat', 'search', 'escape'].includes(s.action)
      )
    },
    {
      title: 'Features',
      shortcuts: keyboardShortcuts.filter(s => 
        ['templates', 'export'].includes(s.action)
      )
    },
    {
      title: 'Messaging',
      shortcuts: keyboardShortcuts.filter(s => 
        ['send', 'slash-command'].includes(s.action)
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-600">Navigate CareerForge AI like a pro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Command className="w-4 h-4 mr-2 text-purple-600" />
                  {group.title}
                </h3>
                
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.action}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-700">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-mono font-medium text-gray-800 shadow-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Slash Commands Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Command className="w-4 h-4 mr-2 text-purple-600" />
                Slash Commands
              </h3>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                <p className="text-gray-700 mb-3">
                  Type <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">/</kbd> in the message input to see available commands:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-purple-600">/resume</code>
                    <span>Resume review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-purple-600">/interview</code>
                    <span>Interview prep</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-purple-600">/salary</code>
                    <span>Salary research</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-purple-600">/goals</code>
                    <span>Career planning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-purple-600">/help</code>
                    <span>All commands</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">and more...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Ctrl+Enter</kbd> to send messages while typing</li>
                <li>• Press <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Escape</kbd> to quickly close any open dialog</li>
                <li>• Slash commands work anywhere in your message, not just at the start</li>
                <li>• Use arrow keys to navigate through slash command suggestions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Escape</kbd> or click outside to close</span>
            <span>More shortcuts coming soon!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsDialog;