import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, Paperclip, X, Target, Rocket, Brain, Star } from 'lucide-react';
import { CareerForgeAvatar } from '@/components/ui/CareerForgeAvatar';
import { Button } from '@/components/ui/Button';
import SlashCommandDropdown from './SlashCommandDropdown';
import type { SlashCommand } from '@/data/slashCommands';

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface MessageInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  isTyping?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading = false,
  isTyping = false,
  placeholder = "Ask me anything about your career...",
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Slash command state
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashCommandQuery, setSlashCommandQuery] = useState('');
  const [slashCommandPosition, setSlashCommandPosition] = useState({ top: 0, left: 0 });
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = message.trim();
    if ((trimmedMessage || uploadedFiles.length > 0) && !isLoading) {
      onSendMessage(trimmedMessage || "Please analyze these files", uploadedFiles);
      setMessage('');
      setUploadedFiles([]); // Clear uploaded files after sending
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, uploadedFiles, onSendMessage, isLoading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle slash command navigation
    if (showSlashCommands) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashCommands(false);
        setSlashCommandQuery('');
        return;
      }
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => Math.min(prev + 1, 9)); // Limit to visible commands
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        // This will be handled by the slash command selection
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showSlashCommands) {
        // Handle slash command selection - will be implemented
        setShowSlashCommands(false);
      } else {
        handleSendMessage();
      }
    }
  }, [handleSendMessage, showSlashCommands, selectedCommandIndex]);

  // Handle message input changes and slash command detection
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Check for slash commands
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    // Check if current line starts with '/' and is at the beginning or after whitespace
    const slashMatch = currentLine.match(/(?:^|\s)(\/\w*)$/);
    
    if (slashMatch) {
      const commandText = slashMatch[1];
      setSlashCommandQuery(commandText);
      setSelectedCommandIndex(0);
      
      // Calculate position for dropdown
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        
        setSlashCommandPosition({
          top: rect.top - 300, // Position above the textarea
          left: rect.left + 10
        });
        setShowSlashCommands(true);
      }
    } else {
      setShowSlashCommands(false);
      setSlashCommandQuery('');
    }
  }, []);

  // Handle slash command selection
  const handleSlashCommandSelect = useCallback((command: SlashCommand) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = message.substring(0, cursorPosition);
    const textAfterCursor = message.substring(cursorPosition);
    
    // Find the slash command in the text and replace it
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    const slashMatch = currentLine.match(/(?:^|\s)(\/\w*)$/);
    
    if (slashMatch) {
      const beforeSlash = currentLine.substring(0, currentLine.lastIndexOf(slashMatch[1]));
      const newCurrentLine = beforeSlash + command.prompt;
      lines[lines.length - 1] = newCurrentLine;
      
      const newMessage = lines.join('\n') + textAfterCursor;
      setMessage(newMessage);
    }
    
    setShowSlashCommands(false);
    setSlashCommandQuery('');
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [message]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Voice recording functionality with real speech recognition
  const startRecording = async () => {
    try {
      // Check if speech recognition is available
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in your browser. Please type your message instead.');
        return;
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up MediaRecorder for audio feedback
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      // Set up speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update message with final transcript
        if (finalTranscript) {
          setMessage(prev => {
            const newMessage = prev + (prev ? ' ' : '') + finalTranscript;
            return newMessage;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        
        switch(event.error) {
          case 'no-speech':
            alert('No speech detected. Please try again.');
            break;
          case 'network':
            alert('Network error occurred during speech recognition.');
            break;
          case 'not-allowed':
            alert('Microphone access denied. Please allow microphone access and try again.');
            break;
          default:
            alert('Speech recognition error. Please try again.');
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      };

      // Start both recording and speech recognition
      mediaRecorder.start();
      recognition.start();

      // Store recognition instance for cleanup
      (mediaRecorderRef.current as any).speechRecognition = recognition;

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check your permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Stop speech recognition
      const speechRecognition = (mediaRecorderRef.current as any).speechRecognition;
      if (speechRecognition) {
        speechRecognition.stop();
      }
      
      // Stop media recorder
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      
      // Use Web Speech API for real-time speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // We already have the transcribed text from the real-time recognition
        // This function is called after recording stops, so we don't need to do anything here
        console.log('Speech recognition completed');
      } else {
        alert('Speech recognition is not supported in your browser. Please type your message instead.');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // File upload functionality with image support
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      // Filter for supported file types including images
      const supportedTypes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/csv',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
      ];
      
      const validFiles = newFiles.filter(file => {
        const isValidType = supportedTypes.includes(file.type);
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        return isValidType && isValidSize;
      });
      
      if (validFiles.length !== newFiles.length) {
        alert('Some files were skipped. Only PDF, Word, text, CSV, and image files under 10MB are supported.');
      }
      
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
    
    // Clear the file input for potential re-upload of same file
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle paste events for images
  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if the pasted item is an image
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          // Create a unique filename
          const timestamp = Date.now();
          const extension = file.type.split('/')[1] || 'png';
          const fileName = `pasted-image-${timestamp}.${extension}`;
          
          // Create a new File object with proper name
          const namedFile = new File([file], fileName, { type: file.type });
          
          // Add to uploaded files
          setUploadedFiles(prev => [...prev, namedFile]);
        }
      }
    }
  }, []);

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Check if file is an image
  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  // Create image preview URL
  const createImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const quickPrompts = [
    { icon: Target, text: "Set career goals", prompt: "Help me set clear and achievable career goals for the next 2 years" },
    { icon: Rocket, text: "Resume review", prompt: "Please review my resume and suggest improvements" },
    { icon: Brain, text: "Skill gaps", prompt: "What skills should I develop to advance in my career?" },
    { icon: Star, text: "Interview prep", prompt: "Help me prepare for upcoming job interviews" },
  ];

  return (
    <div className="bg-gradient-to-r from-white/90 via-blue-50/50 to-indigo-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-t border-indigo-100/50 dark:border-slate-700">
      {/* Message Input - Responsive */}
      <div className="px-4 py-2 lg:px-6 lg:py-2">
        {/* Uploaded Files Display with Image Previews */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                {isImageFile(file) ? (
                  // Image preview
                  <div className="relative">
                    <img
                      src={createImagePreview(file)}
                      alt={file.name}
                      className="object-cover w-20 h-20 transition-colors border-2 border-blue-200 rounded-lg lg:w-24 lg:h-24 hover:border-blue-400"
                    />
                    <div className="absolute inset-0 transition-all duration-200 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-20" />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute flex items-center justify-center w-6 h-6 text-white transition-opacity duration-200 bg-red-500 rounded-full shadow-lg opacity-0 -top-2 -right-2 hover:bg-red-600 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute px-2 py-1 text-xs text-white truncate transition-opacity duration-200 bg-black rounded opacity-0 bottom-1 left-1 right-1 bg-opacity-70 group-hover:opacity-100">
                      {file.name}
                    </div>
                  </div>
                ) : (
                  // Regular file display
                  <div className="flex items-center gap-2 px-3 py-2 transition-colors border border-blue-200 rounded-lg bg-blue-50 hover:border-blue-400">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800 truncate max-w-32">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-2 text-blue-600 transition-colors hover:text-red-600"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={`relative flex items-end gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm ${
          isFocused 
            ? 'border-blue-500 dark:border-emerald-500 shadow-lg shadow-blue-500/10 dark:shadow-emerald-500/10 bg-white dark:bg-slate-800/80' 
            : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-emerald-400 bg-white dark:bg-slate-800/50 hover:shadow-md'
        }`}>
          
          {/* AI Status Indicator */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center transition-all duration-300 ${
              isTyping 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                : 'bg-gradient-to-br from-slate-400 to-slate-500'
            }`}>
              {isTyping ? (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-white rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-white rounded-full animate-bounce delay-100"></div>
                  <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-white rounded-full animate-bounce delay-200"></div>
                </div>
              ) : (
                <CareerForgeAvatar size="sm" showGradient={false} className="bg-transparent" />
              )}
            </div>
          </div>

          {/* Text Input */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isTyping ? "AI is thinking..." : placeholder}
              disabled={isLoading || isTyping}
              className="w-full resize-none bg-transparent border-0 outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-300 text-sm lg:text-base leading-5 lg:leading-6 min-h-[20px] lg:min-h-[24px] max-h-[200px] lg:max-h-[300px] disabled:opacity-50"
              rows={1}
            />
            
            {/* Character count and status - Responsive */}
            <div className="absolute right-0 flex items-center gap-2 text-xs -bottom-5 lg:-bottom-6 text-slate-400 dark:text-gray-300">
              {message.length > 0 && (
                <span className={`hidden sm:inline ${message.length > 50000 ? 'text-red-500' : message.length > 45000 ? 'text-orange-500' : ''}`}>
                  {message.length > 1000 ? `${(message.length / 1000).toFixed(1)}k` : message.length}{message.length <= 1000 ? '/50k' : ''}
                </span>
              )}
              {(isLoading || isTyping) && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-blue-600">
                    {isTyping ? 'Thinking...' : 'Sending...'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Responsive */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Attachment Button - Hidden on mobile */}
            <button
              type="button"
              onClick={handleFileButtonClick}
              className="hidden p-2 transition-all duration-200 rounded-lg sm:block text-slate-400 hover:text-blue-600 hover:bg-blue-100 lg:rounded-xl"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            
            {/* Hidden file input with image support */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.svg,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Voice Button - Hidden on mobile */}
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isLoading || isTyping || isTranscribing}
              className={`hidden sm:block p-2 rounded-lg lg:rounded-xl transition-all duration-200 ${
                isRecording 
                  ? 'text-red-600 bg-red-100 animate-pulse' 
                  : isTranscribing
                  ? 'text-yellow-600 bg-yellow-100'
                  : 'text-slate-400 hover:text-green-600 hover:bg-green-100'
              }`}
              title={isRecording ? "Stop recording" : isTranscribing ? "Transcribing..." : "Voice input"}
            >
              <Mic className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading || isTyping}
              className={`p-2 lg:p-3 rounded-lg lg:rounded-xl font-semibold transition-all duration-200 border-0 ${
                message.trim() && !isLoading && !isTyping
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-green-600 dark:to-green-700 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg'
                  : 'bg-slate-200 dark:bg-gray-600 text-slate-400 dark:text-gray-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white rounded-full animate-spin lg:w-5 lg:h-5 border-t-transparent"></div>
              ) : (
                <Send className="w-4 h-4 lg:w-5 lg:h-5" />
              )}
            </Button>
          </div>
        </div>



        {/* Slash Command Dropdown */}
        <SlashCommandDropdown
          isOpen={showSlashCommands}
          query={slashCommandQuery}
          position={slashCommandPosition}
          onSelectCommand={handleSlashCommandSelect}
          selectedIndex={selectedCommandIndex}
        />
      </div>
    </div>
  );
};
