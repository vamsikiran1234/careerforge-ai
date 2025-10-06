import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, Calendar, FileText, MessageSquare } from 'lucide-react';
import { useChatStore } from '@/store/chat';

interface SearchBarProps {
  onSelectSession: (sessionId: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectSession }) => {
  const { 
    searchQuery, 
    searchResults, 
    isSearching, 
    searchSessions, 
    clearSearch 
  } = useChatStore();
  
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all', // all, today, week, month
    messageType: 'all', // all, user, ai
    hasFiles: false,
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        searchSessions(localQuery);
        setShowResults(localQuery.trim().length > 0);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, searchSessions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    clearSearch();
    setShowResults(false);
  };

  const handleSelectResult = useCallback((sessionId: string) => {
    onSelectSession(sessionId);
    setShowResults(false);
  }, [onSelectSession]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getMatchingMessages = (session: any, query: string) => {
    if (!query.trim()) return [];
    
    return session.messages
      .filter((msg: any) => 
        msg.content.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 2); // Show max 2 matching messages
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
          />
          {localQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Loading */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-500 dark:text-slate-400 px-3 py-2 border-b border-gray-100 dark:border-slate-700">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </div>
              {searchResults.map((session) => {
                const matchingMessages = getMatchingMessages(session, localQuery);
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectResult(session.id)}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-50 dark:border-slate-700 last:border-b-0 transition-colors"
                  >
                    {/* Session Title */}
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-blue-500 dark:text-emerald-500" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                        {highlightMatch(session.title || 'Career Chat Session', localQuery)}
                      </h4>
                    </div>

                    {/* Session Info */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </span>
                      <span>{session.messages.length} messages</span>
                      {session.messages.some((m: any) => m.files?.length > 0) && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Files
                        </span>
                      )}
                    </div>

                    {/* Matching Messages Preview */}
                    {matchingMessages.length > 0 && (
                      <div className="space-y-1">
                        {matchingMessages.map((message: any, idx: number) => (
                          <div key={idx} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                            <span className={`font-medium ${
                              message.role === 'user' ? 'text-blue-600' : 'text-green-600'
                            }`}>
                              {message.role === 'user' ? 'You' : 'AI'}:
                            </span>
                            <span className="ml-1">
                              {highlightMatch(
                                message.content.length > 100 
                                  ? message.content.substring(0, 100) + '...' 
                                  : message.content,
                                localQuery
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : localQuery.trim() && !isSearching ? (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No conversations found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Search Filters (Future Enhancement) */}
      {showResults && searchResults.length > 0 && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <Filter className="w-3 h-3" />
            <span>Filters</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <button className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 transition-colors">
              Recent
            </button>
            <button className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 transition-colors">
              With Files
            </button>
            <button className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 transition-colors">
              This Week
            </button>
          </div>
        </div>
      )}
    </div>
  );
};