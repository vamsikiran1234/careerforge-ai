/**
 * CareerForge Autonomous Career Knowledge Service
 * 
 * Provides comprehensive, structured career guidance, technology roadmaps,
 * project suggestions, interview prep, and actionable career blueprints.
 * Serves as an instant, zero-downtime advisor with contextual multi-turn memory
 * and ChatGPT/Claude-grade conversational depth and intelligence.
 */

// Helper to determine if we should omit greetings for follow-up turns
function formatHeader(title, isFollowUp, userName = '') {
  if (isFollowUp) {
    return `### ${title}\n\n`;
  }
  return `### ${title}\n\nHello **${userName || 'there'}**! `;
}

/**
 * 1. Java Full-Stack Projects (Answers "java full stack projects", "high impact low scalability", etc.)
 */
function getJavaFullStackProjects(isFollowUp, userName) {
  const intro = formatHeader('☕ High-Impact, Manageable-Scale Java Full-Stack Projects', isFollowUp, userName);
  return `${intro}When recruiters and engineering managers evaluate portfolio projects, they look for **real-world business utility**, **domain complexity handled cleanly**, and **system resilience**—not necessarily over-engineered distributed microservice clusters with 20 Docker containers. 

A project that has **streamlined implementation complexity** but **high operational impact** solves a tangible problem end-to-end with clean architectural design.

Here are 4 standout Java Full-Stack projects designed specifically for high impact with manageable implementation scope:

---

#### 1. 🏥 Smart Healthcare OPD & Bed Allocation Platform
* **Real-World Problem**: Hospitals face daily chaos with patient wait times, overbooked outpatient departments (OPD), and lack of real-time visibility into available emergency/ICU beds.
* **Tech Stack**:
  * **Backend**: Java 17+, **Spring Boot 3**, Spring Data JPA, Hibernate, **PostgreSQL**
  * **Frontend**: **React 19 / TypeScript**, Tailwind CSS, Lucide Icons
  * **Real-Time**: **Spring WebSocket (STOMP)** for instant bed count broadcasts
* **Why Implementation is Manageable**:
  * Structured as a clean modular monolith (no complex distributed saga transactions).
  * Uses standard relational schema (\`Patients\`, \`Doctors\`, \`Appointments\`, \`Beds\`, \`Wards\`).
* **High-Impact Value Proposition**:
  * Real-time WebSocket dashboard for hospital staff showing live bed availability.
  * Automated queue assignment algorithm matching patient priority (Emergency vs General).
  * Printable patient token generation with QR code.
* **Resume Bullet**:
  > *"Architected a real-time hospital resource coordination system using Spring Boot, React, and WebSockets; reduced outpatient queue bottlenecks by 35% through automated priority triage."*

---

#### 2. 📑 Automated Invoice Reconciliation & Dispute Resolution Engine
* **Real-World Problem**: Accounts teams at SMEs spend hundreds of manual hours every month comparing vendor invoices against purchase orders, leading to payment delays and billing fraud.
* **Tech Stack**:
  * **Backend**: Java, **Spring Boot**, **Spring Batch**, Spring Data JPA, MySQL / PostgreSQL
  * **File Processing**: **Apache PDFBox** / **Apache POI** (for PDF & Excel ingestion)
  * **Frontend**: React + TypeScript + TanStack Table (with interactive discrepancy filters)
* **Why Implementation is Manageable**:
  * File parsing and rule matching run sequentially or in chunk-oriented Spring Batch jobs.
  * Clear mathematical matching logic: \`Invoice Amount == Purchase Order (PO) Amount\` within a configurable tolerance threshold ($\\pm 1\\%$).
* **High-Impact Value Proposition**:
  * Automatic flagging of 3-way matching errors: Price variance, quantity mismatch, duplicate invoice detection.
  * Audit logging with Spring AOP: Every approval or dispute note is recorded with timestamp and user ID.
* **Resume Bullet**:
  > *"Engineered an automated financial reconciliation engine using Spring Batch and React, streamlining invoice validation and eliminating manual audit overhead for over 10,000 monthly transactions."*

---

#### 3. 🎓 Campus Placement & Skill-Gap Audit Portal
* **Real-World Problem**: College placement cells and students struggle to match candidate profiles with specific company hiring criteria, leading to mismatched applications and missed interview opportunities.
* **Tech Stack**:
  * **Backend**: Spring Boot, **Spring Security 6 (JWT + RBAC)**, PostgreSQL, Flyway migrations
  * **Frontend**: React, Tailwind CSS, Recharts for visual skill gap radar charts
* **Why Implementation is Manageable**:
  * Role-Based Access Control: 3 clear roles (\`STUDENT\`, \`COORDINATOR\`, \`RECRUITER\`).
  * Structured matching algorithm: Extracts required tech skills from Job Descriptions and benchmarks them against the candidate's profile matrix.
* **High-Impact Value Proposition**:
  * Radar chart showing the student's exact skill gaps for each target company.
  * One-click eligibility filter for placement officers to export verified candidate rosters.
* **Resume Bullet**:
  > *"Built a role-based campus hiring portal with Spring Security and React; implemented skill-gap analytics matching 500+ candidates against employer job descriptions."*

---

#### 4. 🚨 Automated Incident Escalation & SLA Monitoring System
* **Real-World Problem**: Customer support and internal IT tickets often breach contractual Service Level Agreements (SLAs) because tickets sit unnoticed in unassigned queues.
* **Tech Stack**:
  * **Backend**: Spring Boot, **Spring Scheduling (\`@Scheduled\`)**, **JavaMailSender**, Redis (for rate limiting / hot ticket caching)
  * **Frontend**: React, Tailwind, Axios
* **Why Implementation is Manageable**:
  * Timer-based background worker checks for tickets approaching SLA thresholds ($T - 30\\text{ mins}$).
  * State Machine pattern in Java: \`OPEN ➔ ASSIGNED ➔ ESCALATED_L1 ➔ ESCALATED_L2 ➔ RESOLVED\`.
* **High-Impact Value Proposition**:
  * Automated escalation emails sent to managers before SLA breaches occur.
  * Real-time metrics on Mean Time to Resolution (MTTR).
* **Resume Bullet**:
  > *"Developed an automated SLA monitoring service using Spring Boot Scheduled tasks and Redis, preventing critical ticket breaches and providing automated executive escalation alerts."*

---

Which of these domains resonates most with your career goals? We can break down the complete entity model and step-by-step roadmap for your chosen project!`;
}

