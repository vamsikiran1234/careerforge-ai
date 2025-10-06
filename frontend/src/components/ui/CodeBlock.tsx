 import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, inline }) => {
  const [copied, setCopied] = useState(false);
  const language = className ? className.replace('language-', '') : 'text';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const getLanguageIcon = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'bash':
      case 'shell':
      case 'sh':
        return <Terminal className="w-4 h-4 text-gray-400" />;
      default:
        return <Code2 className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLanguageLabel = (lang: string) => {
    const languageMap: { [key: string]: string } = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript', 
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'sql': 'SQL',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'json': 'JSON',
      'yaml': 'YAML',
      'xml': 'XML',
      'bash': 'Bash',
      'shell': 'Shell',
      'sh': 'Shell',
      'text': 'Plain Text'
    };
    return languageMap[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  // Inline code - Professional styling
  if (inline) {
    return (
      <code className="bg-gray-100 px-2 py-0.5 rounded-md text-sm font-mono text-red-600 break-words border border-gray-200">
        {children}
      </code>
    );
  }

  // Block code with dark theme styling matching the first image
  return (
    <div className="relative my-4 overflow-hidden bg-gray-900 border border-gray-800 rounded-lg group">
      {/* Dark header with language indicator */}
      <div className="flex items-center justify-between bg-gray-800/80 px-4 py-2.5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {getLanguageIcon(language)}
          <span className="text-sm font-medium text-gray-300">
            {getLanguageLabel(language)}
          </span>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700/70 rounded-md transition-all duration-200 border border-gray-600 hover:border-gray-500"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content with dark theme */}
      <div className="relative">
        <SyntaxHighlighter
          language={language === 'text' ? 'bash' : language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            backgroundColor: '#0f172a',
            border: 'none',
            fontFamily: '"JetBrains Mono", "Fira Code", "Monaco", "Consolas", monospace',
          }}
          showLineNumbers={false}
          wrapLines={true}
          wrapLongLines={true}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};