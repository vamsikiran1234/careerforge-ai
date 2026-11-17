require('../node_modules/dotenv').config({ path: 'backend/.env' });
const { prisma } = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function seedDemoCandidate() {
  console.log('🚀 Starting demo account recruiter-ready data refresh...');

  const demoEmail = 'demo.user@careerforge.ai';

  // 1. Upsert Demo User Profile
  const hashedPassword = await bcrypt.hash('CareerForge@Demo2026', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: 'Vamsi Kiran',
      password: hashedPassword,
      roles: '["STUDENT"]',
      bio: 'Full-Stack Software Engineer & Applied AI Developer specializing in TypeScript, React, Node.js, Python, and Production RAG architectures. Experienced in building high-throughput microservices, scalable distributed systems, and LLM-powered applications.',
    },
    create: {
      email: demoEmail,
      name: 'Vamsi Kiran',
      password: hashedPassword,
      roles: '["STUDENT"]',
      bio: 'Full-Stack Software Engineer & Applied AI Developer specializing in TypeScript, React, Node.js, Python, and Production RAG architectures. Experienced in building high-throughput microservices, scalable distributed systems, and LLM-powered applications.',
    },
  });

  console.log(`✅ Demo User Profile updated: ${demoUser.name} (${demoUser.email})`);

  // 2. Clean up existing old demo data
  await prisma.careerSession.deleteMany({ where: { userId: demoUser.id } });
  await prisma.quizSession.deleteMany({ where: { userId: demoUser.id } });
  await prisma.careerGoal.deleteMany({ where: { userId: demoUser.id } });
  console.log('🧹 Cleaned up old chat sessions, quiz sessions, and career goals.');

  // 3. Create 4 High-Impact Technical Chat Sessions
  const now = Date.now();

  const chatSessions = [
    {
      title: 'Production RAG & Vector Database Architecture',
      createdAt: new Date(now - 3 * 24 * 3600 * 1000),
      updatedAt: new Date(now - 3 * 24 * 3600 * 1000 + 45 * 60 * 1000),
      messages: [
        {
          id: 'rag-msg-1',
          role: 'user',
          content: 'I am architecting a production Retrieval-Augmented Generation (RAG) system for a knowledge base with over 50,000 technical manuals and legal contracts. What are the best practices for chunking, hybrid retrieval, and reducing hallucination to under 2%?',
          timestamp: new Date(now - 3 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'rag-msg-2',
          role: 'assistant',
          content: `### ⚡ Production RAG Architecture Blueprint

Building an enterprise-scale RAG system for 50,000+ complex technical and legal documents requires a multi-stage pipeline designed for high precision, low latency, and verifiable grounding.

---

#### 🏗️ Recommended 5-Stage Architecture

\`\`\`
[Document Ingestion] ➡️ [Recursive Semantic Chunking] ➡️ [Dense + BM25 Sparse Indexing]
                                                                     ⬇️
[Answer + Verified Citations] ⬅️ [Cross-Encoder Rerank] ⬅️ [Reciprocal Rank Fusion (RRF)]
\`\`\`

1. **Document Parsing & Semantic Chunking**:
   * Do not use fixed character windows. Use **Recursive Character Chunking** (500 tokens with 10% overlap) bounded by header markdown tags (\`#\`, \`##\`) and paragraph boundaries.
   * Attach rich metadata to every chunk: document ID, document title, section header hierarchy, page number, and revision date to support metadata pre-filtering.

2. **Hybrid Retrieval (Dense Vectors + BM25 Sparse)**:
   * **Dense Embeddings**: Use \`BAAI/bge-large-en-v1.5\` (1024 dims) or OpenAI \`text-embedding-3-small\` (1536 dims) for conceptual similarity.
   * **Sparse Indexing**: Index chunks into an inverted **BM25** index to guarantee exact alphanumeric recall (contract numbers, part codes, API names).
   * **Reciprocal Rank Fusion (RRF)**: Merge dense and sparse candidate sets using $RRF(d) = \\sum_{m \\in M} \\frac{1}{60 + r_m(d)}$.

3. **Cross-Encoder Reranking**:
   * Retrieve top 25 candidate chunks from hybrid retrieval, then pass \`(query, chunk)\` pairs through a cross-encoder model (\`cross-encoder/ms-marco-MiniLM-L-6-v2\`).
   * Reranking scores determine the top 3–5 chunks actually fed to the LLM context window.

4. **Context Injection & Strict Guardrails**:
   * Enforce strict prompt constraints:
     > *"Answer the user prompt strictly and exclusively using the provided context. If the answer cannot be directly deduced, explicitly state 'Information not found in context'. Always append [Document, Page] citations."*

Would you like to explore automated evaluation metrics using Ragas or see the Python pipeline implementation?`,
          timestamp: new Date(now - 3 * 24 * 3600 * 1000 + 5 * 60 * 1000).toISOString()
        },
        {
          id: 'rag-msg-3',
          role: 'user',
          content: 'How should I evaluate the retrieval accuracy and verify faithfulness in an automated CI/CD pipeline?',
          timestamp: new Date(now - 3 * 24 * 3600 * 1000 + 15 * 60 * 1000).toISOString()
        },
        {
          id: 'rag-msg-4',
          role: 'assistant',
          content: `### 📊 Automated RAG Evaluation & CI/CD Pipeline

To ensure the system never regresses as new documents or prompt changes are introduced, automate testing across the **RAG Triad** using **Ragas**:

---

#### 🎯 Key Metrics & Production SLOs

1. **Faithfulness / Groundedness (SLO $\\ge 0.95$)**:
   * Verifies that every assertion made in the generated response is mathematically supported by the retrieved context chunks (detecting hallucinations).
2. **Context Relevance / Precision (SLO $\\ge 0.90$)**:
   * Verifies that retrieved chunks actually contain the signal necessary to answer the prompt without noisy distractors.
3. **Answer Relevance (SLO $\\ge 0.88$)**:
   * Verifies that the response directly addresses the user query rather than providing evasive generic text.

#### 🛠️ GitHub Actions CI Pipeline Integration
* Synthesize a **Golden Evaluation Dataset** of 100 canonical Q&A pairs with verified ground truth.
* On every Pull Request modifying retrieval code or prompt templates, run \`ragas.evaluate()\` in a GitHub Actions runner.
* Block PR merging if Faithfulness drops below 0.95 or if p95 retrieval latency exceeds 300ms.`,
          timestamp: new Date(now - 3 * 24 * 3600 * 1000 + 20 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      title: 'Full-Stack System Design: Event-Driven Architecture with Node & Redis',
      createdAt: new Date(now - 2 * 24 * 3600 * 1000),
      updatedAt: new Date(now - 2 * 24 * 3600 * 1000 + 30 * 60 * 1000),
      messages: [
        {
          id: 'arch-msg-1',
          role: 'user',
          content: 'How do we design a highly scalable real-time messaging and notification system that handles 50,000 concurrent WebSocket connections with zero message loss and sub-50ms latency?',
          timestamp: new Date(now - 2 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'arch-msg-2',
          role: 'assistant',
          content: `### ⚙️ Scalable Real-Time Event-Driven Architecture

Handling 50,000 concurrent WebSocket connections requires horizontally scalable stateless socket nodes coordinated by a distributed message broker.

---

#### 🏛️ Architecture Topology
* **Edge Load Balancing**: AWS ALB / NGINX with sticky sessions and TLS termination.
* **WebSocket Tier**: Horizontally scaled Node.js instances running \`ws\` or Socket.IO.
* **Message Broker**: **Redis Pub/Sub** (or Redis Streams) for inter-node communication, allowing clients connected to Server A to instantly receive messages sent by clients on Server B.
* **Persistent Storage**: PostgreSQL with Prisma ORM for message history and delivery receipts.
* **Asynchronous Jobs**: BullMQ / Redis queues for handling offline push notifications (WebPush, Email, SMS) without blocking event loops.

#### 🔒 Zero Message Loss Guarantee
1. **Client Ack & Retry Loop**: Messages are held in a pending state until an explicit \`ACK\` frame is received from the client.
2. **Idempotency Keys**: Every message payload includes a UUID \`clientMessageId\` to prevent duplicate inserts during network retries.
3. **Heartbeat & Reconnection Backoff**: Ping/pong heartbeats every 25 seconds; automatic exponential backoff with jitter on reconnect.`,
          timestamp: new Date(now - 2 * 24 * 3600 * 1000 + 8 * 60 * 1000).toISOString()
        },
        {
          id: 'arch-msg-3',
          role: 'user',
          content: 'What indexing and caching strategies should we apply in PostgreSQL to ensure sub-10ms query times for conversation message history?',
          timestamp: new Date(now - 2 * 24 * 3600 * 1000 + 18 * 60 * 1000).toISOString()
        },
        {
          id: 'arch-msg-4',
          role: 'assistant',
          content: `### ⚡ PostgreSQL Optimization & Keyset Pagination

To achieve predictable sub-10ms query times over tables with millions of messages:

1. **Composite B-Tree Indexes**:
   \`\`\`sql
   CREATE INDEX idx_chat_messages_session_created 
   ON chat_messages ("sessionId", "createdAt" DESC);
   \`\`\`
   This enables index-only scans for fetching recent messages ordered chronologically.

2. **Keyset (Cursor) Pagination over Offset**:
   * Never use \`OFFSET 10000 LIMIT 20\` (which scans and discards 10,000 rows).
   * Use cursor conditions: \`WHERE sessionId = $1 AND createdAt < $cursor ORDER BY createdAt DESC LIMIT 20\`.

3. **Redis LRU Cache Layer**:
   * Cache the latest 50 messages of active conversations in Redis as a JSON list.
   * 90% of user queries hit the in-memory Redis cache in $< 2\\text{ms}$, sparing PostgreSQL for write persistence.`,
          timestamp: new Date(now - 2 * 24 * 3600 * 1000 + 24 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      title: 'AI Engineer 90-Day Production Roadmap & Capstone Strategy',
      createdAt: new Date(now - 1 * 24 * 3600 * 1000),
      updatedAt: new Date(now - 1 * 24 * 3600 * 1000 + 20 * 60 * 1000),
      messages: [
        {
          id: 'road-msg-1',
          role: 'user',
          content: 'What is the most effective 90-day roadmap to transition from Full-Stack Development to a high-impact AI Engineer role building production LLM applications?',
          timestamp: new Date(now - 1 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'road-msg-2',
          role: 'assistant',
          content: `### 🚀 90-Day Production AI Engineer Transition Roadmap

Transitioning from full-stack engineering gives you a distinct advantage: you already understand APIs, state, databases, and deployment. Your focus is adding foundational ML intuition, vector architectures, and production model serving.

---

* **Days 1–30: Vector Databases, Hybrid Search & Enterprise RAG**
  * Master dense embedding models, semantic chunking, and vector stores (Qdrant, Pinecone, pgvector).
  * Build a production document Q&A portal with Cross-Encoder reranking and strict citation guardrails.
* **Days 31–60: Deep Learning & PyTorch Foundations**
  * Tensors, dynamic computation graphs, autograd, custom \`Dataset\` and \`DataLoader\`.
  * Parameter-Efficient Fine-Tuning (LoRA / QLoRA) on open-source foundation models (Llama 3 8B).
* **Days 61–90: High-Throughput Serving & MLOps**
  * Serve quantized models with **vLLM** and **FastAPI** with streaming server-sent events (SSE).
  * Containerize pipelines in Docker with NVIDIA CUDA acceleration and setup automated evaluation suites.`,
          timestamp: new Date(now - 1 * 24 * 3600 * 1000 + 5 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      title: 'Cloud Infrastructure, Multi-Stage Docker & Zero-Downtime Deployment',
      createdAt: new Date(now - 12 * 3600 * 1000),
      updatedAt: new Date(now - 12 * 3600 * 1000 + 15 * 60 * 1000),
      messages: [
        {
          id: 'dock-msg-1',
          role: 'user',
          content: 'Can you break down a production-ready multi-stage Docker build and GitHub Actions CI/CD pipeline for a full-stack TypeScript + Node.js application?',
          timestamp: new Date(now - 12 * 3600 * 1000).toISOString()
        },
        {
          id: 'dock-msg-2',
          role: 'assistant',
          content: `### 🚢 Multi-Stage Containerization & CI/CD Pipeline

A production Docker build separates build-time dependencies from the runtime image to reduce attack surface and achieve lightweight images ($< 150\\text{MB}$).

---

\`\`\`dockerfile
# Stage 1: Build Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
\`\`\`

#### 🛡️ GitHub Actions Automation
* Automated TypeScript type-check and Vitest unit testing on every push.
* Multi-architecture Docker image caching using GitHub Actions cache backend.
* Zero-downtime rolling updates deployed seamlessly to cloud clusters.`,
          timestamp: new Date(now - 12 * 3600 * 1000 + 8 * 60 * 1000).toISOString()
        }
      ]
    }
  ];

  for (const session of chatSessions) {
    await prisma.careerSession.create({
      data: {
        userId: demoUser.id,
        title: session.title,
        messages: JSON.stringify(session.messages),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }
    });
  }
  console.log('✅ Seeded 4 pristine, recruiter-ready technical AI Chat Sessions.');

  // 4. Create 3 High-Scoring Completed Quiz Sessions
  const quizzes = [
    {
      currentStage: 'COMPLETED',
      score: 96.0,
      completedAt: new Date(now - 4 * 24 * 3600 * 1000),
      createdAt: new Date(now - 4 * 24 * 3600 * 1000 - 30 * 60 * 1000),
      updatedAt: new Date(now - 4 * 24 * 3600 * 1000),
      answers: JSON.stringify({
        track: 'FULL_STACK',
        level: 'ADVANCED',
        typescript: 'EXPERT',
        backend: 'NODE_POSTGRES',
        architecture: 'MICROSERVICES'
      }),
      results: JSON.stringify({
        careerPath: 'Senior Full-Stack Engineer',
        percentile: 98,
        strengths: ['TypeScript Architecture', 'PostgreSQL Query Optimization', 'React 19 & State Patterns', 'REST & WebSocket APIs'],
        recommendations: 'Exceptional readiness for senior software engineering and full-stack architecture roles.'
      }),
      questions: [
        {
          questionText: 'What is the primary architectural benefit of Keyset (Cursor-based) pagination over Offset-based pagination?',
          options: JSON.stringify(['It avoids scanning and discarding prior records', 'It reduces database storage', 'It prevents SQL injection', 'It caches results automatically']),
          correctAnswer: 'It avoids scanning and discarding prior records',
          userAnswer: 'It avoids scanning and discarding prior records',
          stage: 'BACKEND_SYSTEMS',
          order: 1
        },
        {
          questionText: 'How does React 19 Server Components optimize initial page load performance?',
          options: JSON.stringify(['By reducing client-side JavaScript bundle size', 'By disabling CSS styles', 'By running on service workers', 'By converting JSX to WebAssembly']),
          correctAnswer: 'By reducing client-side JavaScript bundle size',
          userAnswer: 'By reducing client-side JavaScript bundle size',
          stage: 'FRONTEND_ARCHITECTURE',
          order: 2
        }
      ]
    },
    {
      currentStage: 'COMPLETED',
      score: 94.0,
      completedAt: new Date(now - 2 * 24 * 3600 * 1000),
      createdAt: new Date(now - 2 * 24 * 3600 * 1000 - 25 * 60 * 1000),
      updatedAt: new Date(now - 2 * 24 * 3600 * 1000),
      answers: JSON.stringify({
        track: 'AI_ML',
        ragExperience: 'ADVANCED',
        embeddings: 'DENSE_SPARSE_HYBRID',
        evaluation: 'RAGAS_FRAMEWORK'
      }),
      results: JSON.stringify({
        careerPath: 'AI Engineer / LLM Systems Developer',
        percentile: 96,
        strengths: ['RAG Pipeline Engineering', 'Vector Database Indexing', 'Cross-Encoder Reranking', 'Hallucination Mitigation'],
        recommendations: 'Highly qualified for Applied AI and Enterprise RAG development roles.'
      }),
      questions: [
        {
          questionText: 'Which retrieval mechanism best resolves exact alphanumeric queries (e.g. part numbers) in a RAG system?',
          options: JSON.stringify(['Sparse BM25 Keyword Search with Reciprocal Rank Fusion', 'Pure cosine similarity on 1536-dim vectors', 'K-Means clustering on document tokens', 'Levenshtein edit distance on raw text']),
          correctAnswer: 'Sparse BM25 Keyword Search with Reciprocal Rank Fusion',
          userAnswer: 'Sparse BM25 Keyword Search with Reciprocal Rank Fusion',
          stage: 'RAG_ARCHITECTURE',
          order: 1
        }
      ]
    },
    {
      currentStage: 'COMPLETED',
      score: 92.0,
      completedAt: new Date(now - 1 * 24 * 3600 * 1000),
      createdAt: new Date(now - 1 * 24 * 3600 * 1000 - 20 * 60 * 1000),
      updatedAt: new Date(now - 1 * 24 * 3600 * 1000),
      answers: JSON.stringify({
        track: 'SYSTEM_DESIGN',
        caching: 'REDIS_LRU',
        concurrency: 'ASYNC_EVENT_LOOP',
        scalability: 'HORIZONTAL_AUTOSCALING'
      }),
      results: JSON.stringify({
        careerPath: 'Distributed Systems & Cloud Engineer',
        percentile: 94,
        strengths: ['Distributed Caching', 'Event-Driven Architectures', 'Docker Containerization', 'High-Availability Design'],
        recommendations: 'Demonstrates strong engineering discipline in distributed systems and cloud scaling.'
      }),
      questions: [
        {
          questionText: 'When designing a distributed cache with Redis, what prevents a cache stampede during key expiration?',
          options: JSON.stringify(['Probabilistic early expiration (XFetch) or mutex locking', 'Increasing TTL to infinity', 'Restarting the Redis instance', 'Disabling persistence']),
          correctAnswer: 'Probabilistic early expiration (XFetch) or mutex locking',
          userAnswer: 'Probabilistic early expiration (XFetch) or mutex locking',
          stage: 'DISTRIBUTED_SYSTEMS',
          order: 1
        }
      ]
    }
  ];

  for (const q of quizzes) {
    const session = await prisma.quizSession.create({
      data: {
        userId: demoUser.id,
        currentStage: q.currentStage,
        score: q.score,
        completedAt: q.completedAt,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        answers: q.answers,
        results: q.results,
      }
    });

    for (const quest of q.questions) {
      await prisma.quizQuestion.create({
        data: {
          quizSessionId: session.id,
          questionText: quest.questionText,
          options: quest.options,
          correctAnswer: quest.correctAnswer,
          userAnswer: quest.userAnswer,
          stage: quest.stage,
          order: quest.order
        }
      });
    }
  }
  console.log('✅ Seeded 3 completed high-scoring Quiz Assessments.');

  // 5. Create a Structured 85% Progress Career Trajectory Goal
  const careerGoal = await prisma.careerGoal.create({
    data: {
      userId: demoUser.id,
      currentRole: 'Full-Stack Developer',
      currentCompany: 'CareerForge Engineering',
      currentLevel: 'Mid-Level',
      yearsExperience: 3,
      targetRole: 'Senior Full-Stack & Applied AI Engineer',
      targetCompany: 'Top-Tier Tech & High-Growth AI Enterprises',
      targetLevel: 'Senior / Staff',
      targetSalary: 135000,
      timeframeMonths: 6,
      startDate: new Date(now - 60 * 24 * 3600 * 1000),
      targetDate: new Date(now + 120 * 24 * 3600 * 1000),
      status: 'ACTIVE',
      progress: 85,
      aiGenerated: true,
      aiAnalysis: JSON.stringify({
        readinessScore: 88,
        trajectoryPace: 'ACCELERATED',
        marketDemand: 'VERY_HIGH',
        summary: 'Exceptional progress across full-stack architecture and production AI integration.'
      }),
      notes: 'Focused on mastering enterprise RAG systems, high-concurrency microservices, and leading end-to-end technical deliveries.',
      visibility: 'PUBLIC'
    }
  });

  const milestones = [
    {
      title: 'Advanced TypeScript & Modern React 19 Architecture',
      description: 'Mastered component performance optimization, TanStack Query caching, and clean Zustand state architecture.',
      category: 'SKILL_DEVELOPMENT',
      targetDate: new Date(now - 45 * 24 * 3600 * 1000),
      completedAt: new Date(now - 45 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      progress: 100,
      priority: 'HIGH',
      order: 1
    },
    {
      title: 'High-Performance Backend Engineering with Node.js & PostgreSQL',
      description: 'Designed normalized schemas, Prisma ORM indexes, keyset pagination, and secure JWT authentication with refresh tokens.',
      category: 'SKILL_DEVELOPMENT',
      targetDate: new Date(now - 30 * 24 * 3600 * 1000),
      completedAt: new Date(now - 30 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      progress: 100,
      priority: 'HIGH',
      order: 2
    },
    {
      title: 'Production RAG Architecture with Vector Databases & Reranking',
      description: 'Architected end-to-end hybrid search pipeline (Qdrant + BM25) with cross-encoder reranking and verified source citations.',
      category: 'PROJECT',
      targetDate: new Date(now - 15 * 24 * 3600 * 1000),
      completedAt: new Date(now - 15 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      progress: 100,
      priority: 'HIGH',
      order: 3
    },
    {
      title: 'Multi-Provider AI Orchestration Engine with Intelligent Fallbacks',
      description: 'Built zero-downtime AI gateway supporting OpenAI, Groq, Gemini, and conversational context retention.',
      category: 'PROJECT',
      targetDate: new Date(now - 5 * 24 * 3600 * 1000),
      completedAt: new Date(now - 5 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      progress: 100,
      priority: 'HIGH',
      order: 4
    },
    {
      title: 'Containerization, Redis Caching & Cloud CI/CD Deployment',
      description: 'Multi-stage Docker builds, automated GitHub Actions testing workflows, and zero-downtime deployment.',
      category: 'CERTIFICATION',
      targetDate: new Date(now + 30 * 24 * 3600 * 1000),
      status: 'IN_PROGRESS',
      progress: 80,
      priority: 'HIGH',
      order: 5
    },
    {
      title: 'System Design Architecture & Technical Leadership Preparation',
      description: 'Mastery of distributed transactions, event-driven message brokers, and technical communication.',
      category: 'SKILL_DEVELOPMENT',
      targetDate: new Date(now + 60 * 24 * 3600 * 1000),
      status: 'IN_PROGRESS',
      progress: 75,
      priority: 'MEDIUM',
      order: 6
    }
  ];

  for (const m of milestones) {
    await prisma.milestone.create({
      data: {
        goalId: careerGoal.id,
        title: m.title,
        description: m.description,
        category: m.category,
        targetDate: m.targetDate,
        completedAt: m.completedAt || null,
        status: m.status,
        progress: m.progress,
        priority: m.priority,
        order: m.order
      }
    });
  }
  console.log('✅ Seeded Active Career Goal (85% progress) with 6 professional milestones.');

  console.log('\n🎉 Demo account is now 100% recruiter-ready, showcasing top-tier technical depth!');
}

seedDemoCandidate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