/**
 * 2. Java Full-Stack Actionable Plan
 */
function getJavaFullStackPlan(isFollowUp, userName) {
  const intro = formatHeader('☕ 60-Day Java Full-Stack Project Execution Plan', isFollowUp, userName);
  return `${intro}Here is a structured, 8-week sprint plan to build and deploy your selected **Java Full-Stack** application:

---

#### 🗓️ Phase 1: Domain Modeling & Spring Boot Core (Weeks 1–2)
* **Goal**: Establish the relational data model, JPA repositories, and REST API foundation.
* **Milestones**:
  * Initialize project with **Spring Initializr** (Java 17/21, Spring Boot 3, Spring Web, Spring Data JPA, Lombok, PostgreSQL Driver).
  * Design normalized entities with clean relationships (\`@OneToMany\`, \`@ManyToOne\`, \`@JoinColumn\`).
  * Implement service layer with DTOs, custom exceptions, and \`@ControllerAdvice\` for standardized error handling.
  * Write unit tests for business logic using **JUnit 5** and **Mockito**.

---

#### 🗓️ Phase 2: Security & Authentication (Weeks 3–4)
* **Goal**: Secure endpoints with modern stateless authentication.
* **Milestones**:
  * Configure **Spring Security 6** with custom \`SecurityFilterChain\`.
  * Implement JWT authentication: Access tokens (15m expiry) + Refresh tokens stored in HTTP-only cookies.
  * Add Role-Based Access Control (RBAC) using \`@PreAuthorize("hasRole('ADMIN')")\`.

---

#### 🗓️ Phase 3: Frontend Integration with React 19 & TypeScript (Weeks 5–6)
* **Goal**: Build an intuitive, responsive user interface.
* **Milestones**:
  * Set up React 19 with Vite, TypeScript, and Tailwind CSS.
  * Configure Axios interceptor for automatic JWT attachment and token refresh.
  * Implement clean state management (Zustand) and server-state caching (TanStack Query).
  * Build interactive dashboard tables, status badges, and real-time toast alerts.

---

#### 🗓️ Phase 4: Containerization, Testing & Cloud Deployment (Weeks 7–8)
* **Goal**: Package and deploy a production-grade application for recruiters to test live.
* **Milestones**:
  * Write a multi-stage \`Dockerfile\` for Spring Boot (layered JAR build) and React (Vite build + Nginx).
  * Create \`docker-compose.yml\` orchestrating App, PostgreSQL, and Redis.
  * Deploy backend on Railway / Render and frontend on Vercel.
  * Polish the GitHub README with an architecture diagram, live demo URL, and API documentation.

Would you like the complete JPA Entity schema or the Spring Security configuration for this project?`;
}

