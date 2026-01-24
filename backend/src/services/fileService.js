const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow PDF, text files, documents, and image formats
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    // Image formats
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word documents, text files, CSV files, and images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  }
});

/**
 * Extract text content from uploaded files
 */
const extractFileContent = async (filePath, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      // Extract text from PDF
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdf(dataBuffer);
      return {
        text: pdfData.text,
        pages: pdfData.numpages,
        metadata: pdfData.info
      };
    } else if (mimeType === 'text/plain' || mimeType === 'text/csv') {
      // Extract text from text files
      const text = await fs.readFile(filePath, 'utf8');
      return {
        text: text,
        pages: 1,
        metadata: {}
      };
    } else {
      // For other document types, return placeholder for now
      // In production, you might want to use libraries like mammoth for DOCX
      return {
        text: 'Document content extraction not yet supported for this file type.',
        pages: 1,
        metadata: {}
      };
    }
  } catch (error) {
    console.error('Error extracting file content:', error);
    throw new Error('Failed to extract content from file');
  }
};

/**
 * Process uploaded files and extract their content
 */
const processUploadedFiles = async (files) => {
  const processedFiles = [];
  
  for (const file of files) {
    try {
      const content = await extractFileContent(file.path, file.mimetype);
      
      processedFiles.push({
        filename: file.originalname,
        size: file.size,
        type: file.mimetype,
        content: content.text,
        pages: content.pages,
        metadata: content.metadata,
        uploadedAt: new Date().toISOString()
      });
      
      // Clean up uploaded file after processing
      await fs.unlink(file.path);
    } catch (error) {
      console.error(`Error processing file ${file.originalname}:`, error);
      // Try to clean up file even if processing failed
      try {
        await fs.unlink(file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
  }
  
  return processedFiles;
};

/**
 * Truncate text to fit within token limits
 */
const truncateText = (text, maxChars = 3000) => {
  if (text.length <= maxChars) {
    return text;
  }
  
  // Try to truncate at a sentence boundary
  const truncated = text.substring(0, maxChars);
  const lastSentence = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  
  // Use the latest sentence or newline boundary
  const cutPoint = Math.max(lastSentence, lastNewline);
  
  if (cutPoint > maxChars * 0.8) {
    return text.substring(0, cutPoint + 1) + '\n\n[Content truncated to fit token limits...]';
  }
  
  // If no good boundary found, just cut at the character limit
  return text.substring(0, maxChars) + '\n\n[Content truncated to fit token limits...]';
};

/**
 * Create context from uploaded files for AI analysis
 */
const createFileContext = (processedFiles) => {
  if (!processedFiles || processedFiles.length === 0) {
    return '';
  }
  
  let context = '\n\n--- UPLOADED DOCUMENTS ---\n';
  
  processedFiles.forEach((file, index) => {
    context += `\nDocument ${index + 1}: ${file.filename}\n`;
    context += `Type: ${file.type}\n`;
    context += `Size: ${(file.size / 1024).toFixed(2)} KB\n`;
    if (file.pages > 1) {
      context += `Pages: ${file.pages}\n`;
    }
    
    // Truncate content to prevent token limit issues
    const truncatedContent = truncateText(file.content, 2500);
    context += `Content:\n${truncatedContent}\n`;
    context += '---\n';
  });
  
  return context;
};

module.exports = {
  upload,
  extractFileContent,
  processUploadedFiles,
  createFileContext,
  truncateText
};