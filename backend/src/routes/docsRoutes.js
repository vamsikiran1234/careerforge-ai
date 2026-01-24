const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '../../docs/api/openapi.yaml');
const openApiSpec = fs.existsSync(openApiPath) 
  ? YAML.load(openApiPath) 
  : { openapi: '3.0.0', info: { title: 'CareerForge AI API', version: '1.0.0' }, paths: {} };

// Swagger UI options
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    url: '/api/v1/docs/openapi.json',
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    displayOperationId: false,
    tryItOutEnabled: true
  },
  customSiteTitle: 'CareerForge AI API Documentation',
  customfavIcon: '/favicon.ico',
  customCss: `
    .swagger-ui .topbar { 
      background-color: #2563eb; 
    }
    .swagger-ui .topbar .download-url-wrapper { 
      display: none; 
    }
    .swagger-ui .info .title {
      color: #1e40af;
    }
    .swagger-ui .scheme-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .swagger-ui .btn.authorize {
      background-color: #059669;
      border-color: #059669;
    }
    .swagger-ui .btn.authorize:hover {
      background-color: #047857;
      border-color: #047857;
    }
    .swagger-ui .opblock-summary-description {
      font-weight: 500;
    }
    .swagger-ui .opblock.opblock-get .opblock-summary {
      border-color: #10b981;
    }
    .swagger-ui .opblock.opblock-post .opblock-summary {
      border-color: #3b82f6;
    }
    .swagger-ui .opblock.opblock-put .opblock-summary {
      border-color: #f59e0b;
    }
    .swagger-ui .opblock.opblock-delete .opblock-summary {
      border-color: #ef4444;
    }
    .swagger-ui .model-box {
      background: #f8fafc;
    }
    .swagger-ui .model .model-title {
      color: #374151;
    }
    .swagger-ui .highlight-code .microlight {
      background: #1f2937;
    }
  `
};

// Serve OpenAPI spec as JSON
router.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Serve Swagger UI
router.use('/ui', swaggerUi.serve);
router.get('/ui', swaggerUi.setup(openApiSpec, swaggerOptions));

// Serve ReDoc alternative
router.get('/redoc', (req, res) => {
  const redocHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CareerForge AI API Documentation</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <redoc spec-url='/api/v1/docs/openapi.json'></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
      </body>
    </html>
  `;
  res.send(redocHTML);
});

// Serve getting started guide
router.get('/guides/getting-started', (req, res) => {
  try {
    const gettingStartedPath = path.join(__dirname, '../../docs/guides/getting-started.md');
    const markdownContent = fs.readFileSync(gettingStartedPath, 'utf8');
    
    // Convert markdown to HTML (simple conversion)
    const htmlContent = markdownContent
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/\n/g, '<br>');
    
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Getting Started - CareerForge AI API</title>
          <style>
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6; 
                  color: #374151;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 2rem;
                  background: #f9fafb;
              }
              h1, h2, h3, h4 { color: #1f2937; margin-top: 2rem; }
              h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; }
              code { 
                  background: #f3f4f6; 
                  padding: 0.25rem 0.5rem; 
                  border-radius: 0.25rem; 
                  font-family: 'Courier New', monospace;
              }
              pre { 
                  background: #1f2937; 
                  color: #f9fafb; 
                  padding: 1rem; 
                  border-radius: 0.5rem; 
                  overflow-x: auto;
                  margin: 1rem 0;
              }
              pre code { 
                  background: transparent; 
                  color: inherit; 
                  padding: 0; 
              }
              .back-link {
                  display: inline-block;
                  margin-bottom: 2rem;
                  color: #3b82f6;
                  text-decoration: none;
                  font-weight: 500;
              }
              .back-link:hover { text-decoration: underline; }
          </style>
      </head>
      <body>
          <a href="/api/v1/docs" class="back-link">← Back to Documentation</a>
          ${htmlContent}
      </body>
      </html>
    `;
    
    res.send(fullHTML);
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: 'Getting started guide not found',
      error: error.message
    });
  }
});

// API documentation index page
router.get('/', (req, res) => {
  const indexHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CareerForge AI API Documentation</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6; 
                color: #374151;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 2rem;
            }
            .header {
                text-align: center;
                color: white;
                margin-bottom: 3rem;
            }
            .header h1 {
                font-size: 3rem;
                margin-bottom: 1rem;
                font-weight: 700;
            }
            .header p {
                font-size: 1.25rem;
                opacity: 0.9;
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }
            .card {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            }
            .card h3 {
                color: #1e40af;
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            .card p {
                color: #6b7280;
                margin-bottom: 1.5rem;
            }
            .btn {
                display: inline-block;
                padding: 0.75rem 1.5rem;
                background: #2563eb;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 500;
                transition: background 0.2s;
            }
            .btn:hover {
                background: #1d4ed8;
            }
            .btn.secondary {
                background: #059669;
            }
            .btn.secondary:hover {
                background: #047857;
            }
            .features {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            .features h2 {
                color: #1e40af;
                margin-bottom: 1.5rem;
                text-align: center;
            }
            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
            }
            .feature {
                text-align: center;
                padding: 1rem;
            }
            .feature-icon {
                font-size: 2.5rem;
                margin-bottom: 1rem;
            }
            .feature h4 {
                color: #374151;
                margin-bottom: 0.5rem;
            }
            .footer {
                text-align: center;
                color: white;
                margin-top: 3rem;
                opacity: 0.8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 CareerForge AI API</h1>
                <p>Powerful AI-driven career guidance, skill assessments, and mentor matching</p>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>📖 Interactive Documentation</h3>
                    <p>Explore our API with Swagger UI. Test endpoints directly in your browser with real-time examples.</p>
                    <a href="/api/v1/docs/ui" class="btn">Open Swagger UI</a>
                </div>
                
                <div class="card">
                    <h3>📋 ReDoc Documentation</h3>
                    <p>Beautiful, responsive API documentation with detailed schemas and examples.</p>
                    <a href="/api/v1/docs/redoc" class="btn secondary">Open ReDoc</a>
                </div>
                
                <div class="card">
                    <h3>� Getting Started Guide</h3>
                    <p>Quick start guide with examples and best practices to get you up and running.</p>
                    <a href="/api/v1/docs/guides/getting-started" class="btn">View Guide</a>
                </div>
                
                <div class="card">
                    <h3>�📁 OpenAPI Specification</h3>
                    <p>Download the complete OpenAPI 3.0 specification for code generation and tooling.</p>
                    <a href="/api/v1/docs/openapi.json" class="btn">Download JSON</a>
                </div>
            </div>
            
            <div class="features">
                <h2>API Features</h2>
                <div class="feature-grid">
                    <div class="feature">
                        <div class="feature-icon">🤖</div>
                        <h4>AI-Powered Chat</h4>
                        <p>Get personalized career guidance using advanced AI</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">📝</div>
                        <h4>Adaptive Quizzes</h4>
                        <p>Dynamic career assessments that adapt to responses</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">👨‍🏫</div>
                        <h4>Mentor Matching</h4>
                        <p>AI-powered mentor discovery and compatibility scoring</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🔒</div>
                        <h4>Enterprise Security</h4>
                        <p>Multi-tier rate limiting and comprehensive validation</p>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>© 2025 CareerForge AI. Built with ❤️ for developers.</p>
                <p>Need help? Check the Getting Started guide or API documentation above.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  res.send(indexHTML);
});

module.exports = router;