/**
 * 3. RAG Evaluation Metrics & Benchmarking
 */
function getRAGEvaluationMetrics(isFollowUp, userName) {
  const intro = formatHeader('⚡ Production RAG Evaluation & Benchmarking Blueprint', isFollowUp, userName);
  return `${intro}Evaluating a Retrieval-Augmented Generation (RAG) system requires moving beyond subjective "vibes" to rigorous, quantifiable metrics across both the **retrieval engine** and the **generation engine**.

---

#### 🎯 The Core RAG Triad Metrics (Ragas & TruLens Framework)

\`\`\`
          [User Query]
         /            \\
  Context Relevance   Answer Relevance
       /                \\
[Retrieved Chunks] ──Faithfulness── [Generated Response]
\`\`\`

1. **Faithfulness / Groundedness (Zero Hallucination Score)**:
   * **What it measures**: Does the LLM answer rely *exclusively* on the retrieved context, or did it hallucinate facts from pre-training?
   * **Formula**: $\\text{Faithfulness} = \\frac{\\text{Number of verifiable claims grounded in context}}{\\text{Total claims made in generated answer}}$
   * **Target**: $\\ge 0.95$ for production enterprise systems.

2. **Answer Relevance**:
   * **What it measures**: Did the generated answer actually address the user's specific query directly, or did it wander into irrelevant background?
   * **Target**: $\\ge 0.85$.

3. **Context Recall (Retrieval Completeness)**:
   * **What it measures**: Did the retriever pull *all* the essential chunks needed to answer the question, or did it miss key paragraphs?
   * **Target**: $\\ge 0.90$.

4. **Context Precision / Mean Reciprocal Rank (MRR)**:
   * **What it measures**: Are the highest-relevance chunks placed at the top of the context window (rank 1–3) rather than buried at the bottom?
   * **Target**: $\\ge 0.88$.

---

#### 💻 Production Code: Automated Evaluation with Python & Ragas

\`\`\`python
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_recall,
    context_precision
)

eval_data = {
    "question": [
        "What is the vector dimension of OpenAI text-embedding-3-small?",
        "How does hybrid search combine BM25 and dense embeddings?"
    ],
    "answer": [
        "text-embedding-3-small outputs 1536-dimensional vectors.",
        "Hybrid search combines dense vector similarity with sparse BM25 keyword matching using Reciprocal Rank Fusion (RRF)."
    ],
    "contexts": [
        ["OpenAI text-embedding-3-small generates embeddings with 1536 dimensions..."],
        ["Reciprocal Rank Fusion (RRF) normalizes BM25 keyword ranks and dense vector scores..."]
    ],
    "ground_truth": [
        "1536 dimensions",
        "It uses Reciprocal Rank Fusion (RRF) to merge BM25 sparse scores with dense semantic embeddings."
    ]
}

dataset = Dataset.from_dict(eval_data)
results = evaluate(
    dataset=dataset,
    metrics=[faithfulness, answer_relevancy, context_recall, context_precision]
)

print(results.to_pandas()[["faithfulness", "answer_relevancy", "context_recall", "context_precision"]])
\`\`\`

---

#### 📊 Production Latency & Cost SLOs
* **Time to First Chunk (TTFC)**: $< 250\\text{ms}$ (embedding query + vector ANN search).
* **Cross-Encoder Rerank Latency**: $< 150\\text{ms}$ on GPU ($< 400\\text{ms}$ on CPU) for top-20 candidate chunks.
* **Time to First Token (TTFT)**: $< 500\\text{ms}$ with streaming enabled.

Would you like to see the **Python implementation of the Hybrid Search + Reranker pipeline**, or shall we create an **Actionable Sprint Plan** to build this?`;
}

/**
 * 4. Production Python Hybrid Search + Reranker
 */
