/**
 * CareerForge Autonomous Career Knowledge Service
 * 
 * Provides comprehensive, structured career guidance, technology roadmaps,
 * project suggestions, interview prep, and actionable career blueprints.
 * Serves as an instant, zero-downtime advisor with contextual multi-turn memory.
 */

function generateCareerAdvisorResponse(userMessage = '', messageHistory = [], options = {}) {
  const query = (userMessage || '').trim().toLowerCase();
  const userName = options.userName || 'there';

  // -------------------------------------------------------------
  // 1. Context Extraction from Previous Message History
  // -------------------------------------------------------------
  let activeDomain = 'general';
  let lastAssistantMsg = '';
  let lastUserMsg = '';

  if (Array.isArray(messageHistory) && messageHistory.length > 0) {
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
        if (/ai engineer|machine learning|deep learning|rag|pytorch|llm|generative ai/i.test(text)) {
          activeDomain = 'ai_engineer';
        } else if (/web developer|full[- ]?stack|frontend|react|node/i.test(text)) {
          activeDomain = 'web_dev';
        } else if (/backend|database|microservices|postgresql|golang|java/i.test(text)) {
          activeDomain = 'backend';
        } else if (/devops|cloud|kubernetes|docker|aws/i.test(text)) {
          activeDomain = 'devops';
        } else if (/data analyst|data analysis|power bi|tableau/i.test(text)) {
          activeDomain = 'data_analyst';
        } else if (/cybersecurity|security engineer|pentest/i.test(text)) {
          activeDomain = 'cybersecurity';
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 2. Specific Topic Deep-Dives (Priority 1)
  // -------------------------------------------------------------

  // TOPIC: RAG (Retrieval-Augmented Generation) & Vector Search
  if (
    /\b(rag|retrieval[- ]augmented|vector (database|db|search|embeddings?|store)|chromadb|pinecone|qdrant|pgvector|chunking|reranking)\b/i.test(query) ||
    (activeDomain === 'ai_engineer' && /^(rag|vector|embeddings?|search|retrieval)$/i.test(query))
  ) {
    return `### ⚡ Production RAG (Retrieval-Augmented Generation) Deep-Dive

Hello **${userName}**! You're focusing on one of the most in-demand skills for modern AI Engineers. **Retrieval-Augmented Generation (RAG)** bridges the gap between static LLM foundation models and dynamic, private enterprise data without requiring prohibitively expensive retraining.

---

#### 🏗️ The 5-Stage Production RAG Architecture

\`\`\`
[Document Ingestion] ➡️ [Chunking & Metadata] ➡️ [Dense Embedding]
                                                        ⬇️
[LLM Answer + Citations] ⬅️ [Cross-Encoder Rerank] ⬅️ [Hybrid Search (Dense + BM25)]
\`\`\`

1. **Document Processing & Chunking**:
   * **Semantic Chunking**: Instead of arbitrary character counts, split documents by heading tags, paragraphs, or sentence boundaries (e.g. \`RecursiveCharacterTextSplitter\` with 500-token chunks and 10% overlap).
   * **Rich Metadata Enrichment**: Attach document title, page number, section header, and creation date to every chunk to enable metadata pre-filtering.

2. **Vector Embeddings**:
   * Generate vector representations using state-of-the-art embedding models:
     * **Open Source**: \`BAAI/bge-large-en-v1.5\` or \`nomic-embed-text\`.
     * **Managed**: OpenAI \`text-embedding-3-small\` (1536 dims) or Cohere \`embed-english-v3.0\`.

3. **Vector Storage & Hybrid Retrieval**:
   * **Vector Engines**: Use **Qdrant**, **ChromaDB**, **Pinecone**, or **PostgreSQL with pgvector**.
   * **Hybrid Search (Dense + Sparse)**: Pure vector search often struggles with exact keyword matches (e.g. product IDs, legal clauses). Combine dense semantic embeddings with sparse **BM25 keyword search** using Reciprocal Rank Fusion (RRF).

4. **Cross-Encoder Reranking**:
   * Retrieve the top 20 candidate chunks via hybrid search, then pass \`(query, chunk)\` pairs through a **Cross-Encoder** (such as \`bge-reranker-large\` or Cohere Rerank API) to pick the top 3–5 highest-relevance passages.

5. **Context Ingestion & Strict Prompting**:
   * Inject retrieved context into the LLM system prompt with strict guardrails:
     > *"Answer the question strictly using the provided context. If the answer cannot be deduced, explicitly state 'Information not found in context'. Always cite the source document and page number."*

---

#### 🚀 Advanced RAG Techniques Recruiters Look For

* **HyDE (Hypothetical Document Embeddings)**: Have the LLM generate a hypothetical ideal answer first, embed that answer, and use its embedding to search for real documents.
* **Parent-Document Retrieval**: Search over small, granular 100-token chunks for high embedding accuracy, but retrieve the full 1,000-token parent section for LLM context.
* **Evaluation with Ragas**: Benchmark your RAG system on **Faithfulness** (no hallucinations), **Answer Relevance**, and **Context Recall** on a test golden dataset.

---

#### 💻 Recommended Tech Stack & Starter Project
* **Orchestration**: Python 3.11+, LangChain / LlamaIndex, or raw HTTP client with **FastAPI**.
* **Vector Store**: Qdrant or ChromaDB running in Docker.
* **Portfolio Project**: Build an *"Enterprise Legal / Financial Contract Q&A Portal"* with source page citation, PDF viewer highlighting, and latency monitoring.

Would you like a sample Python implementation of a Hybrid Search + Reranker pipeline, or shall we explore RAG evaluation metrics?`;
  }

  // TOPIC: PyTorch, Neural Networks & Deep Learning Foundations
  if (/\b(pytorch|torch|tensors?|autograd|dataloader|nn\.module|backpropagation|adamw|gradient descent)\b/i.test(query)) {
    return `### 🧠 PyTorch & Deep Learning Foundations

Hello **${userName}**! **PyTorch** is the undisputed industry standard for deep learning research and modern model engineering. Mastering PyTorch means understanding how computation graphs and backward gradients operate under the hood.

---

#### 🔑 The 4 Pillars of PyTorch Mastery

1. **Tensors & GPU Acceleration**:
   * Multi-dimensional arrays with CUDA support (\`tensor.to('cuda')\`).
   * Memory layout, broadcasting semantics, and contiguous tensor operations.
2. **Autograd & Computation Graphs**:
   * Dynamic computational graphs built on the fly.
   * Tracking gradients with \`requires_grad=True\`, forward pass, \`loss.backward()\`, and \`optimizer.step()\`.
3. **Data Pipelines (\`Dataset\` & \`DataLoader\`)**:
   * Writing custom \`torch.utils.data.Dataset\` with \`__len__\` and \`__getitem__\`.
   * High-throughput batching, worker threads (\`num_workers\`), and pin-memory GPU transfers.
4. **Model Architecture (\`nn.Module\`)**:
   * Encapsulating layers, forward execution, loss functions (\`CrossEntropyLoss\`, \`MSELoss\`), and optimizers (\`AdamW\`).

---

#### 🛠️ Typical PyTorch Training Loop Blueprint

\`\`\`python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

model = MyCustomModel().to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=0.01)

for epoch in range(num_epochs):
    model.train()
    for batch_x, batch_y in dataloader:
        batch_x, batch_y = batch_x.to(device), batch_y.to(device)
        
        optimizer.zero_grad()
        predictions = model(batch_x)
        loss = criterion(predictions, batch_y)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
\`\`\`

Would you like to build a custom CNN for image classification or explore fine-tuning a transformer with PyTorch?`;
  }

  // TOPIC: Fine-Tuning, LoRA, QLoRA & Transformers
  if (/\b(fine[- ]?tuning|lora|qlora|peft|sft|adapter|quantization|bitsandbytes|transformer architecture)\b/i.test(query)) {
    return `### ⚡ LLM Fine-Tuning: LoRA & QLoRA Guide

Hello **${userName}**! While RAG is best for giving models access to dynamic enterprise knowledge, **Fine-Tuning** is best for changing a model's style, format, specialized vocabulary, or teaching it complex reasoning patterns.

---

#### 🎯 When to Fine-Tune vs. When to Use RAG
* **Use RAG when**: Information changes frequently, factual accuracy requires citations, or cost efficiency is priority.
* **Use Fine-Tuning when**: You need strict JSON output formats, domain-specific tone/jargon (medical/legal), or reducing prompt length by baking knowledge into model weights.

---

#### 🔬 LoRA (Low-Rank Adaptation) & QLoRA Mechanics
1. **The Core Concept**: Instead of modifying all 8 billion parameters, LoRA freezes the original weight matrix $W$ and trains small rank-decomposition matrices $A$ and $B$:
   $$W_{\\text{updated}} = W_0 + (B \\times A) \\times \\frac{\\alpha}{r}$$
2. **QLoRA (Quantized LoRA)**:
   * Quantizes the base model weights to **4-bit NormalFloat (NF4)** using \`bitsandbytes\`.
   * Enables fine-tuning an 8B model (like Llama 3 8B) on a single consumer GPU with only 16GB VRAM!

#### 🛠️ Essential Tech Stack
* **Libraries**: Hugging Face \`transformers\`, \`peft\`, \`trl\` (SFTTrainer), and \`accelerate\`.
* **Dataset Format**: Instruction-tuning format (\`{"instruction": "...", "input": "...", "output": "..."}\`).

Would you like a step-by-step tutorial on preparing an instruction dataset and running an SFTTrainer script?`;
  }

  // TOPIC: MLOps, Model Serving & Deployment
  if (/\b(mlops|model serving|fastapi.*model|triton|vllm|ollama|model deployment|docker.*model)\b/i.test(query)) {
    return `### 🚢 MLOps & Production Model Serving

Hello **${userName}**! Transitioning from a Jupyter notebook to a production-grade inference service is what separates a student from a professional AI Engineer.

---

#### 🛠️ Key Components of Modern Model Serving

1. **High-Throughput Inference Engines**:
   * **vLLM**: PagedAttention memory management, continuous batching, and tensor parallelism. Up to 20x higher throughput than standard Hugging Face pipelines!
   * **Ollama**: Instant local deployment and API serving of GGUF quantized models.
   * **Triton Inference Server**: Enterprise multi-model concurrent execution on GPU clusters.

2. **Async API Layer (FastAPI)**:
   * Non-blocking asynchronous endpoints with streaming responses (SSE - Server-Sent Events).
   * Request queuing and Pydantic schema validation.

3. **Containerization & Cloud Infrastructure**:
   * Multi-stage Dockerfiles with NVIDIA CUDA container runtime.
   * Cloud hosting on AWS ECS/SageMaker, GCP Cloud Run, or RunPod/Modal for cost-effective serverless GPUs.

Would you like to see a production FastAPI Docker setup for serving an LLM with streaming responses?`;
  }

  // -------------------------------------------------------------
  // 3. Phase Deep-Dive Requests (e.g., "Phase 1", "Phase 3")
  // -------------------------------------------------------------
  if (/phase 1|foundations|math.*ml|python foundations/i.test(query)) {
    return `### 📌 Deep Dive: Phase 1 — Foundations & Mathematical Intuition

Hello **${userName}**! Building rock-solid fundamentals in Phase 1 ensures you understand *why* models converge or fail, rather than just treating them as black boxes.

---

#### 1. Python 3 Mastery for AI
* **Advanced Idioms**: Decorators for timing/caching, Generators for streaming large datasets without running out of RAM, and Type Hinting with Pydantic.
* **Concurrency**: Asynchronous I/O (\`asyncio\`) for concurrent API calls and data scrapers.

#### 2. Essential Mathematics
* **Linear Algebra**: Matrix multiplications, dot product similarity, and Singular Value Decomposition (SVD).
* **Calculus**: Partial derivatives, the Chain Rule (the core engine of backpropagation), and loss gradients.
* **Probability**: Bayes' Theorem, maximum likelihood estimation, and confidence intervals.

#### 3. Recommended Week-by-Week Milestones
* **Weeks 1–3**: Python Object-Oriented programming, Git workflows, and environment isolation (\`poetry\` / \`venv\`).
* **Weeks 4–8**: 3Blue1Brown's *"Essence of Linear Algebra"* & *"Essence of Calculus"*, implementing gradient descent from scratch in pure NumPy.

Ready to test your math intuition or would you like a mini coding challenge in NumPy?`;
  }

  if (/phase 4|generative ai roadmap|llm engineering/i.test(query)) {
    return `### ⚡ Deep Dive: Phase 4 — Modern Generative AI & LLM Engineering

Hello **${userName}**! Phase 4 is where you master the technologies currently driving the AI revolution: **Transformers, RAG, and Autonomous Agents**.

---

#### 🔑 Core Milestones
1. **Transformer Internals**: Understand Self-Attention mechanisms, multi-head attention, rotary positional embeddings (RoPE), and KV-caching.
2. **Retrieval-Augmented Generation (RAG)**: Connect vector databases (ChromaDB, Qdrant) with hybrid search and reranking to ground LLM outputs in private data.
3. **AI Agents & Tool Calling**: Use Function Calling and Structured Outputs to allow models to execute Python scripts, query SQL databases, and search the web.
4. **Evaluation**: Benchmark systems using Ragas or TruLens rather than relying on qualitative "vibes".

Which subtopic would you like to build first: a **RAG Document Q&A portal** or a **Tool-Calling AI Agent**?`;
  }

  // -------------------------------------------------------------
  // 4. Primary Domain Roadmaps
  // -------------------------------------------------------------

  // AI Engineer / Machine Learning Roadmap
  if (/ai engineer|machine learning|artificial intelligence|deep learning|nlp|generative ai/i.test(query)) {
    return `### 🚀 Comprehensive AI Engineer Career Roadmap (Fresher Edition)

Hello **${userName}**! Embarking on an **AI Engineer** career as a fresher is one of the highest-leverage decisions in today's tech landscape. While machine learning researchers focus on mathematical theory and novel algorithms, an **AI Engineer** focuses on building, fine-tuning, evaluating, deploying, and maintaining production-grade intelligent systems.

Here is your comprehensive, battle-tested roadmap designed to take you from a fresher to job-ready:

---

#### 📌 Phase 1: Foundations & Mathematical Intuition (Months 1–2)
* **Core Language (Python)**: Master Python 3 OOP, decorators, generators, type hinting, and \`asyncio\`.
* **Essential Mathematics**: Linear Algebra (dot products, matrices), Calculus (gradients, chain rule), and Probability & Statistics.
* **Developer Hygiene**: Git workflows, Linux CLI, and reproducible Jupyter environments.

---

#### 📊 Phase 2: Data Engineering & Classical Machine Learning (Months 3–4)
* **Data Processing**: \`numpy\` vectorized operations, \`pandas\` aggregations & data cleaning, and optimized SQL queries.
* **Classical ML (Scikit-Learn)**: Supervised (XGBoost, Random Forests) and Unsupervised (K-Means, PCA) learning.
* **Validation**: Cross-validation, ROC-AUC, F1-Score, and avoiding data leakage.

---

#### 🧠 Phase 3: Deep Learning & Neural Frameworks (Months 5–6)
* **Framework Mastery**: Deep dive into **PyTorch** (Tensors, Autograd, custom Datasets & DataLoaders, \`nn.Module\`, AdamW).
* **Neural Architecture Foundations**: MLPs, CNNs for computer vision, and tokenization/embeddings for NLP.

---

#### ⚡ Phase 4: Modern Generative AI & LLM Engineering (Months 7–8)
* **Transformers**: Hugging Face \`transformers\`, \`peft\` for LoRA/QLoRA fine-tuning.
* **RAG (Retrieval-Augmented Generation)**: Vector databases (Qdrant, ChromaDB, Pinecone), hybrid search, and cross-encoder reranking.
* **AI Agents & Tool Calling**: Orchestrating multi-step workflows, function calling, and structured JSON outputs.

---

#### 🚢 Phase 5: MLOps, Production APIs & Cloud Deployment (Months 9–10)
* **Serving**: High-performance APIs with async **FastAPI**, **vLLM**, or **Ollama**.
* **Containerization & Deployment**: Multi-stage Dockerfiles, model quantization (GGUF, AWQ), CI/CD, and cloud hosting.

---

#### 🏆 3 High-Impact Portfolio Projects
1. **Production Enterprise RAG System**: PDF document intelligence portal with hybrid search and source page citations.
2. **Domain-Specific Fine-Tuned Model**: Fine-tune an open-source model (Llama 3 8B) on legal or medical Q&A with LoRA.
3. **Multimodal AI Assistant**: Real-time voice-to-text with Whisper, LLM reasoning, and vision document analysis.

What specific area (e.g. **RAG architecture**, **PyTorch basics**, or **interview prep**) would you like to explore next?`;
  }

  // Web Development / Full-Stack
  if (/web developer|web development|frontend|front end|full stack|fullstack|react|next\.js|javascript|typescript/i.test(query)) {
    return `### 🌐 Modern Full-Stack & Web Developer Roadmap

Hello **${userName}**! Web and full-stack development remains one of the most versatile and high-demand career paths. Modern web engineering requires a solid grasp of client-side performance, server architectures, and database design.

---

#### 🛠️ Core Learning Phases
1. **Modern Frontend (Months 1–3)**: TypeScript, React 19, Tailwind CSS, Next.js App Router, state management (Zustand/TanStack Query).
2. **Backend Architecture (Months 4–5)**: Node.js / Express or Go, REST & GraphQL APIs, authentication (JWT, OAuth2, RBAC).
3. **Database & Systems (Months 6–7)**: PostgreSQL with Prisma ORM, Redis caching, indexing, and connection pooling.
4. **DevOps & Cloud (Months 8–9)**: Docker, CI/CD with GitHub Actions, deployment on Vercel, AWS, or Railway.

What specific area (e.g., frontend state management, backend APIs, or database design) would you like to focus on?`;
  }

  // Backend / Systems
  if (/backend|server logic|rest api|graphql|microservice|database engineer|postgresql|golang|java developer/i.test(query)) {
    return `### ⚙️ Backend & Distributed Systems Engineering Roadmap

Hello **${userName}**! Backend engineering powers the logic, security, and scalability of modern software.

---

#### 🛠️ Core Roadmap
1. **Core Language**: Master Go, TypeScript/Node.js, or Java/Spring Boot with clean architectural patterns.
2. **Database Mastery**: ACID compliance, PostgreSQL indexing, query optimization, and Redis caching.
3. **API Architecture**: RESTful design principles, OpenAPI specifications, gRPC for microservice communication.
4. **System Design**: Load balancing, rate limiting, message queues (Kafka, RabbitMQ), and idempotency.

Which area would you like to dive into first: database query optimization or microservice architecture?`;
  }

  // DevOps & Cloud
  if (/devops|cloud|sre|site reliability|aws|azure|gcp|kubernetes|docker|terraform|ci\/cd/i.test(query)) {
    return `### ☁️ Cloud, DevOps & SRE Roadmap

Hello **${userName}**! Cloud and DevOps engineers enable automated, reliable, and scalable software delivery.

---

#### 🛠️ Core Roadmap
1. **Linux & Scripting**: Bash, Linux system internals, networking protocols (TCP/IP, DNS, SSL/TLS).
2. **Containerization**: Docker multi-stage builds, rootless containers, and compose orchestration.
3. **Kubernetes (K8s)**: Pods, Deployments, Services, Ingress controllers, and Helm charts.
4. **Infrastructure as Code (IaC)**: Terraform / OpenTofu for automated cloud provisioning.
5. **CI/CD Pipelines**: GitHub Actions, automated test suites, and container registry security scanning.

Would you like to discuss Kubernetes fundamentals or building an end-to-end GitHub Actions CI/CD pipeline?`;
  }

  // Interview Prep
  if (/interview|coding test|resume|cv|portfolio|salary|switch career|transition|job search/i.test(query)) {
    return `### 🎯 Technical Interview & Career Acceleration Strategy

Hello **${userName}**! Standing out in a competitive job market requires a structured, multi-pronged approach:

---

#### 1. Resume & Online Presence Optimization
* **ATS Compatibility**: Use a clean single-column format with standard headings (Experience, Projects, Skills, Education).
* **Impact-Driven Bullets**: Use the Google XYZ formula: *"Accomplished [X], as measured by [Y], by doing [Z]"* (e.g., *"Optimized database queries, reducing API p95 response time by 42% using Redis caching"*).
* **GitHub Polish**: Pin your top 2-3 repositories with comprehensive README files, architectural diagrams, and live preview links.

#### 2. Technical Interview Mastery
* **Coding Challenges**: Focus on 75 essential patterns (Two Pointers, Sliding Window, Trees/Graphs, Dynamic Programming basics) on LeetCode/NeetCode.
* **System Design & Architecture**: Understand caching, database choice trade-offs, load balancing, and API rate limiting.
* **Behavioral Rounds (STAR Method)**: Prepare 4-5 core stories covering technical challenges, conflict resolution, deadlines, and proudest achievements using **Situation, Task, Action, Result**.

What specific interview or resume aspect would you like to refine today?`;
  }

  // -------------------------------------------------------------
  // 5. Context-Aware Fallback (Remembers what you were discussing)
  // -------------------------------------------------------------
  if (activeDomain === 'ai_engineer') {
    return `### 🤖 AI Engineering: Deepening Your Mastery

Hello **${userName}**! Building upon our discussion on **AI Engineering**:

Whether you are working on **mathematical foundations (Phase 1)**, **machine learning algorithms (Phase 2)**, **PyTorch deep learning (Phase 3)**, **RAG & LLM agents (Phase 4)**, or **production deployment (Phase 5)**, each step connects directly into building high-impact systems.

Here are the highest-leverage areas you can explore right now:
1. **RAG & Semantic Search**: Connect private PDFs/documents to LLMs with vector search and rerankers.
2. **PyTorch Model Building**: Build and train custom neural networks with PyTorch.
3. **Fine-Tuning with LoRA/QLoRA**: Adapt open-source models (e.g., Llama 3) for domain-specific tasks.
4. **Portfolio Projects**: Build an end-to-end deployed AI application that recruiters can test live.

Which of these would you like to break down into actionable steps?`;
  }

  // -------------------------------------------------------------
  // 6. General Comprehensive Career Guidance Fallback
  // -------------------------------------------------------------
  return `### 🧭 Career Guidance & Strategic Next Steps

Hello **${userName}**! Thank you for reaching out. Whether you're exploring new technical horizons, building production projects, or preparing for high-impact developer roles, here is an actionable strategy to maximize your momentum:

---

#### 1. Establish Clear 30-Day Milestones
* **Focus on Depth Over Breadth**: Mastering one core stack (e.g., Full-Stack Web, AI/Data Engineering, or Cloud/DevOps) is far more valuable than shallow familiarity with ten different tools.
* **Build Production-Grade Projects**: Rather than small tutorial clones, build 1 end-to-end application that solves a real problem, handles edge cases, and is deployed live with automated tests.

#### 2. Three Pillars of Career Acceleration
1. **Technical Execution**: Writing clean, modular, tested code with version control and automated deployments.
2. **Architectural Understanding**: Understanding *why* tools are chosen (e.g., SQL vs. NoSQL, Server-side vs. Client-side rendering).
3. **Communication & Visibility**: Sharing your technical milestones on GitHub and LinkedIn, and practicing explaining complex technical concepts clearly.

Please let me know which technical domain, role, or project you'd like to dive into, and I will generate a step-by-step roadmap tailored specifically for you!`;
}

module.exports = {
  generateCareerAdvisorResponse,
};
