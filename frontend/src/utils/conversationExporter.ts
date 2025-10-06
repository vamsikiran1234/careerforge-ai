import type { ChatSession } from '@/store/chat';

interface ExportOptions {
  format: 'markdown' | 'txt' | 'pdf' | 'json';
  includeTimestamps?: boolean;
  includeSystemMessages?: boolean;
  title?: string;
}

export class ConversationExporter {
  
  static async exportSession(session: ChatSession, options: ExportOptions): Promise<void> {
    const { format, includeTimestamps = true, title } = options;
    
    const filename = `${title || session.title || 'conversation'}_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'markdown':
        await this.exportAsMarkdown(session, filename, includeTimestamps);
        break;
      case 'txt':
        await this.exportAsText(session, filename, includeTimestamps);
        break;
      case 'json':
        await this.exportAsJSON(session, filename);
        break;
      case 'pdf':
        await this.exportAsPDF(session, filename, includeTimestamps);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private static async exportAsMarkdown(session: ChatSession, filename: string, includeTimestamps: boolean): Promise<void> {
    let content = `# ${session.title || 'CareerForge AI Conversation'}\n\n`;
    
    // Add metadata
    content += `**Session Details:**\n`;
    content += `- Created: ${new Date(session.createdAt).toLocaleString()}\n`;
    content += `- Last Updated: ${new Date(session.updatedAt).toLocaleString()}\n`;
    content += `- Messages: ${session.messages.length}\n\n`;
    content += `---\n\n`;

    // Add messages
    session.messages.forEach((message, index) => {
      const timestamp = includeTimestamps ? ` *(${new Date(message.timestamp).toLocaleString()})*` : '';
      const role = message.role === 'user' ? '👤 **You**' : '🤖 **CareerForge AI**';
      
      content += `## ${role}${timestamp}\n\n`;
      
      // Handle file attachments
      if (message.files && message.files.length > 0) {
        content += `**Attachments:**\n`;
        message.files.forEach(file => {
          content += `- 📎 ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)\n`;
        });
        content += `\n`;
      }
      
      // Add message content
      content += `${message.content}\n\n`;
      
      if (index < session.messages.length - 1) {
        content += `---\n\n`;
      }
    });

    // Add footer
    content += `\n---\n\n`;
    content += `*Exported from CareerForge AI on ${new Date().toLocaleString()}*\n`;

    this.downloadFile(content, `${filename}.md`, 'text/markdown');
  }

  private static async exportAsText(session: ChatSession, filename: string, includeTimestamps: boolean): Promise<void> {
    let content = `${session.title || 'CareerForge AI Conversation'}\n`;
    content += `${'='.repeat(content.length - 1)}\n\n`;
    
    // Add metadata
    content += `Session Details:\n`;
    content += `Created: ${new Date(session.createdAt).toLocaleString()}\n`;
    content += `Last Updated: ${new Date(session.updatedAt).toLocaleString()}\n`;
    content += `Messages: ${session.messages.length}\n\n`;
    content += `${'-'.repeat(50)}\n\n`;

    // Add messages
    session.messages.forEach((message, index) => {
      const timestamp = includeTimestamps ? ` (${new Date(message.timestamp).toLocaleString()})` : '';
      const role = message.role === 'user' ? 'You' : 'CareerForge AI';
      
      content += `${role}${timestamp}:\n`;
      
      // Handle file attachments
      if (message.files && message.files.length > 0) {
        content += `\nAttachments:\n`;
        message.files.forEach(file => {
          content += `- ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)\n`;
        });
        content += `\n`;
      }
      
      // Add message content with proper text formatting (strip markdown)
      const cleanContent = message.content
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1')     // Italic
        .replace(/`(.*?)`/g, '$1')       // Code
        .replace(/#{1,6}\s/g, '')        // Headers
        .replace(/^\s*[-*+]\s/gm, '• '); // Lists
      
      content += `${cleanContent}\n\n`;
      
      if (index < session.messages.length - 1) {
        content += `${'-'.repeat(30)}\n\n`;
      }
    });

    // Add footer
    content += `\n${'='.repeat(50)}\n`;
    content += `Exported from CareerForge AI on ${new Date().toLocaleString()}\n`;

    this.downloadFile(content, `${filename}.txt`, 'text/plain');
  }

  private static async exportAsJSON(session: ChatSession, filename: string): Promise<void> {
    const exportData = {
      metadata: {
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        exportedAt: new Date().toISOString(),
        exportedBy: 'CareerForge AI'
      },
      session: {
        id: session.id,
        title: session.title,
        messages: session.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          files: msg.files || []
        })),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    };