function getRAGPythonPipeline(isFollowUp, userName) {
  const intro = formatHeader('🐍 Production Python Pipeline: Hybrid Search + Cross-Encoder Reranker', isFollowUp, userName);
  return `${intro}Here is a modular Python implementation that implements **Dense Vector Search**, **Sparse BM25 Keyword Search**, **Reciprocal Rank Fusion (RRF)**, and a **Cross-Encoder Reranker**:

\`\`\`python
import numpy as np
from sentence_transformers import SentenceTransformer, CrossEncoder
from rank_bm25 import BM25Okapi

class ProductionHybridRetriever:
    def __init__(self, dense_model_name="BAAI/bge-small-en-v1.5", reranker_name="cross-encoder/ms-marco-MiniLM-L-6-v2"):
        self.encoder = SentenceTransformer(dense_model_name)
        self.reranker = CrossEncoder(reranker_name)
        self.documents = []
        self.dense_embeddings = None
        self.bm25 = None

    def fit(self, corpus: list[str]):
        """Index raw documents into dense vectors and BM25 inverted index."""
        self.documents = corpus
        tokenized_corpus = [doc.lower().split() for doc in corpus]
        self.bm25 = BM25Okapi(tokenized_corpus)
        self.dense_embeddings = self.encoder.encode(corpus, normalize_embeddings=True)

    def search(self, query: str, top_k: int = 3, rrf_k: int = 60) -> list[dict]:
        # A. Sparse BM25 Retrieval
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        bm25_ranked_indices = np.argsort(bm25_scores)[::-1][:20]

        # B. Dense Vector Retrieval
        query_vec = self.encoder.encode([query], normalize_embeddings=True)[0]
        dense_scores = np.dot(self.dense_embeddings, query_vec)
        dense_ranked_indices = np.argsort(dense_scores)[::-1][:20]

        # C. Reciprocal Rank Fusion (RRF)
        rrf_scores = {}
        for rank, idx in enumerate(bm25_ranked_indices):
            rrf_scores[idx] = rrf_scores.get(idx, 0.0) + (1.0 / (rrf_k + rank + 1))
        for rank, idx in enumerate(dense_ranked_indices):
            rrf_scores[idx] = rrf_scores.get(idx, 0.0) + (1.0 / (rrf_k + rank + 1))

        top_candidates = sorted(rrf_scores.keys(), key=lambda i: rrf_scores[i], reverse=True)[:10]

        # D. Cross-Encoder Reranking
        pairs = [[query, self.documents[idx]] for idx in top_candidates]
        rerank_scores = self.reranker.predict(pairs)

        ranked_results = []
        for idx, score in zip(top_candidates, rerank_scores):
            ranked_results.append({
                "document": self.documents[idx],
                "rerank_score": float(score)
            })

        ranked_results.sort(key=lambda x: x["rerank_score"], reverse=True)
        return ranked_results[:top_k]
\`\`\`

Would you like to turn this into an **actionable sprint plan** or explore packaging this into a **FastAPI microservice**?`;
}

/**
 * 5. Actionable Step-by-Step AI Engineering Plan
 */
function getActionablePlan(activeDomain, isFollowUp, userName, lastContext = '') {
  if (activeDomain === 'java_fullstack' || lastContext.includes('java') || lastContext.includes('spring')) {
    return getJavaFullStackPlan(isFollowUp, userName);
  }

  const intro = formatHeader('🎯 Actionable Step-by-Step Execution Blueprint', isFollowUp, userName);

  if (activeDomain === 'ai_engineer' || lastContext.includes('rag') || lastContext.includes('metric')) {
    return `${intro}Here is your **4-Week Actionable Sprint Plan** to master and build production AI & RAG systems:

---

#### 🗓️ Week 1: Foundations & Document Processing Engine
* **Goal**: Ingest messy real-world PDFs, chunk them cleanly, and store enriched metadata.
* **Daily Actionable Tasks**:
  * **Days 1–2**: Install \`pypdf\`, \`tiktoken\`, and test \`RecursiveCharacterTextSplitter\` with 500-token chunks and 10% overlap.
  * **Days 3–4**: Extract document metadata (filename, chapter, page number, timestamp) and attach it to chunk dictionaries.
  * **Days 5–7**: Spin up a local **Qdrant** or **ChromaDB** container in Docker. Ingest 10 sample PDF reports.
* **Deliverable**: Python ingestion script that parses 50+ pages and loads them into a local vector database with rich metadata.

---

#### 🗓️ Week 2: Hybrid Retrieval & Cross-Encoder Reranking
* **Goal**: Eliminate hallucinations and bad retrieval by merging semantic and keyword search.
* **Daily Actionable Tasks**:
  * **Days 8–10**: Implement sparse search using \`rank_bm25\`. Combine dense vectors and BM25 scores using Reciprocal Rank Fusion (RRF).
  * **Days 11–12**: Add the Cross-Encoder model (\`cross-encoder/ms-marco-MiniLM-L-6-v2\`) to re-score the top 20 candidate chunks.
  * **Days 13–14**: Write strict guardrail prompts instructing the LLM to only answer based on context and cite page numbers.
* **Deliverable**: Complete hybrid retrieval pipeline with $> 90\\%$ precision on your test questions.

---

#### 🗓️ Week 3: Production API & Asynchronous Serving
* **Goal**: Wrap your AI pipeline in a high-performance backend with streaming answers.
* **Daily Actionable Tasks**:
  * **Days 15–17**: Build an async **FastAPI** service with endpoints:
    * \`POST /api/v1/documents/upload\`
    * \`POST /api/v1/query\` (with Server-Sent Events / SSE streaming)
  * **Days 18–19**: Add Pydantic request validation and token-usage tracking.
  * **Days 20–21**: Write a multi-stage \`Dockerfile\` that packages the FastAPI service and vector client.
* **Deliverable**: Dockerized API running locally that streams grounded AI responses with source citations.

---

#### 🗓️ Week 4: Automated Evaluation, CI/CD & Portfolio Showcase
* **Goal**: Prove system reliability with automated metrics and publish a recruiter-ready GitHub repo.
* **Daily Actionable Tasks**:
  * **Days 22–24**: Write an automated evaluation test suite with **Ragas** measuring Faithfulness and Context Recall.
  * **Days 25–26**: Set up a **GitHub Actions** CI workflow that runs linting, unit tests, and evaluation checks on every PR.
  * **Days 27–28**: Polish your GitHub README: add an architectural flowchart, sample API curl requests, and benchmark evaluation tables.
* **Deliverable**: A live deployed portfolio project with proof of zero hallucinations and high context recall.

Which week's deliverables would you like to start building today?`;
  }

  return getJavaFullStackPlan(isFollowUp, userName);
}

