/**
 * CareerForge Autonomous Career Knowledge Service
 * 
 * Provides comprehensive, structured career guidance, technology roadmaps,
 * project suggestions, interview prep, and actionable career blueprints.
 * Serves as an instant, zero-downtime advisor when external AI gateways are offline.
 */

function generateCareerAdvisorResponse(userMessage = '', messageHistory = [], options = {}) {
  const query = (userMessage || '').trim().toLowerCase();
  const userName = options.userName || 'there';

  // 1. AI Engineer / Machine Learning Roadmap
  if (/ai engineer|machine learning|artificial intelligence|deep learning|nlp|llm|generative ai|prompt engineering|pytorch|computer vision/i.test(query)) {
    return `### 🚀 Comprehensive AI Engineer Career Roadmap (Fresher Edition)

Hello **${userName}**! Embarking on an **AI Engineer** career as a fresher is one of the highest-leverage decisions in today's tech landscape. While machine learning researchers focus on mathematical theory and novel algorithms, an **AI Engineer** focuses on building, fine-tuning, evaluating, deploying, and maintaining production-grade intelligent systems.

Here is your comprehensive, battle-tested roadmap designed to take you from a fresher to job-ready:

---

#### 📌 Phase 1: Foundations & Mathematical Intuition (Months 1–2)
* **Core Language (Python)**:
  * Master Python 3 idioms: Object-Oriented Programming (OOP), decorators, generators, list comprehensions, type hinting, and asynchronous programming (\`asyncio\`).
  * Packaging and environment management (\`venv\`, \`poetry\`, \`pip\`).
* **Essential Mathematics**:
  * **Linear Algebra**: Vector spaces, matrix transformations, dot products, eigenvalues & eigenvectors.
  * **Calculus**: Partial derivatives, the chain rule, and gradient descent optimization algorithms.
  * **Probability & Statistics**: Normal distributions, Bayes' Theorem, hypothesis testing, p-values, and statistical significance.
* **Developer Hygiene**: Git workflows (branching, PRs, semantic commit messages), Linux CLI commands, and reproducible Jupyter environments.

---

#### 📊 Phase 2: Data Engineering & Classical Machine Learning (Months 3–4)
* **Data Processing & Manipulation**:
  * \`numpy\` for high-performance vectorized operations.
  * \`pandas\` for data cleaning, handling missing values, window aggregations, and merging disparate datasets.
* **Exploratory Data Analysis (EDA)**: Visual storytelling using \`matplotlib\`, \`seaborn\`, and interactive charts with \`plotly\`.
* **Relational Data & SQL**: Writing optimized SQL queries (JOINs, GROUP BY, Window functions, indexing) to extract datasets directly from databases.
* **Classical ML Algorithms (Scikit-Learn)**:
  * **Supervised Learning**: Linear/Logistic Regression, Decision Trees, Random Forests, Gradient Boosted Trees (XGBoost, LightGBM).
  * **Unsupervised Learning**: K-Means clustering, PCA (Dimensionality Reduction), and DBSCAN.
  * **Evaluation & Validation**: Cross-validation, ROC-AUC, Precision, Recall, F1-Score, Confusion Matrix, and avoiding data leakage.

---

#### 🧠 Phase 3: Deep Learning & Neural Frameworks (Months 5–6)
* **Framework Mastery**: Deep dive into **PyTorch** (Tensors, Autograd, custom \`Dataset\` and \`DataLoader\`, custom \`nn.Module\`, loss functions, and optimizers like AdamW).
* **Neural Architecture Foundations**:
  * Multi-Layer Perceptrons (MLPs), Backpropagation, and Regularization (Dropout, Batch Normalization).
  * **Computer Vision**: Convolutional Neural Networks (CNNs), transfer learning with pre-trained ResNet/EfficientNet/Vision Transformers.
  * **NLP Fundamentals**: Tokenization (BPE/WordPiece), embeddings, RNNs, LSTMs, and the Attention mechanism.

---

#### ⚡ Phase 4: Modern Generative AI & LLM Engineering (Months 7–8)
* **Transformer Architectures**: Encoder-only (BERT), Decoder-only (GPT, Llama), and Encoder-Decoder (T5) architectures.
* **Hugging Face Ecosystem**: Using \`transformers\`, \`datasets\`, \`accelerate\`, and \`peft\` for Parameter-Efficient Fine-Tuning (LoRA / QLoRA).
* **Retrieval-Augmented Generation (RAG)**:
  * Text chunking strategies (semantic, recursive character).
  * Embedding models and Vector Databases (Pinecone, ChromaDB, Weaviate, pgvector).
  * Hybrid search (dense vector embeddings + sparse BM25 keyword matching) and reranking models.
* **AI Agents & Tool Calling**: Orchestrating multi-step workflows, function calling, Structured Outputs (JSON schema enforcement), and prompt engineering techniques.

---

#### 🚢 Phase 5: MLOps, Production APIs & Cloud Deployment (Months 9–10)
* **High-Performance APIs**: Wrapping model inference in async **FastAPI** with Pydantic request/response validation.
* **Containerization**: Writing multi-stage **Dockerfiles** for CPU and CUDA GPU environments.
* **Inference Optimization**: Model quantization (GGUF, AWQ, bitsandbytes), ONNX Runtime, and TensorRT-LLM for sub-100ms response times.
* **CI/CD & Monitoring**: Automated GitHub Actions testing, MLflow or Weights & Biases for experiment tracking, and Prometheus/Grafana for monitoring model latency and drift.
* **Cloud Hosting**: Deploying containers on AWS (ECS / SageMaker), Google Cloud Run / Vertex AI, or Hugging Face Spaces.

---

#### 🏆 3 High-Impact Portfolio Projects for Freshers
1. **Production Enterprise RAG System**: Build a full-stack document intelligence portal that ingests PDFs, performs hybrid search, cites exact source pages, and answers user queries with sub-second latency.
2. **Domain-Specific Fine-Tuned Model**: Fine-tune an open-source model (e.g., Llama 3 8B or Mistral 7B) using LoRA on custom medical, financial, or legal Q&A data, and benchmark its performance against the base model.
3. **Multimodal AI Assistant**: A real-time application combining Whisper (speech-to-text), an LLM (reasoning), and a vision model for interactive diagram or document analysis.

---

#### 💡 Actionable Advice for Freshers
1. **Emphasize Engineering Over Pure Theory**: Recruiters look for candidates who write modular, PEP8-compliant, tested Python with clean Dockerfiles, rather than just notebook experiments.
2. **Document Your GitHub Repositories**: Every project must have an architectural diagram, clear instructions for running locally, and a live demo link.
3. **Network Actively**: Publish your project journey, learnings, and benchmarks on LinkedIn and tech communities.

What specific area (e.g. PyTorch basics, RAG architecture, or interview prep) would you like to explore next?`;
  }

  // 2. Web Development / Full-Stack / Frontend
  if (/web developer|web development|frontend|front end|full stack|fullstack|react|next\.js|javascript|typescript|angular|vue/i.test(query)) {
    return `### 🌐 Modern Full-Stack & Web Developer Roadmap

Hello **${userName}**! Web and full-stack development remains one of the most versatile and high-demand career paths. Modern web engineering requires a solid grasp of client-side performance, server architectures, and database design.

---

#### 🛠️ Core Learning Phases
1. **Foundations (Months 1–2)**:
   * Semantic HTML5, modern CSS (Flexbox, Grid, CSS Variables, Tailwind CSS), and responsive design.
   * Modern JavaScript (ES6+): Closures, Promises, Async/Await, DOM manipulation, Fetch API, and Event Loop.
2. **Frontend Modernization (Months 3–4)**:
   * **TypeScript**: Strict types, interfaces, generics, and compiler configuration.
   * **React & Next.js**: Component lifecycle, hooks (\`useState\`, \`useEffect\`, \`useMemo\`), React Server Components (RSC), App Router, dynamic routing, and caching.
   * **State Management**: TanStack Query (React Query) for server state, Zustand for client state.
3. **Backend & APIs (Months 5–6)**:
   * **Node.js & Express / NestJS**: RESTful endpoints, middleware, validation (Zod), and JWT authentication.
   * **Databases**: PostgreSQL with Prisma ORM or TypeORM; Redis for high-speed caching and rate limiting.
4. **DevOps & Production (Months 7–8)**:
   * Dockerizing frontend and backend containers.
   * Continuous integration with GitHub Actions; deployments to Vercel, Render, or AWS EC2.

#### 🏆 Standout Projects to Build
* **Collaborative SaaS Workspace**: A real-time task or document board with live WebSocket updates, optimistic UI, and role-based permissions.
* **E-Commerce Platform with Stripe Checkout**: Complete with product catalog, cart persistence, automated webhook handling, and order management.

Which frontend framework or backend architecture are you focusing on right now?`;
  }

  // 3. Backend / Systems Engineering
  if (/backend|server logic|rest api|graphql|microservice|database engineer|postgresql|spring boot|\.net|golang|c#|java developer/i.test(query)) {
    return `### ⚙️ Backend & Systems Engineering Career Roadmap

Hello **${userName}**! Backend engineering powers the core data, logic, and security of modern applications. Strong backend developers stand out through database fluency, clean API contracts, and scalable system design.

---

#### 🛠️ Core Learning Roadmap
1. **Core Backend Language**: Choose one primary ecosystem and master it deeply:
   * **Node.js / TypeScript**: Event loop, stream processing, Express, NestJS.
   * **Java / Spring Boot**: Dependency injection, Spring Data JPA, Spring Security.
   * **Python / FastAPI**: Asynchronous endpoints, Pydantic validation, SQLAlchemy.
   * **Go (Golang)**: Goroutines, channels, interfaces, high-throughput microservices.
2. **Database Engineering & Data Modeling**:
   * Relational Databases (PostgreSQL, MySQL): ACID transactions, indexing strategies (B-Tree, Hash), EXPLAIN query plans, normalization.
   * Caching & In-Memory Stores: Redis for caching, session stores, and pub/sub messaging.
3. **Architecture & Distributed Systems**:
   * RESTful APIs, GraphQL, and gRPC.
   * Message Queues & Event Streaming: RabbitMQ, Apache Kafka for asynchronous background workloads.
   * Authentication & Security: JWT, OAuth2, RBAC, input sanitization, and SQL injection prevention.
4. **System Design & Scalability**:
   * Load balancers, horizontal vs. vertical scaling, database sharding, and connection pooling.

Would you like to dive deeper into database query optimization or system design principles?`;
  }

  // 4. Cloud, DevOps & Site Reliability Engineering (SRE)
  if (/devops|cloud|sre|site reliability|aws|azure|gcp|kubernetes|docker|terraform|ci\/cd|infrastructure/i.test(query)) {
    return `### ☁️ Cloud, DevOps & SRE Career Blueprint

Hello **${userName}**! The demand for engineers who can automate infrastructure, secure cloud environments, and maintain five-nines (99.999%) reliability is at an all-time high.

---

#### 🛠️ Core Progression
1. **Operating Systems & Networking**: Linux administration, Bash scripting, SSH, DNS, TCP/IP, HTTP/HTTPS, SSL/TLS certificates.
2. **Containers & Orchestration**:
   * **Docker**: Building lean multi-stage images, managing container networking, and Docker Compose.
   * **Kubernetes (K8s)**: Pods, Deployments, Services, Ingress controllers, ConfigMaps, and Helm charts.
3. **Infrastructure as Code (IaC)**:
   * **Terraform**: Declarative cloud provisioning across AWS, GCP, or Azure; managing state files and reusable modules.
4. **CI/CD Automation**:
   * Designing automated GitHub Actions, GitLab CI, or Jenkins pipelines with automated linting, testing, image building, and automated deployment.
5. **Observability & Monitoring**:
   * Prometheus (metrics collection), Grafana (visual dashboards), and ELK Stack / OpenTelemetry for distributed tracing.

Which cloud provider (AWS, Azure, or GCP) are you targeting for your certifications and projects?`;
  }

  // 5. Data Analyst / Analytics Engineering
  if (/data analyst|data analysis|business analyst|power bi|tableau|sql.*data|excel.*analytics/i.test(query)) {
    return `### 📈 Data Analyst & Analytics Engineering Roadmap

Hello **${userName}**! As a Data Analyst, your superpower is turning raw data into actionable business intelligence that drives executive decisions.

---

#### 🛠️ Core Skills to Master
1. **Advanced SQL (The Foundation)**:
   * Aggregations, Subqueries, Common Table Expressions (CTEs), and Window Functions (\`ROW_NUMBER()\`, \`RANK()\`, \`LEAD()\`, \`LAG()\`).
2. **Business Intelligence & Visualization**:
   * **Power BI** or **Tableau**: Designing executive KPI dashboards, calculated measures (DAX), and automated data refreshes.
3. **Python for Analytics**:
   * \`pandas\` and \`numpy\` for data manipulation and statistical summaries.
   * Automated reporting and data cleaning scripts.
4. **Business Acumen & Storytelling**:
   * Translating business problems into quantitative metrics (LTV, CAC, Churn, ARR).
   * Presenting findings clearly to non-technical stakeholders.

Would you like advice on building an impressive SQL and Power BI portfolio project?`;
  }

  // 6. Cybersecurity & Information Security
  if (/cybersecurity|security engineer|infosec|ethical hacking|penetration testing|soc analyst|owasp/i.test(query)) {
    return `### 🛡️ Cybersecurity Career Roadmap

Hello **${userName}**! Cybersecurity is a vital, high-growth field with opportunities spanning defensive operations (Blue Team) to ethical hacking and vulnerability analysis (Red Team).

---

#### 🛠️ Core Roadmap
1. **Foundations**: Networking protocols (OSI model, Subnetting, TCP/IP, DNS, VPNs), Linux system administration, and Python/Bash scripting.
2. **Application & Web Security**: Understanding OWASP Top 10 vulnerabilities (SQL Injection, XSS, CSRF, Broken Access Control) and security headers.
3. **Defensive Security (Blue Team)**: SIEM log analysis (Splunk, Elastic), incident detection, intrusion detection systems (Snort/Suricata), and vulnerability scanning.
4. **Offensive Security (Red Team)**: Penetration testing tools (Burp Suite, Nmap, Metasploit, Wireshark), CTF challenges (TryHackMe, HackTheBox).
5. **Certifications to Consider**: CompTIA Security+, CEH, or eJPT for foundational credentials.

Which direction interests you more: Defensive Security (SOC Analyst/AppSec) or Offensive Security (Penetration Tester)?`;
  }

  // 7. UI/UX & Product Design
  if (/ui\/ux|ui design|ux design|product design|figma|user research|wireframing/i.test(query)) {
    return `### 🎨 UI/UX & Product Design Roadmap

Hello **${userName}**! Great digital product design combines deep user empathy, visual craft, and intuitive interaction architecture.

---

#### 🛠️ Core Roadmap
1. **Design Fundamentals**: Visual hierarchy, color theory, typography scales, contrast ratios, and spacing tokens (8pt grid system).
2. **Figma Mastery**: Auto-layout, components & variants, interactive prototyping, variables, and design tokens.
3. **UX Research & Heuristics**: User personas, journey mapping, usability heuristics (Nielsen Norman principles), and accessibility (WCAG AA/AAA compliance).
4. **Design-to-Code Handoff**: Understanding HTML/CSS constraints to collaborate seamlessly with frontend engineers.
5. **Portfolio Case Studies**: Documenting 2-3 detailed case studies showing the problem statement, user research, wireframes, iterations, and final UI.

Would you like to discuss structuring a portfolio case study that stands out to design hiring managers?`;
  }

  // 8. Interview Preparation & Career Transition
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

  // 9. General Comprehensive Career Guidance Fallback
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
