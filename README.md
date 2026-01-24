# CareerForge AI

AI-powered career guidance platform with mentorship matching, real-time chat, and skill assessment.

## Quick Start

```bash
# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Install frontend dependencies
cd ../frontend
npm install

# Start backend (port 3000)
cd backend
npm run dev

# Start frontend (port 5173) - in new terminal
cd frontend
npm run dev
```

## Environment Variables

Required variables in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GROQ_API_KEY` - Groq AI API key

See `.env.example` for all available options.

## Project Structure

```
careerforge-ai/
├── backend/                # Node.js + Express backend
│   ├── src/                # Backend source code
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Express middlewares
│   │   ├── models/         # Data models
│   │   ├── utils/          # Utilities
│   │   └── config/         # Configuration
│   ├── prisma/             # Database schema
│   ├── tests/              # Backend tests
│   ├── package.json        # Backend dependencies
│   ├── Dockerfile          # Docker configuration
│   └── README.md           # Backend documentation
│
└── frontend/               # React TypeScript frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Page components
    │   ├── store/          # State management (Zustand)
    │   ├── hooks/          # Custom hooks
    │   ├── lib/            # Libraries & utilities
    │   └── types/          # TypeScript types
    ├── package.json        # Frontend dependencies
    └── vite.config.ts      # Vite configuration
```

## Available Scripts

### Backend
```bash
cd backend

# Development
npm run dev              # Start dev server
npm start               # Start production server
npm test                # Run tests

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations
```

### Frontend
```bash
cd frontend

# Development
npm run dev             # Start dev server (port 5173)
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Lint code
```

## Tech Stack

**Backend:**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Groq AI

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand (State)

## License

MIT