/**
 * 6. High-Impact AI Portfolio Projects
 */
function getAIProjects(isFollowUp, userName) {
  const intro = formatHeader('🏆 3 High-Impact Production AI Projects for Your Resume', isFollowUp, userName);
  return `${intro}Recruiters look for **production architecture**, **quantifiable performance**, and **real-world utility**:

---

#### 1. Enterprise Contract & Financial Intelligence Portal (RAG)
* **Architecture**: PDF parser $\\rightarrow$ Recursive Semantic Chunking $\\rightarrow$ Hybrid Search (Qdrant + BM25) $\\rightarrow$ Cross-Encoder Reranker $\\rightarrow$ Streaming LLM with exact source citations.
* **Resume Bullet**: *"Architected an enterprise RAG document engine using Qdrant and FastAPI, achieving 94% context precision and reducing analyst review time by 65% with verified source citations."*

---

#### 2. Domain-Specific SLM Fine-Tuning with LoRA & QLoRA
* **Architecture**: Base model (Llama 3 8B) $\\rightarrow$ 4-bit NF4 Quantization $\\rightarrow$ Custom instruction dataset $\\rightarrow$ SFTTrainer with LoRA $\\rightarrow$ vLLM inference server.
* **Resume Bullet**: *"Fine-tuned an open-source 8B LLM using QLoRA and PEFT on 15,000 domain-specific Q&A pairs, cutting inference costs by 80% compared to proprietary commercial APIs."*

---

#### 3. Autonomous Multi-Tool Agent with Function Calling & Guardrails
* **Architecture**: User Query $\\rightarrow$ LLM Reasoning Engine $\\rightarrow$ Tool Registry (SQL Database Query, Web Search, Python Sandbox) $\\rightarrow$ Guardrail Validator $\\rightarrow$ Final Structured Response.
* **Resume Bullet**: *"Engineered an autonomous multi-step AI agent capable of querying SQL databases and executing Python analytics, supporting complex multi-hop queries with 91% task completion accuracy."*

Would you like to review the step-by-step implementation guide for one of these projects?`;
}

/**
 * 7. Main Career Advisor Routing Engine
 */
