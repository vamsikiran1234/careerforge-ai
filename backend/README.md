# CareerForge AI - Backend

Node.js + Express backend with AI integration, real-time chat, and PostgreSQL database.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

## Environment Variables

Create `.env` file with:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/careerforge

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# AI Provider (Groq - Free & Fast)
GROQ_API_KEY=your-groq-api-key

# Server
PORT=3000
NODE_ENV=development

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run lint` - Check code style
- `npm run format` - Format code with Prettier

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utilities
│   ├── workers/        # Background jobs
│   ├── app.js          # Express app
│   └── server.js       # Entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── tests/              # Test files
└── package.json        # Dependencies
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/chat` - AI chat
- `POST /api/v1/quiz/start` - Start quiz
- `GET /api/v1/mentors` - List mentors
- And more...

## Tech Stack

- Node.js 18+
- Express.js
- Prisma ORM
- PostgreSQL / SQLite
- Groq AI (Lightning Fast AI)
- JWT Authentication
- Jest (Testing)

## Database

Using Prisma ORM with PostgreSQL (production) or SQLite (development).

```bash
# Generate Prisma client
npm run db:generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- health.test.js

# Coverage report
npm run test:coverage
```

## Deployment

See deployment scripts in `../scripts/deployment/`

- Railway: `railway up`
- Heroku: `git push heroku main`
- Docker: `docker-compose up`