    const content = JSON.stringify(exportData, null, 2);
    this.downloadFile(content, `${filename}.json`, 'application/json');
  }

  private static async exportAsPDF(session: ChatSession, _filename: string, includeTimestamps: boolean): Promise<void> {
    // For PDF export, we'll create HTML content and use the browser's print functionality
    // This is a lightweight solution that doesn't require external libraries
    
    const htmlContent = this.generateHTMLForPDF(session, includeTimestamps);
    
    // Create a new window with the content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site to export PDF.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Note: User will need to "Save as PDF" in the print dialog
      }, 500);
    };
  }

  private static generateHTMLForPDF(session: ChatSession, includeTimestamps: boolean): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${session.title || 'CareerForge AI Conversation'}</title>
        <meta charset="utf-8">
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
                line-height: 1.6;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
            }
            .metadata {
                background: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .message {
                margin-bottom: 25px;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .user-message {
                background: #dbeafe;
                border-left: 4px solid #3b82f6;
            }
            .ai-message {
                background: #d1fae5;
                border-left: 4px solid #10b981;
            }
            .message-header {
                font-weight: 600;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .timestamp {
                font-size: 0.875rem;
                color: #6b7280;
                font-weight: 400;
            }
            .attachments {
                margin: 10px 0;
                padding: 10px;
                background: rgba(0,0,0,0.05);
                border-radius: 6px;
                font-size: 0.875rem;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 0.875rem;
            }
            code {
                background: #f3f4f6;
                padding: 2px 4px;
                border-radius: 4px;
                font-family: Monaco, 'Cascadia Code', monospace;
            }
            pre {
                background: #f3f4f6;
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
                white-space: pre-wrap;
            }
            @media print {
                body { font-size: 12px; }
                .message { break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${session.title || 'CareerForge AI Conversation'}</h1>
        </div>
        
        <div class="metadata">
            <strong>Session Details:</strong><br>
            Created: ${new Date(session.createdAt).toLocaleString()}<br>
            Last Updated: ${new Date(session.updatedAt).toLocaleString()}<br>
            Messages: ${session.messages.length}
        </div>

        ${session.messages.map((message) => `
            <div class="message ${message.role === 'user' ? 'user-message' : 'ai-message'}">
                <div class="message-header">
                    <span>${message.role === 'user' ? '👤 You' : '🤖 CareerForge AI'}</span>
                    ${includeTimestamps ? `<span class="timestamp">${new Date(message.timestamp).toLocaleString()}</span>` : ''}
                </div>
                
                ${message.files && message.files.length > 0 ? `
                    <div class="attachments">
                        <strong>Attachments:</strong><br>
                        ${message.files.map(file => `📎 ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)`).join('<br>')}
                    </div>
                ` : ''}
                
                <div class="content">
                    ${message.content.replace(/\n/g, '<br>')}
                </div>
            </div>
        `).join('')}

        <div class="footer">
            Exported from CareerForge AI on ${new Date().toLocaleString()}
        </div>
    </body>
    </html>`;
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  static async exportMultipleSessions(sessions: ChatSession[], format: 'markdown' | 'txt' | 'json', options: Partial<ExportOptions> = {}): Promise<void> {
    if (sessions.length === 0) {
      throw new Error('No sessions selected for export');
    }

    if (sessions.length === 1) {
      return this.exportSession(sessions[0], { format, ...options });
    }

    // For multiple sessions, create a combined export
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `careerforge_conversations_${timestamp}`;

    if (format === 'json') {
      const combinedData = {
        metadata: {
          title: 'CareerForge AI Conversations Export',
          sessionsCount: sessions.length,
          totalMessages: sessions.reduce((sum, s) => sum + s.messages.length, 0),
          exportedAt: new Date().toISOString(),
          exportedBy: 'CareerForge AI'
        },
        sessions: sessions.map(session => ({
          id: session.id,
          title: session.title,
          messages: session.messages,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }))
      };

      const content = JSON.stringify(combinedData, null, 2);
      this.downloadFile(content, `${filename}.json`, 'application/json');
    } else {
      // For text/markdown, combine all sessions
      let combinedContent = format === 'markdown' 
        ? `# CareerForge AI Conversations Export\n\n**${sessions.length} conversations exported on ${new Date().toLocaleString()}**\n\n---\n\n`
        : `CareerForge AI Conversations Export\n${'='.repeat(40)}\n\n${sessions.length} conversations exported on ${new Date().toLocaleString()}\n\n`;

      sessions.forEach((session, index) => {
        if (format === 'markdown') {
          combinedContent += `## Session ${index + 1}: ${session.title || 'Untitled'}\n\n`;
          // Add session content...
        } else {
          combinedContent += `Session ${index + 1}: ${session.title || 'Untitled'}\n${'-'.repeat(30)}\n\n`;
          // Add session content...
        }
      });

      const mimeType = format === 'markdown' ? 'text/markdown' : 'text/plain';
      const extension = format === 'markdown' ? 'md' : 'txt';
      this.downloadFile(combinedContent, `${filename}.${extension}`, mimeType);
    }
  }
}

export default ConversationExporter;