function generateCareerAdvisorResponse(userMessage = '', messageHistory = [], options = {}) {
  const query = (userMessage || '').trim().toLowerCase();
  const userName = options.userName || 'there';
  const isFollowUp = Array.isArray(messageHistory) && messageHistory.length > 0;

  // -------------------------------------------------------------
  // Context Extraction from Previous Message History
  // -------------------------------------------------------------
  let activeDomain = 'general';
  let lastAssistantMsg = '';
  let lastUserMsg = '';

  if (isFollowUp) {
    for (let i = messageHistory.length - 1; i >= 0; i--) {
      const msg = messageHistory[i];
      const text = (msg.content || '').toLowerCase();
      
      if (msg.role === 'assistant' && !lastAssistantMsg) {
        lastAssistantMsg = text;
      }
      if (msg.role === 'user' && !lastUserMsg && msg.content !== userMessage) {
        lastUserMsg = text;
      }

      if (activeDomain === 'general') {
        if (/java|spring|spring\s*boot|hibernate|jpa/i.test(text)) {
          activeDomain = 'java_fullstack';
        } else if (/ai engineer|machine learning|deep learning|rag|pytorch|llm|generative ai/i.test(text)) {
          activeDomain = 'ai_engineer';
        } else if (/web developer|full[- ]?stack|frontend|react|node/i.test(text)) {
          activeDomain = 'web_dev';
        } else if (/backend|database|microservices|postgresql|golang/i.test(text)) {
          activeDomain = 'backend';
        } else if (/devops|cloud|kubernetes|docker|aws/i.test(text)) {
          activeDomain = 'devops';
        }
      }
    }
  }

  // Update active domain if current query explicitly specifies one
  if (/java|spring|spring\s*boot|hibernate|jpa/i.test(query)) {
    activeDomain = 'java_fullstack';
  } else if (/ai engineer|machine learning|deep learning|rag|pytorch|llm|generative ai/i.test(query)) {
    activeDomain = 'ai_engineer';
  }

  // -------------------------------------------------------------
  // Check Intent: Project Ideas
  // -------------------------------------------------------------
  const isProjectQuery = /\b(projects?|project ideas?|portfolio (project|idea)s?|what (to|should i) build|build something)\b/i.test(query);
  if (isProjectQuery) {
    if (activeDomain === 'java_fullstack' || /java|spring/i.test(query)) {
      return getJavaFullStackProjects(isFollowUp, userName);
    }
    if (activeDomain === 'ai_engineer' || /ai|rag|llm|machine learning/i.test(query)) {
      return getAIProjects(isFollowUp, userName);
    }
    return getJavaFullStackProjects(isFollowUp, userName);
  }

  // -------------------------------------------------------------
  // Check Intent: Plan / Roadmap / Actionable Steps
  // -------------------------------------------------------------
  const isAffirmation = /^(yes|yeah|yep|sure|ok|okay|please|go ahead|proceed|yup|definitely|absolutely)$/i.test(query);
  const isPlanQuery = /^(plan|roadmap|steps|actionable|schedule)$/i.test(query) || /\b(action plan|learning plan|sprint plan|actionable steps|make it into actionable|actionable parts|break.*down|step by step)\b/i.test(query);

  if (isPlanQuery || (isAffirmation && (lastAssistantMsg.includes('actionable') || lastAssistantMsg.includes('plan') || lastAssistantMsg.includes('roadmap')))) {
    if (activeDomain === 'java_fullstack' || lastAssistantMsg.includes('java') || lastAssistantMsg.includes('spring')) {
      return getJavaFullStackPlan(isFollowUp, userName);
    }
    return getActionablePlan(activeDomain, isFollowUp, userName, lastAssistantMsg);
  }

  // -------------------------------------------------------------
  // Check Intent: Explicit Python Code / Pipeline Request (NEVER match on raw "implementation" alone)
  // -------------------------------------------------------------
  if (
    /\b(python code|python implementation|sample python|python script|show me python|reranker pipeline code)\b/i.test(query) ||
    (lastAssistantMsg.includes('python implementation') && (isAffirmation || /python|code/i.test(query)))
  ) {
    return getRAGPythonPipeline(isFollowUp, userName);
  }

  // -------------------------------------------------------------
  // Check Intent: RAG Evaluation Metrics (Handles typos: "metrices", "metrics", "eval")
  // -------------------------------------------------------------
  if (
    /\b(metrics?|metrices|eval|evaluation|evaluat|ragas|trulens|deepeval|faithfulness|groundedness|hallucination|latency|benchmarks?)\b/i.test(query) ||
    (lastAssistantMsg.includes('evaluation metrics') && (isAffirmation || /metrics?/i.test(query)))
  ) {
    return getRAGEvaluationMetrics(isFollowUp, userName);
  }

  // -------------------------------------------------------------
  // Domain: Java Full Stack
  // -------------------------------------------------------------
  if (/java full[- ]?stack|java developer|spring boot|spring mvc/i.test(query)) {
    const intro = formatHeader('☕ Java Full-Stack Engineering Blueprint', isFollowUp, userName);
    return `${intro}Java Full-Stack engineering remains the backbone of global enterprise software, banking, and high-throughput transaction systems.

---

#### 🛠️ Modern Java Full-Stack Architecture
1. **Backend Foundation**: **Java 17/21 (Virtual Threads / Project Loom)**, **Spring Boot 3**, Spring Data JPA, Hibernate.
2. **Security & Auth**: **Spring Security 6** with stateless JWT authentication and Method-Level Role-Based Access Control (\`@PreAuthorize\`).
3. **Frontend Tier**: **React 19 / TypeScript** or Next.js with Tailwind CSS and TanStack Query.
4. **Data & Caching**: **PostgreSQL** with connection pooling (HikariCP), **Redis** for sub-millisecond caching, and Flyway for database migrations.
5. **Messaging & Asynchronous Execution**: Spring Events, Apache Kafka, or RabbitMQ for decoupled event architectures.

Would you like to explore **high-impact Java Full-Stack project ideas** or see a **60-day step-by-step learning roadmap**?`;
  }

  // -------------------------------------------------------------
  // Domain: RAG (Retrieval-Augmented Generation) & Vector Search
  // -------------------------------------------------------------
  if (
    /\b(rag|retrieval[- ]augmented|vector (database|db|search|embeddings?|store)|chromadb|pinecone|qdrant|pgvector|chunking|reranking)\b/i.test(query) ||
    (activeDomain === 'ai_engineer' && /^(rag|vector|embeddings?|search|retrieval)$/i.test(query))
  ) {
    const intro = formatHeader('⚡ Production RAG (Retrieval-Augmented Generation) Deep-Dive', isFollowUp, userName);
    return `${intro}You're focusing on one of the most in-demand skills for modern AI Engineers. **Retrieval-Augmented Generation (RAG)** bridges the gap between static LLM foundation models and dynamic, private enterprise data without requiring prohibitively expensive retraining.

---

#### 🏗️ The 5-Stage Production RAG Architecture

\`\`\`
[Document Ingestion] ➡️ [Chunking & Metadata] ➡️ [Dense Embedding]
                                                        ⬇️
[LLM Answer + Citations] ⬅️ [Cross-Encoder Rerank] ⬅️ [Hybrid Search (Dense + BM25)]
\`\`\`

1. **Document Processing & Chunking**: Recursive Character Chunking (500 tokens with 10% overlap) with rich section metadata.
2. **Vector Embeddings**: Dense embeddings (\`bge-large-en-v1.5\`) combined with sparse BM25 indexing.
3. **Vector Storage & Hybrid Retrieval**: Qdrant / ChromaDB / PostgreSQL with pgvector, merged via Reciprocal Rank Fusion (RRF).
4. **Cross-Encoder Reranking**: \`cross-encoder/ms-marco-MiniLM-L-6-v2\` re-scoring top-20 chunks down to top 3–5.
5. **Strict Grounding**: Prompt guardrails enforcing source page citations and zero hallucination.

Would you like a sample Python implementation of a Hybrid Search + Reranker pipeline, or shall we explore RAG evaluation metrics?`;
  }

  // -------------------------------------------------------------
  // Primary Domain Roadmaps
  // -------------------------------------------------------------

  // AI Engineer / Machine Learning Roadmap
  if (/ai engineer|machine learning|artificial intelligence|deep learning|nlp|generative ai/i.test(query)) {
    const intro = formatHeader('🚀 Comprehensive AI Engineer Career Roadmap (Fresher Edition)', isFollowUp, userName);
    return `${intro}Embarking on an **AI Engineer** career as a fresher is one of the highest-leverage decisions in today's tech landscape. While machine learning researchers focus on mathematical theory and novel algorithms, an **AI Engineer** focuses on building, fine-tuning, evaluating, deploying, and maintaining production-grade intelligent systems.

---

#### 📌 Phase 1: Foundations & Mathematical Intuition (Months 1–2)
* Python 3 OOP, decorators, generators, type hinting, and \`asyncio\`.
* Linear Algebra, Calculus (gradients, chain rule), and Probability.

#### 📊 Phase 2: Data Engineering & Classical Machine Learning (Months 3–4)
* \`numpy\` vectorized operations, \`pandas\` aggregations & data cleaning, and SQL queries.
* Supervised (XGBoost, Random Forests) and Unsupervised (K-Means, PCA) learning.

#### 🧠 Phase 3: Deep Learning & Neural Frameworks (Months 5–6)
* Deep dive into **PyTorch** (Tensors, Autograd, custom Datasets & DataLoaders, \`nn.Module\`, AdamW).
* Neural architecture foundations (MLPs, CNNs, tokenization/embeddings).

#### ⚡ Phase 4: Modern Generative AI & LLM Engineering (Months 7–8)
* Hugging Face transformers, PEFT for LoRA/QLoRA fine-tuning.
* Vector databases (Qdrant, ChromaDB, Pinecone), hybrid search, and cross-encoder reranking.

#### 🚢 Phase 5: MLOps, Production APIs & Cloud Deployment (Months 9–10)
* Serving with async **FastAPI**, **vLLM**, or **Ollama**.
* Containerization (Docker), model quantization (GGUF, AWQ), and cloud hosting.

What specific area (e.g. **RAG architecture**, **PyTorch basics**, or **interview prep**) would you like to explore next?`;
  }

  // Web Development / Full-Stack
  if (/web developer|web development|frontend|front end|full stack|fullstack|react|next\.js|javascript|typescript/i.test(query)) {
    const intro = formatHeader('🌐 Modern Full-Stack & Web Developer Roadmap', isFollowUp, userName);
    return `${intro}Web and full-stack development remains one of the most versatile and high-demand career paths. Modern web engineering requires a solid grasp of client-side performance, server architectures, and database design.

---

#### 🛠️ Core Learning Phases
1. **Modern Frontend (Months 1–3)**: TypeScript, React 19, Tailwind CSS, Next.js App Router, state management (Zustand/TanStack Query).
2. **Backend Architecture (Months 4–5)**: Node.js / Express or Go, REST & GraphQL APIs, authentication (JWT, OAuth2, RBAC).
3. **Database & Systems (Months 6–7)**: PostgreSQL with Prisma ORM, Redis caching, indexing, and connection pooling.
4. **DevOps & Cloud (Months 8–9)**: Docker, CI/CD with GitHub Actions, deployment on Vercel, AWS, or Railway.

What specific area (e.g., frontend state management, backend APIs, or database design) would you like to focus on?`;
  }

  // Interview Strategy
  if (/interview|coding test|resume|cv|salary|switch career|transition|job search/i.test(query)) {
    const intro = formatHeader('🎯 Technical Interview & Career Acceleration Strategy', isFollowUp, userName);
    return `${intro}Standing out in a competitive job market requires a structured, multi-pronged approach:

---

#### 1. Resume & Online Presence Optimization
* **ATS Compatibility**: Clean single-column format with standard headings.
* **Google XYZ Formula**: *"Accomplished [X], as measured by [Y], by doing [Z]"*.
* **GitHub Polish**: Pin top 2-3 repositories with comprehensive README files and live preview links.

#### 2. Technical Interview Mastery
* **Coding Challenges**: Focus on 75 essential patterns (Two Pointers, Sliding Window, Trees/Graphs) on LeetCode.
* **System Design & Architecture**: Understand caching, database choice trade-offs, load balancing, and API rate limiting.
* **Behavioral Rounds (STAR Method)**: Situation, Task, Action, Result.

What specific interview or resume aspect would you like to refine today?`;
  }

  // Context-Aware Followup Fallback
  if (activeDomain === 'java_fullstack') {
    return getJavaFullStackProjects(isFollowUp, userName);
  }

  // General Comprehensive Career Guidance Fallback
  const intro = formatHeader('🧭 Career Guidance & Strategic Next Steps', isFollowUp, userName);
  return `${intro}Whether you're exploring new technical horizons, building production projects, or preparing for high-impact developer roles, here is an actionable strategy to maximize your momentum:

---

#### 1. Establish Clear 30-Day Milestones
* **Focus on Depth Over Breadth**: Mastering one core stack (e.g. Java Full-Stack, Modern Web, or AI Engineering) is far more valuable than shallow familiarity with ten different tools.
* **Build Production-Grade Projects**: Rather than tutorial clones, build 1 end-to-end application that solves a real problem, handles edge cases, and is deployed live with automated tests.

#### 2. Three Pillars of Career Acceleration
1. **Technical Execution**: Writing clean, modular, tested code with version control and automated deployments.
2. **Architectural Understanding**: Understanding *why* tools are chosen (e.g., SQL vs. NoSQL, Server-side vs. Client-side rendering).
3. **Communication & Visibility**: Sharing your technical milestones on GitHub and LinkedIn, and explaining complex concepts clearly.

Please let me know which technical domain, role, or project you'd like to dive into, and I will generate a step-by-step roadmap tailored specifically for you!`;
}

module.exports = {
  generateCareerAdvisorResponse,
};
