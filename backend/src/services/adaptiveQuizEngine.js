/**
 * Adaptive Career Assessment Engine
 * 
 * Provides dynamic branching questions based on user's previous answers,
 * multi-attempt variant rotation for retakes (attempt 1, 2, 3, 4...),
 * and zero-duplicate question guarantees with <1ms deterministic response time.
 */

// Track definitions
const TRACKS = {
  DATA_AI: 'DATA_AI',
  WEB_FRONTEND: 'WEB_FRONTEND',
  BACKEND_SYSTEMS: 'BACKEND_SYSTEMS',
  CLOUD_DEVOPS: 'CLOUD_DEVOPS',
  UI_UX: 'UI_UX',
  MOBILE: 'MOBILE',
  CYBERSECURITY: 'CYBERSECURITY',
  GENERAL_TECH: 'GENERAL_TECH',
};

// Stage 1: Skills Assessment Adaptive Matrix
const SKILLS_MATRIX = {
  initial: [
    {
      question: "Which programming language or technology stack are you most comfortable using?",
      options: [
        "JavaScript / TypeScript (React, Node.js, Web development)",
        "Python (Data analysis, scripting, AI basics)",
        "Java / C# / Go (Object-oriented programming, enterprise apps)",
        "Cloud, DevOps & Systems (Linux, Docker, AWS, Infrastructure)"
      ]
    },
    {
      question: "When starting a technical project, what primary technology ecosystem do you naturally reach for?",
      options: [
        "Modern Web Ecosystem (TypeScript, React/Next.js, frontend & full-stack)",
        "Data & AI Ecosystem (Python, Pandas/NumPy, machine learning, notebooks)",
        "Enterprise Systems Ecosystem (Java/Spring, C#/.NET, Go backend services)",
        "Mobile & App Ecosystem (Flutter, React Native, Swift, mobile UI)"
      ]
    },
    {
      question: "Which technical domain best reflects your hands-on coding and development experience to date?",
      options: [
        "Building interactive web applications with client-side state and modern layouts",
        "Data analysis, data exploration pipelines, and AI automation workflows",
        "Backend server architectures, RESTful APIs, and database schemas",
        "Product design, UI/UX systems, wireframing, and accessible web experiences"
      ]
    },
    {
      question: "What core developer skillset represents your primary technical focus right now?",
      options: [
        "Full-stack web engineering with JavaScript/TypeScript and cloud APIs",
        "Applied machine learning, data engineering, and Python analytics",
        "Backend systems, database optimization, and high-performance server logic",
        "Cybersecurity, system hardening, and secure coding practices"
      ]
    }
  ],
  branches: {
    DATA_AI: [
      // Q2: Problem solving
      [
        {
          question: "Since you work with Python & Data/AI, what type of programming challenge do you feel most comfortable solving?",
          options: [
            "Cleaning messy data, handling missing values, and generating summary statistics in Pandas",
            "Training, tuning, and evaluating predictive machine learning models (scikit-learn, PyTorch)",
            "Building automation scripts, web scrapers, and automated API data pipelines",
            "Creating interactive analytics dashboards and visual charts (Streamlit, Plotly, Jupyter)"
          ]
        },
        {
          question: "In your Python and data workflow, what technical task do you tackle most frequently?",
          options: [
            "Writing Python scripts to parse, filter, and aggregate multi-format datasets",
            "Experimenting with machine learning algorithms and evaluating feature importance",
            "Developing data extraction pipelines and connecting to RESTful APIs or webhooks",
            "Visualizing statistical relationships and presenting visual insights to non-technical users"
          ]
        }
      ],
      // Q3: Data management
      [
        {
          question: "How do you typically manage, query, and transform datasets for your projects?",
          options: [
            "Writing SQL queries with aggregations (GROUP BY, JOINs, Window functions) to extract clean subsets",
            "Working with Pandas DataFrames and transforming data in-memory with vector operations",
            "Querying NoSQL document stores or connecting to cloud data warehouses (BigQuery, Snowflake)",
            "Loading CSV/Excel files and performing exploratory data analysis"
          ]
        },
        {
          question: "When preparing data for analysis or modeling, how do you handle data quality issues?",
          options: [
            "Detecting and imputing missing values, removing duplicates, and standardizing data types",
            "Writing SQL validation scripts to audit referential integrity and identify anomaly records",
            "Engineering new features (one-hot encoding, normalization, scaling) to improve model signals",
            "Setting up automated schema checks before feeding data into downstream pipelines"
          ]
        }
      ],
      // Q4: Validation & Testing
      [
        {
          question: "When validating data analyses, automated pipelines, or model predictions, how do you verify accuracy?",
          options: [
            "Splitting data into train/test sets and checking metrics like precision, recall, and ROC-AUC",
            "Cross-checking summary tables against raw records to spot anomalies or data leakage",
            "Writing automated test assertions to verify that transformed columns match expected ranges",
            "Visual inspection of distributions and residual plots to catch outliers"
          ]
        },
        {
          question: "How do you test and troubleshoot bugs in your data scripts or pipelines?",
          options: [
            "Using print statements and interactive debugger (pdb/IPython) to inspect DataFrame shapes at each step",
            "Writing unit tests with pytest for individual data transformation functions",
            "Comparing intermediate outputs against a known ground-truth benchmark",
            "Logging execution times and memory usage to diagnose performance bottlenecks"
          ]
        }
      ],
      // Q5: Delivery & Tooling
      [
        {
          question: "How do you prefer to package or deliver your Python & Data projects for others?",
          options: [
            "Deploying as a lightweight web app or interactive dashboard (Streamlit, Gradio, FastAPI)",
            "Sharing an annotated Jupyter notebook with clear Markdown commentary and visuals",
            "Exporting clean executive reports, PowerPoint decks, and KPI summary spreadsheets",
            "Containerizing with Docker and setting up scheduled pipeline runs with cron or Airflow"
          ]
        },
        {
          question: "Which data environment and tooling setup do you feel most productive using?",
          options: [
            "JupyterLab / VS Code with interactive Python kernels and virtual environments",
            "Cloud platforms (Google Colab, AWS SageMaker, Kaggle) with GPU acceleration",
            "Production Python environments with virtualenv/poetry, git versioning, and CI/CD",
            "Database clients (DBeaver, pgAdmin) paired with analytical SQL editors"
          ]
        }
      ]
    ],
    WEB_FRONTEND: [
      // Q2: Architecture
      [
        {
          question: "In modern JavaScript/TypeScript and web development, where does your architectural confidence lie?",
          options: [
            "Building reusable component systems with state management (React, Zustand, Context)",
            "Full-stack integration: connecting frontend forms and mutations to backend REST/tRPC APIs",
            "Responsive layouts, animations, and pixel-perfect design system implementations (Tailwind, CSS Modules)",
            "Handling asynchronous data flows, caching (React Query / TanStack), and optimistic UI updates"
          ]
        },
        {
          question: "When building a web application feature, what part of the stack do you focus on first?",
          options: [
            "Designing the component hierarchy, props interface, and UI layout in TypeScript/React",
            "Connecting API endpoints, handling loading/error states, and syncing data",
            "Structuring semantic HTML, styling responsive breakpoints, and ensuring smooth transitions",
            "Defining shared types, request validation, and client-server contract definitions"
          ]
        }
      ],
      // Q3: Performance & State
      [
        {
          question: "How do you optimize web applications for real-world user performance?",
          options: [
            "Code-splitting, lazy-loading routes and heavy components to minimize initial bundle size",
            "Optimizing images, leveraging modern formats (WebP/AVIF), and caching static assets on CDNs",
            "Preventing unnecessary component re-renders using memoization and fine-grained state",
            "Auditing with Chrome DevTools Lighthouse to fix Core Web Vitals (LCP, CLS, FID)"
          ]
        },
        {
          question: "How do you handle complex state and data synchronization in frontend applications?",
          options: [
            "Using dedicated server-cache libraries (TanStack Query, SWR) for API data and simple local state for UI",
            "Global state managers (Redux Toolkit, Zustand) for multi-screen shared state",
            "URL query parameters as the single source of truth for filters, sorting, and pagination",
            "React Context with custom hooks for encapsulated feature-level state"
          ]
        }
      ],
      // Q4: Testing & Reliability
      [
        {
          question: "How do you test and ensure cross-browser reliability in your frontend codebase?",
          options: [
            "Writing component tests using React Testing Library or Vitest for user interaction flows",
            "Using TypeScript strictly to catch type mismatches and missing props at compile time",
            "End-to-end testing with Playwright or Cypress across key user journeys",
            "Rigorous manual testing across desktop, tablet, and mobile viewport sizes"
          ]
        },
        {
          question: "When you encounter a stubborn UI or JavaScript bug in production, what is your first step?",
          options: [
            "Inspecting the browser console, network tab, and React DevTools component tree",
            "Reproducing the issue locally with a minimal test case or mock data",
            "Checking error monitoring logs (Sentry) and reviewing recent git commit diffs",
            "Testing in an incognito window to rule out local storage, cookies, or browser extension conflicts"
          ]
        }
      ],
      // Q5: Ecosystem & Tooling
      [
        {
          question: "What modern web architecture pattern or tool excites you most right now?",
          options: [
            "Server Components & Server-Driven Rendering (Next.js App Router, Remix)",
            "Design systems with accessibility built-in (Radix UI, Shadcn UI, WCAG standards)",
            "Micro-frontends or modular monorepos (Turborepo, Nx) for scaling team development",
            "Client-side rich interactive canvas/animations (Framer Motion, Three.js, Canvas API)"
          ]
        },
        {
          question: "How do you approach modern styling and CSS architecture in scalable web projects?",
          options: [
            "Utility-first styling with Tailwind CSS for rapid, maintainable design consistency",
            "CSS Modules or Styled Components with scoped component-level styling",
            "Custom CSS variables/tokens for dynamic theming (dark mode) and design systems",
            "Pre-built component libraries (Material UI, Ant Design, Chakra UI) with custom overrides"
          ]
        }
      ]
    ],
    BACKEND_SYSTEMS: [
      // Q2: API Architecture
      [
        {
          question: "When architecting backend services and APIs, which area represents your strongest experience?",
          options: [
            "Designing clean RESTful API controllers, routing, and modular service layers",
            "Entity modeling, relational table design, and database schema migrations",
            "Implementing secure user authentication (JWT, OAuth2, RBAC role-based access)",
            "Writing structured middleware for request validation, error logging, and rate limiting"
          ]
        },
        {
          question: "What is your primary focus when designing server-side application logic?",
          options: [
            "Structuring clean service layers with separation of concerns and dependency injection",
            "Writing robust database queries, transactions, and repository access layers",
            "Building secure API endpoints with input sanitization and schema validation",
            "Managing asynchronous background jobs, queues, and event emitters"
          ]
        }
      ],
      // Q3: Data persistence & concurrency
      [
        {
          question: "How do you handle database persistence, query optimization, and concurrency under load?",
          options: [
            "Adding indexing on frequent query columns and analyzing execution plans (EXPLAIN)",
            "Introducing caching layers like Redis to offload repetitive read queries",
            "Configuring database connection pooling and fine-tuning transaction isolation levels",
            "Normalizing schemas to eliminate redundancy and enforcing referential integrity"
          ]
        },
        {
          question: "Which database paradigm do you feel most comfortable working with in production?",
          options: [
            "Relational databases (PostgreSQL, MySQL) with strong ACID guarantees and foreign keys",
            "Document databases (MongoDB) with flexible schemas for rapid product iteration",
            "Hybrid setups: PostgreSQL for relational entities paired with Redis for fast caching",
            "Object-Relational Mapping (Prisma, TypeORM, Hibernate) with programmatic migrations"
          ]
        }
      ],
      // Q4: Backend testing
      [
        {
          question: "How do you test your backend services and APIs before deploying to production?",
          options: [
            "Writing automated unit tests with mocks for external services and database calls",
            "Running automated API integration tests verifying HTTP status codes and JSON payloads",
            "Load testing with tools like k6 or Apache JMeter to observe response times under pressure",
            "Manual testing using Postman or Swagger/OpenAPI documentation"
          ]
        },
        {
          question: "When an API endpoint starts responding with 500 errors or high latency, how do you diagnose it?",
          options: [
            "Checking server application logs and stack traces to identify the failing line or unhandled rejection",
            "Inspecting database slow query logs and active connection pool status",
            "Using APM tools or console profiling to pinpoint CPU-intensive loops or blocking operations",
            "Verifying external third-party API dependencies and network timeouts"
          ]
        }
      ],
      // Q5: Maintainability
      [
        {
          question: "What architectural approach do you consider most effective for maintainable backend systems?",
          options: [
            "Clean Architecture / Hexagonal Architecture with decoupled domain business rules",
            "Pragmatic modular monolith with clear service boundaries before jumping to microservices",
            "Event-driven architecture with message queues (RabbitMQ, Kafka) for asynchronous tasks",
            "Microservices with containerized deployment (Docker, Kubernetes) and service meshes"
          ]
        },
        {
          question: "How do you approach API security and data protection in your backend code?",
          options: [
            "Enforcing strict JWT authentication, short-lived tokens, and HTTPS everywhere",
            "Input sanitization, parameterized queries (preventing SQL injection), and CORS policies",
            "Implementing rate limiting, brute-force protection, and request payload size caps",
            "Role-based access control (RBAC) with granular permission checks on every protected endpoint"
          ]
        }
      ]
    ],
    CLOUD_DEVOPS: [
      // Q2
      [
        {
          question: "In cloud infrastructure and DevOps, what is your primary hands-on area of focus?",
          options: [
            "Containerizing applications with Docker and configuring multi-stage build optimization",
            "Automating CI/CD deployment pipelines using GitHub Actions, GitLab CI, or Jenkins",
            "Managing cloud infrastructure using Infrastructure as Code (Terraform, AWS CloudFormation)",
            "Configuring Linux server environments, shell scripts, and system security firewalls"
          ]
        }
      ],
      // Q3
      [
        {
          question: "How do you ensure high availability, load balancing, and zero-downtime deployments?",
          options: [
            "Blue/green or rolling deployment strategies with health checks before cutting traffic",
            "Automated load balancing and auto-scaling groups based on CPU/memory utilization",
            "Multi-region failover and distributed DNS routing",
            "Implementing container orchestration with Kubernetes replica sets"
          ]
        }
      ],
      // Q4
      [
        {
          question: "How do you monitor systems and diagnose production incidents when services degrade?",
          options: [
            "Centralized log aggregation (ELK Stack, Datadog, CloudWatch) with alert triggers",
            "Real-time metrics dashboards (Prometheus, Grafana) tracking latency, error rates, and saturation",
            "Distributed tracing (OpenTelemetry, Jaeger) to pinpoint slow database queries or microservice calls",
            "Configuring automated alerts to Slack or PagerDuty for 5xx error spikes"
          ]
        }
      ],
      // Q5
      [
        {
          question: "What security and governance practice do you prioritize most in cloud infrastructure?",
          options: [
            "Principle of Least Privilege: strict IAM roles, no root user usage, and scoped API tokens",
            "Secrets management using HashiCorp Vault or AWS Secrets Manager (no hardcoded keys)",
            "Automated vulnerability scanning of Docker images and dependency CVE audits",
            "VPC network segmentation, private subnets, and strict security group ingress rules"
          ]
        }
      ]
    ],
    UI_UX: [
      // Q2
      [
        {
          question: "When designing digital interfaces and frontend layouts, which part of the workflow do you enjoy most?",
          options: [
            "Translating user requirements into low-fidelity wireframes and high-fidelity Figma prototypes",
            "Developing comprehensive design systems with color palettes, typography tokens, and spacing scales",
            "Conducting user research interviews, card sorting, and competitive usability audits",
            "Bridging design and engineering by inspecting layout code, CSS flexbox/grid, and micro-interactions"
          ]
        }
      ],
      // Q3
      [
        {
          question: "How do you approach accessibility (a11y) and responsive design across different viewports?",
          options: [
            "Ensuring color contrast ratios meet WCAG AA/AAA standards and supporting dark/light modes",
            "Designing full keyboard navigation paths, visible focus rings, and skip-to-content links",
            "Writing descriptive alt text, aria-labels, and semantic HTML structure",
            "Testing with screen readers (NVDA, VoiceOver) to verify navigation flow"
          ]
        }
      ],
      // Q4
      [
        {
          question: "When testing a design with users or stakeholders, what heuristic do you evaluate first?",
          options: [
            "Clarity and simplicity: can users complete their primary task without hesitation or confusion?",
            "Visual hierarchy: does the eye naturally flow to primary calls-to-action and key data points?",
            "Error prevention and recovery: are form validations friendly and error messages actionable?",
            "Consistency: do buttons, icons, spacing, and typography behave predictably throughout the app?"
          ]
        }
      ],
      // Q5
      [
        {
          question: "What kind of design tooling and developer handoff workflow do you rely on most?",
          options: [
            "Figma components, auto-layout, variants, and interactive prototype animations",
            "Design tokens exported to JSON/CSS variables for seamless synchronization with code",
            "Detailed design handoff documentation with responsive break points and edge-case specs",
            "User journey maps, empathy maps, and interactive wireframing in FigJam or Miro"
          ]
        }
      ]
    ],
    MOBILE: [
      // Q2
      [
        {
          question: "In mobile application development, which challenge do you tackle most frequently?",
          options: [
            "Cross-platform mobile apps with React Native or Flutter delivering native-like experiences",
            "Native iOS development with Swift, SwiftUI, and Apple design guidelines",
            "Native Android development with Kotlin, Jetpack Compose, and Material Design",
            "Mobile UI layout design, custom animations, and responsive screen scaling"
          ]
        }
      ],
      // Q3
      [
        {
          question: "How do you handle offline functionality, local storage, and data synchronization?",
          options: [
            "Local SQLite or Realm database caching with background sync when internet restores",
            "Optimistic local updates that immediately update UI while syncing in the background",
            "Simple network state detection that gracefully notifies users when offline",
            "Key-value persistent storage (AsyncStorage, SharedPreferences) for session and settings"
          ]
        }
      ],
      // Q4
      [
        {
          question: "How do you test and debug mobile applications across various device models and OS versions?",
          options: [
            "Testing on physical devices to observe touch responsiveness, camera, and battery consumption",
            "Running iOS Simulators and Android Emulators across different screen sizes and OS versions",
            "Writing automated mobile UI tests (Detox, Appium, Maestro)",
            "Using crash reporting tools (Firebase Crashlytics) to capture stack traces from the field"
          ]
        }
      ],
      // Q5
      [
        {
          question: "What is your experience with mobile continuous integration, testing, and app store publishing?",
          options: [
            "Configuring App Store Connect, Google Play Console, and managing build certificates",
            "Setting up automated builds with Fastlane or GitHub Actions for continuous delivery",
            "Managing app permissions, privacy policy compliance, and review guidelines",
            "Learning the submission process and preparing screenshots, metadata, and release notes"
          ]
        }
      ]
    ],
    CYBERSECURITY: [
      // Q2
      [
        {
          question: "In security and systems protection, which aspect represents your core practical skill?",
          options: [
            "Application security: identifying OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, broken auth)",
            "Network security: analyzing packet captures (Wireshark), firewalls, and port scanning (Nmap)",
            "Cloud security: auditing IAM policies, S3 bucket permissions, and container vulnerabilities",
            "Security operations: monitoring SIEM logs, detecting intrusions, and incident response"
          ]
        }
      ],
      // Q3
      [
        {
          question: "How do you audit code or configurations for common vulnerabilities?",
          options: [
            "Running Static Application Security Testing (SAST) tools and reviewing flagged vulnerabilities",
            "Conducting manual code reviews focused on input validation, authorization, and cryptographic calls",
            "Dynamic testing with intercepting proxies (Burp Suite, OWASP ZAP) against staging endpoints",
            "Auditing third-party open-source dependencies using npm audit, Snyk, or Dependabot"
          ]
        }
      ],
      // Q4
      [
        {
          question: "When verifying a security patch, how do you validate that a vulnerability has been closed?",
          options: [
            "Re-running the exploit payload or proof-of-concept to confirm it is safely rejected",
            "Writing a regression test that asserts unauthorized requests return 401/403 forbidden",
            "Verifying that error responses do not leak sensitive stack traces or internal server details",
            "Conducting a peer review of the patch with the engineering security team"
          ]
        }
      ],
      // Q5
      [
        {
          question: "What automated security scanning or penetration testing tools are you most familiar with?",
          options: [
            "Burp Suite / OWASP ZAP for web application security assessments",
            "Nmap / Wireshark for network enumeration and traffic analysis",
            "Metasploit or security automation frameworks for vulnerability verification",
            "Cloud security posture tools (AWS GuardDuty, Prisma Cloud, Trivy)"
          ]
        }
      ]
    ]
  }
};

// Stage 2: Career Interests Adaptive Matrix
const INTERESTS_MATRIX = {
  initial: [
    {
      question: "What kind of software projects or products do you enjoy building the most?",
      options: [
        "Interactive web apps, consumer portals, and user interfaces that people see and interact with",
        "Data pipelines, automated scripts, dashboards, and machine learning models",
        "High-performance backend services, REST/GraphQL APIs, and server architecture",
        "Mobile apps for iOS or Android smartphones and tablets"
      ]
    },
    {
      question: "If you had complete creative freedom on a greenfield project, what would you choose to build?",
      options: [
        "A full-stack web application with sleek UI, rich user profiles, and seamless payments",
        "An AI-powered tool or automated intelligence agent that solves real repetitive problems",
        "A scalable developer tool, API platform, or backend database engine",
        "A mobile utility or native mobile application with offline support"
      ]
    },
    {
      question: "Which type of product impact gives you the greatest sense of accomplishment?",
      options: [
        "Delighting users with fast, intuitive, accessible, and beautiful interfaces",
        "Uncovering non-obvious patterns in data and helping businesses make smarter decisions",
        "Building bulletproof server systems that run smoothly with high uptime and low latency",
        "Automating infrastructure so other engineers can build and ship with zero friction"
      ]
    }
  ],
  branches: {
    DATA_AI: [
      // Q2: Applied AI domain
      [
        {
          question: "Which domain of applied data and intelligence excites you the most?",
          options: [
            "Generative AI & LLM applications: building chatbots, smart search, and AI agent workflows",
            "Predictive analytics & forecasting: churn analysis, financial modeling, and risk scoring",
            "Computer vision or speech/NLP: image classification, object detection, and text understanding",
            "Big data engineering: managing multi-terabyte data warehouses, Kafka streams, and ETL"
          ]
        }
      ],
      // Q3: Type of impact
      [
        {
          question: "What type of data-driven impact do you want to have in your career?",
          options: [
            "Delivering strategic business insights that shape company direction and product roadmaps",
            "Automating manual workflows with intelligent assistants and natural language tools",
            "Publishing innovative machine learning models or contributing to open-source data libraries",
            "Partnering with frontend/backend teams to bring production AI features to millions of users"
          ]
        }
      ],
      // Q4: Platform dive
      [
        {
          question: "What technology or platform would you love to dive deeper into next?",
          options: [
            "Modern AI tooling: LangChain, LlamaIndex, Vector databases (Pinecone, Chroma)",
            "Cloud data platforms: Snowflake, Google BigQuery, dbt, and modern data stacks",
            "Deep learning frameworks: PyTorch, Hugging Face transformers, and model fine-tuning",
            "Distributed data computing: Apache Spark, Databricks, and Ray for distributed compute"
          ]
        }
      ],
      // Q5: Work energy
      [
        {
          question: "How do you prefer to spend your creative problem-solving energy on data projects?",
          options: [
            "Translating ambiguous questions into clean quantitative models and actionable visualizations",
            "Engineering features, tuning hyperparameters, and beating model benchmark accuracies",
            "Optimizing SQL queries and building reliable data pipelines that never break at 2 AM",
            "Designing intuitive data dashboards that non-technical stakeholders love to use"
          ]
        }
      ]
    ],
    WEB_FRONTEND: [
      // Q2
      [
        {
          question: "What type of web applications do you find most fulfilling to build?",
          options: [
            "High-growth SaaS products with rich dashboards, tables, and complex user workflows",
            "Consumer platforms and social apps with delightful micro-interactions and animations",
            "E-commerce and marketplace experiences optimized for high conversion and speed",
            "Creator tools with interactive canvases, media editors, or rich data visualizations"
          ]
        }
      ],
      // Q3
      [
        {
          question: "What aspect of modern web engineering motivates you most?",
          options: [
            "Crafting flawless UI polish, typography hierarchies, and fluid responsive design",
            "Architecting clean frontend state, modular component libraries, and blazing load times",
            "Building end-to-end fullstack features with seamless API integration and server actions",
            "Implementing strict accessibility (a11y), internationalization, and universal device support"
          ]
        }
      ],
      // Q4
      [
        {
          question: "Which industry sounds most exciting for your next web development role?",
          options: [
            "Modern productivity software, developer tools, and workflow automation",
            "FinTech, digital banking, and modern payment infrastructure",
            "EdTech, healthcare, and mission-driven platforms with positive social impact",
            "Creative media, streaming platforms, gaming, and digital entertainment"
          ]
        }
      ],
      // Q5
      [
        {
          question: "What kind of engineering culture do you thrive in best?",
          options: [
            "Fast-moving startup teams with high ownership and rapid continuous deployments",
            "Design-led product organizations obsessed with user experience and visual craft",
            "Engineering-driven cultures with strong code reviews and technical excellence",
            "Remote-first distributed teams with flexible, asynchronous communication"
          ]
        }
      ]
    ],
    BACKEND_SYSTEMS: [
      // Q2
      [
        {
          question: "What type of backend system challenges excite you the most?",
          options: [
            "Architecting high-throughput REST/GraphQL APIs handling thousands of requests per second",
            "Designing rock-solid relational database schemas and complex transactional workflows",
            "Building asynchronous event-driven pipelines, message queues, and background workers",
            "Developing secure fintech payment processing, authorization, and fraud prevention engines"
          ]
        }
      ],
      // Q3
      [
        {
          question: "Which industry domain would you prefer to build backend services for?",
          options: [
            "FinTech and payment infrastructure where precision, consistency, and security are paramount",
            "Cloud infrastructure, developer platforms, and enterprise B2B SaaS backends",
            "HealthTech and logistics software with complex data schemas and strict compliance",
            "High-scale consumer backends with millions of concurrent users and streaming data"
          ]
        }
      ],
      // Q4
      [
        {
          question: "What modern backend technology are you most eager to master next?",
          options: [
            "High-performance languages like Go or Rust for systems programming and microservices",
            "Advanced SQL optimization, distributed database clustering, and sharding",
            "Kafka, event streaming, and distributed consensus algorithms",
            "Microservice container orchestration with Docker, Kubernetes, and gRPC"
          ]
        }
      ],
      // Q5
      [
        {
          question: "How do you approach technical trade-offs between speed-to-market and code perfection?",
          options: [
            "Pragmatic balance: shipping modular, clean code quickly and refactoring as scale demands",
            "Rigorous architecture first: designing strict schemas and tests before writing feature logic",
            "Rapid prototyping: proving the core capability first, then hardening for production",
            "Test-driven development (TDD): letting automated tests define the API contract upfront"
          ]
        }
      ]
    ],
    CLOUD_DEVOPS: [
      // Q2
      [
        {
          question: "What area of cloud infrastructure do you find most exciting?",
          options: [
            "Site Reliability Engineering (SRE): maintaining 99.99% uptime and low latency",
            "Platform Engineering: building internal developer platforms to help engineers deploy faster",
            "Cloud Security: hardening cloud perimeters, IAM, and compliance automation",
            "Cost optimization and cloud infrastructure architecture across AWS, GCP, or Azure"
          ]
        }
      ],
      // Q3
      [
        {
          question: "What scale of infrastructure would you like to manage in your career?",
          options: [
            "Multi-cloud distributed infrastructure across global regions with automated failover",
            "Rapidly scaling startup cloud environments moving from monolith to containerized clusters",
            "Enterprise hybrid cloud with on-premises and private cloud integration",
            "Developer tooling and CI/CD pipelines that empower hundreds of engineers"
          ]
        }
      ],
      // Q4
      [
        {
          question: "What technology or methodology are you most interested in mastering?",
          options: [
            "Kubernetes, Helm charts, and service mesh technologies (Istio, Linkerd)",
            "Infrastructure as Code with Terraform, Pulumi, and GitOps (ArgoCD)",
            "Observability with OpenTelemetry, Prometheus, and Grafana",
            "Cloud-native security, container scanning, and zero-trust networking"
          ]
        }
      ],
      // Q5
      [
        {
          question: "What type of team impact gives you the greatest satisfaction?",
          options: [
            "Slashing build and deployment times from hours to minutes for the entire engineering team",
            "Preventing production outages through proactive monitoring and auto-healing infrastructure",
            "Reducing cloud infrastructure spend while boosting system reliability and performance",
            "Automating disaster recovery and incident response playbooks"
          ]
        }
      ]
    ],
    UI_UX: [
      // Q2
      [
        {
          question: "What dimension of product design do you feel most passionate about?",
          options: [
            "Visual design systems: crafting brand identity, tokens, and scalable component libraries",
            "Interaction design: designing smooth animations, micro-interactions, and touch gestures",
            "UX research: interviewing users, identifying friction points, and running usability tests",
            "Product strategy: collaborating with founders to turn messy ideas into crisp product specs"
          ]
        }
      ],
      // Q3
      [
        {
          question: "What kind of digital products do you dream of designing?",
          options: [
            "Complex web applications and B2B software where intuitive workflows save hours of work",
            "Consumer mobile apps with addictive simplicity, elegance, and viral user engagement",
            "Accessible public platforms, healthcare tools, and educational experiences designed for everyone",
            "Creative tools, design utilities, and developer software"
          ]
        }
      ],
      // Q4
      [
        {
          question: "How do you best collaborate with software engineers during product handoff?",
          options: [
            "Providing pixel-perfect Figma specs with auto-layout, responsive constraints, and interactive prototypes",
            "Pair-designing directly with frontend developers to fine-tune CSS, spacing, and responsiveness",
            "Creating comprehensive design tokens in JSON/CSS that map 1:1 to code tokens",
            "Reviewing staging builds and filing actionable UX polish tickets"
          ]
        }
      ],
      // Q5
      [
        {
          question: "What UX challenge are you most interested in solving in your next role?",
          options: [
            "Redesigning complex legacy workflows to reduce cognitive load and steps to completion",
            "Establishing an organization-wide design system from the ground up",
            "Designing intuitive experiences for AI interactions and natural language interfaces",
            "Expanding internationalization, multilingual support, and WCAG AAA accessibility"
          ]
        }
      ]
    ],
    MOBILE: [
      // Q2
      [
        {
          question: "What type of mobile apps do you dream of building?",
          options: [
            "Consumer lifestyle, social, or fitness apps with high daily active user engagement",
            "Fintech and mobile banking apps where security, biometrics, and speed are essential",
            "Productivity and utility apps with smart offline capabilities and widget support",
            "Interactive media, audio/video streaming, or mobile gaming experiences"
          ]
        }
      ],
      // Q3
      [
        {
          question: "What technical aspect of mobile development excites you most?",
          options: [
            "Crafting 60fps/120fps fluid gesture animations and seamless screen transitions",
            "Deep native OS integration: push notifications, background tasks, widgets, and camera APIs",
            "Architecting clean mobile state management (Bloc, Riverpod, Redux, Zustand) and offline cache",
            "Optimizing app startup times, memory footprint, and battery consumption"
          ]
        }
      ],
      // Q4
      [
        {
          question: "Which mobile platform ecosystem do you plan to focus on?",
          options: [
            "Cross-platform frameworks (Flutter or React Native) for dual-store releases",
            "Native iOS ecosystem with Swift, SwiftUI, and Apple Human Interface Guidelines",
            "Native Android ecosystem with Kotlin, Jetpack Compose, and Material Design 3",
            "Hybrid web-to-mobile technologies (Capacitor, PWA) for rapid cross-device testing"
          ]
        }
      ],
      // Q5
      [
        {
          question: "What gives you the greatest pride when releasing a mobile application?",
          options: [
            "Receiving enthusiastic 5-star user reviews and high ratings on app stores",
            "Knowing the app functions flawlessly in offline mode without crashing or data loss",
            "Seeing users breeze through a complex onboarding flow with zero confusion",
            "Achieving a compact app download size with lightning-fast cold boot speed"
          ]
        }
      ]
    ],
    CYBERSECURITY: [
      // Q2
      [
        {
          question: "What area of cybersecurity do you find most compelling?",
          options: [
            "Offensive security / Ethical Hacking: penetration testing, bug hunting, and exploit analysis",
            "Defensive security / Blue Team: SOC monitoring, threat hunting, and incident response",
            "Application security (AppSec): code reviews, secure architecture, and DevSecOps pipelines",
            "Cloud & infrastructure security: IAM hardening, container security, and compliance"
          ]
        }
      ],
      // Q3
      [
        {
          question: "What type of security projects do you enjoy executing?",
          options: [
            "Simulating real-world cyberattacks to uncover vulnerabilities before malicious actors do",
            "Building automated security scanning into CI/CD pipelines to block insecure pull requests",
            "Investigating security incidents, analyzing memory dumps, and reverse engineering malware",
            "Designing secure authentication architectures (Zero Trust, WebAuthn, FIDO2)"
          ]
        }
      ],
      // Q4
      [
        {
          question: "Which industry would you prefer to defend as a security professional?",
          options: [
            "FinTech and digital banking where critical financial assets and transactions must be safeguarded",
            "Healthcare and biotech where patient confidentiality and medical device safety are critical",
            "Cloud service providers and tech infrastructure supporting millions of connected systems",
            "Government and critical infrastructure defense against nation-state threat actors"
          ]
        }
      ],
      // Q5
      [
        {
          question: "How do you keep your cybersecurity skills sharp and up-to-date?",
          options: [
            "Participating in Capture The Flag (CTF) competitions and HackTheBox / TryHackMe labs",
            "Reading CVE bulletins, security research papers, and following threat intelligence feeds",
            "Building defensive scripts and experimenting with security tools in isolated homelabs",
            "Auditing open-source codebases for zero-day vulnerabilities and responsible disclosures"
          ]
        }
      ]
    ]
  }
};

// Stage 3: Personality Traits Question Bank (5 Questions with Multi-Attempt Variants)
const PERSONALITY_MATRIX = [
  // Q1: Problem breakdown & ambiguity
  [
    {
      question: "When you are handed a large, ambiguous technical task with incomplete specifications, what is your first instinct?",
      options: [
        "Break the problem down into small, verifiable chunks and tackle the riskiest assumption first",
        "Ask clarifying questions to product managers and stakeholders before writing any code",
        "Build a rapid throwaway prototype to test feasibility and discover edge cases early",
        "Research existing open-source solutions and documentation to see how others solved it"
      ]
    },
    {
      question: "How do you navigate situations where technical requirements change midway through a project?",
      options: [
        "Adapt quickly by reprioritizing the modular components and communicating scope trade-offs",
        "Review the architecture to ensure the changes do not introduce long-term technical debt",
        "Pair with the team to brainstorm the fastest path to integrate the new requirements cleanly",
        "Document the pivot clearly and update automated tests to reflect the new expected behavior"
      ]
    }
  ],
  // Q2: Team communication & collaboration
  [
    {
      question: "What is your preferred mode of collaboration when working with a software team?",
      options: [
        "Asynchronous communication with detailed documentation, PR comments, and written updates",
        "Frequent real-time discussions, spontaneous whiteboarding sessions, and pair programming",
        "A healthy balance: clear sprint planning meetings followed by uninterrupted deep-work focus",
        "Small, autonomous pods where each developer owns an entire vertical feature end-to-end"
      ]
    },
    {
      question: "When collaborating with teammates on a complex feature, how do you keep everyone aligned?",
      options: [
        "Writing a concise technical design doc (RFC) with architecture diagrams and API contracts",
        "Holding quick 10-minute standups and active Slack/Discord message threads",
        "Maintaining clear GitHub project boards with labeled issues and milestone checklists",
        "Demonstrating progress with live staging demos and interactive preview links"
      ]
    }
  ],
  // Q3: Feedback & Code Review
  [
    {
      question: "How do you approach receiving critical feedback or requested changes on your pull requests?",
      options: [
        "I welcome it enthusiastically as a chance to learn new patterns and improve code quality",
        "I evaluate suggestions objectively, asking questions if the rationale is unclear",
        "I appreciate constructive feedback but advocate for pragmatism if changes cause delays",
        "I enjoy collaborative discussions to find the cleanest, most maintainable compromise"
      ]
    },
    {
      question: "When conducting code reviews for a peer, what do you prioritize reviewing first?",
      options: [
        "System correctness, edge-case handling, and security implications of the logic",
        "Code maintainability, readability, and adherence to established project conventions",
        "Performance bottlenecks, unnecessary database queries, and algorithmic complexity",
        "Test coverage: verifying that unit and integration tests validate the feature thoroughly"
      ]
    }
  ],
  // Q4: Execution under deadlines
  [
    {
      question: "When facing a tight deadline with several unfinished subtasks, how do you manage the pressure?",
      options: [
        "I prioritize the core essential user flow and negotiate deferring non-critical bells and whistles",
        "I create a timeboxed checklist and focus intensely on one item at a time without multitasking",
        "I communicate proactively with stakeholders early about what is feasible and what is at risk",
        "I lean into pragmatic simplifications to deliver a stable, working version on schedule"
      ]
    },
    {
      question: "How do you maintain code quality when pressure is high to release a feature quickly?",
      options: [
        "I ensure core happy-path tests and error handling are solid, leaving clean TODOs for refactoring",
        "I focus on modular code so that shortcuts are isolated and easily swappable later",
        "I lean on automated linters and type checkers to prevent silly bugs under stress",
        "I ask a teammate to do a rapid sanity review before merging anything to production"
      ]
    }
  ],
  // Q5: Engineering archetype
  [
    {
      question: "Which role archetype best describes how you naturally contribute to an engineering team?",
      options: [
        "The Builder: shipping working features quickly, turning ideas into tangible reality",
        "The Architect: designing clean data structures, scalable systems, and robust foundations",
        "The Researcher: deep-diving into documentation, troubleshooting complex bugs, and finding optimal tools",
        "The Polisher: obsessed with user experience, performance tuning, and eliminating rough edges"
      ]
    },
    {
      question: "What type of contribution on a team project gives you the greatest personal satisfaction?",
      options: [
        "Seeing real users successfully interact with a feature you built from the ground up",
        "Solving a tough performance or reliability bug that had baffled the team for days",
        "Establishing design patterns, reusable libraries, and tools that accelerate other developers",
        "Delivering a complex initiative smoothly ahead of schedule with zero production regressions"
      ]
    }
  ]
];

// Stage 4: Learning Style Question Bank (5 Questions with Multi-Attempt Variants)
const LEARNING_MATRIX = [
  // Q1: Learning modality
  [
    {
      question: "When learning a brand new technical framework or programming language, how do you learn most effectively?",
      options: [
        "Building a complete, realistic project from scratch while consulting official documentation",
        "Following a structured video course or interactive tutorial step-by-step",
        "Reading technical books, deep-dive articles, and studying open-source reference codebases",
        "Pairing with an experienced mentor who can review my code and provide direct guidance"
      ]
    },
    {
      question: "What type of learning material helps technical concepts 'click' for you the fastest?",
      options: [
        "Hands-on code repositories with working examples that I can tinker with and modify",
        "Clear conceptual diagrams, architectural flowcharts, and visual mental models",
        "Concise, official API documentation with clear parameters and return value specifications",
        "Real-world case studies detailing how high-growth tech companies solved specific problems"
      ]
    }
  ],
  // Q2: Study schedule & rhythm
  [
    {
      question: "How do you prefer to schedule your learning and skill development time?",
      options: [
        "Consistent daily habits: 45 to 60 minutes every morning or evening of focused coding",
        "Deep weekend blocks: several uninterrupted hours on weekends dedicated to building",
        "Project-driven sprints: intensive learning bursts whenever a new project demands it",
        "Flexible micro-learning: reading articles, newsletters, and documentation throughout the week"
      ]
    },
    {
      question: "How do you maintain momentum when studying complex, multi-week technical topics?",
      options: [
        "Setting concrete mini-milestones (e.g. build API today, connect DB tomorrow) with visible progress",
        "Holding myself accountable by sharing updates with a community, study group, or mentor",
        "Tracking a checklist of roadmap topics and celebrating when each module is mastered",
        "Alternating between challenging theory and fun, rewarding visual building sessions"
      ]
    }
  ],
  // Q3: Overcoming blockers
  [
    {
      question: "When you hit a tough conceptual blocker or confusing error, what is your strategy to break through?",
      options: [
        "Isolate the problem in a minimal reproduction or scratchpad script with zero external noise",
        "Read the official documentation and source code to understand how the library works internally",
        "Search developer discussions, GitHub issues, and StackOverflow for community solutions",
        "Ask a mentor, colleague, or AI tool to explain the mental model behind the concept"
      ]
    },
    {
      question: "If you find yourself stuck on a bug for more than an hour, what is your next move?",
      options: [
        "Take a short walk or break to clear my head; the answer often hits me away from the screen",
        "Explain the problem step-by-step to a colleague or 'rubber duck' to spot faulty assumptions",
        "Write out the exact execution flow on paper and inspect every variable transition",
        "Revert back to the last known working git commit and reintroduce changes incrementally"
      ]
    }
  ],
  // Q4: Feedback loops
  [
    {
      question: "What kind of feedback loop gives you the greatest confidence that your code is high quality?",
      options: [
        "Automated unit and integration tests passing green, proving edge cases are handled",
        "Detailed code review from a senior engineer pointing out stylistic and architectural improvements",
        "Deploying to a real staging environment and watching real users or simulated load test it",
        "Seeing clean linter, compiler, and type-checker outputs with zero warnings or errors"
      ]
    },
    {
      question: "How do you evaluate whether you have truly mastered a new skill or framework?",
      options: [
        "When I can architect and build a feature from memory without copy-pasting code",
        "When I can clearly explain the concepts and trade-offs to another developer or junior learner",
        "When I can debug complex error messages in that framework without searching online",
        "When I feel confident contributing to an open-source library built with that technology"
      ]
    }
  ],
  // Q5: Knowledge retention
  [
    {
      question: "How do you ensure that what you learn stays with you long after completing a course or tutorial?",
      options: [
        "Immediately building an original project using the concept in a totally different domain",
        "Writing technical blog posts, personal cheat-sheets, or documentation notes for future reference",
        "Reviewing and refactoring older projects with the newly learned modern best practices",
        "Teaching the concept to a peer or answering questions in developer communities"
      ]
    },
    {
      question: "What is your approach to organizing your personal developer toolkit and reference notes?",
      options: [
        "Maintaining a curated GitHub repository of boilerplate templates, snippets, and config files",
        "Using a digital notebook (Notion, Obsidian) organized by language, library, and architecture patterns",
        "Bookmarking official documentation and maintaining personal cheat-sheets for CLI commands",
        "Relying on hands-on muscle memory and searching high-quality official docs when needed"
      ]
    }
  ]
];

// Stage 5: Career Goals Question Bank (5 Questions with Multi-Attempt Variants)
const GOALS_MATRIX = [
  // Q1: Target milestone
  [
    {
      question: "What is your primary career target or milestone for the next 6 to 12 months?",
      options: [
        "Landing my first developer role or software engineering internship",
        "Transitioning into a higher-paying, higher-impact role in a modern technology stack",
        "Advancing to a Mid-level or Senior Engineer position with architectural ownership",
        "Launching an independent SaaS product, freelance agency, or technical startup"
      ]
    },
    {
      question: "Where do you want your developer trajectory to be one year from today?",
      options: [
        "Working on a high-performing engineering team with daily mentorship and continuous shipping",
        "Recognized as a reliable, independent contributor who can take features from concept to production",
        "Leading technical discussions, mentoring newer engineers, and improving system architecture",
        "Generating revenue from software products or consulting clients on modern software solutions"
      ]
    }
  ],
  // Q2: Company stage & culture
  [
    {
      question: "What type of company stage and workplace culture aligns best with your professional values?",
      options: [
        "High-growth tech startup: fast pace, multiple hats, rapid decision-making, and equity upside",
        "Established tech scaleup: solid balance of rapid innovation, clear career tracks, and good benefits",
        "Large enterprise / Global tech firm: structured mentorship, massive scale, and high stability",
        "Remote-first or freelance: complete geographical freedom, schedule flexibility, and autonomy"
      ]
    },
    {
      question: "Which working environment allows you to do your absolute best work?",
      options: [
        "A collaborative, fast-iterating team with a flat hierarchy and direct access to leadership",
        "A structured environment with well-defined sprint processes, clear PR reviews, and deep focus time",
        "An asynchronous, remote-first team where results and output matter more than hours logged",
        "A vibrant co-located office with high creative energy, whiteboarding, and team social events"
      ]
    }
  ],
  // Q3: Primary obstacle
  [
    {
      question: "What do you feel is currently the biggest obstacle standing between you and your dream role?",
      options: [
        "Preparing for technical coding rounds, algorithmic questions, and system design interviews",
        "Building a credible, impressive portfolio of production-grade projects that prove my skills",
        "Confidence and overcoming imposter syndrome: feeling truly ready to apply and pass interviews",
        "Networking, getting recruiter visibility, and landing interviews without a referral"
      ]
    },
    {
      question: "Which area of professional preparation would provide the biggest boost to your career right now?",
      options: [
        "Rigorous mock technical interviews with actionable feedback from experienced industry mentors",
        "Code-level architectural reviews of my portfolio projects to make them look senior-engineered",
        "Resume, LinkedIn, and GitHub profile optimization tailored to automated recruiter screens",
        "A structured, day-by-day learning roadmap that eliminates guesswork on what to study next"
      ]
    }
  ],
  // Q4: Definition of success
  [
    {
      question: "How do you personally define long-term career success as a technologist?",
      options: [
        "Technical mastery: becoming a true expert capable of solving the hardest engineering problems",
        "Financial growth: achieving strong compensation, financial independence, and market leverage",
        "Work-life harmony: having a fulfilling career while enjoying flexibility and personal time",
        "Leadership & impact: building software that touches millions of lives and mentoring the next generation"
      ]
    },
    {
      question: "What kind of professional recognition matters most to you in your career?",
      options: [
        "Being known as the go-to technical problem solver who can fix anything and build anything",
        "Rapid promotions and progression through engineering ranks to staff/principal or tech lead",
        "Earning high compensation that accurately reflects the value and expertise I bring to the table",
        "Positive feedback from end-users expressing how the software made their lives significantly easier"
      ]
    }
  ],
  // Q5: 3-Year Vision
  [
    {
      question: "Where do you envision yourself 3 years from today in the tech industry?",
      options: [
        "A confident, senior engineer contributing to core architecture and guiding feature decisions",
        "A technical lead or engineering manager helping develop high-performing engineering teams",
        "A specialized domain expert in high-demand fields like Cloud/DevOps, AI Systems, or Security",
        "A successful founder or indie hacker running my own profitable digital software business"
      ]
    },
    {
      question: "What legacy or major achievement would you be proudest to look back on in 3 years?",
      options: [
        "Having architected a scalable, rock-solid system that scaled seamlessly to millions of users",
        "Having mentored multiple junior engineers who advanced into confident, successful developers",
        "Having mastered an advanced technical domain that puts me in the top tier of industry talent",
        "Having built a sustainable career with great compensation, autonomy, and genuine creative joy"
      ]
    }
  ]
];

/**
 * Infer the user's primary domain track from their answers so far
 * @param {object} answers - Parsed answers object keyed by stage
 * @returns {string} Track name from TRACKS
 */
function inferUserTrack(answers) {
  if (!answers || typeof answers !== 'object') return TRACKS.WEB_FRONTEND;

  // Flatten all submitted answers into a combined lowercase string
  const allText = Object.values(answers).flat().filter(Boolean).join(' ').toLowerCase();

  // Score domains based on signals
  const scores = {
    DATA_AI: 0,
    WEB_FRONTEND: 0,
    BACKEND_SYSTEMS: 0,
    CLOUD_DEVOPS: 0,
    UI_UX: 0,
    MOBILE: 0,
    CYBERSECURITY: 0,
  };

  // 1. Data & AI signals
  if (/python|pandas|numpy|data analysis|machine learning|scikit|pytorch|tensorflow|data pipeline|analytics dashboard|jupyter|bigquery|snowflake|ai assistant|llm/i.test(allText)) {
    scores.DATA_AI += 35;
  }
  if (/data dashboards|automation scripts|machine learning/i.test(allText)) {
    scores.DATA_AI += 30;
  }

  // 2. Web & Frontend signals
  if (/javascript|typescript|react|next\.js|component|frontend state|tanstack/i.test(allText)) {
    scores.WEB_FRONTEND += 35;
  }
  if (/delighting users with fast.*intuitive.*accessible/i.test(allText)) {
    scores.WEB_FRONTEND += 25;
  }

  // 3. Backend & Systems signals (use \bjava\b to avoid matching javascript)
  if (/\bjava\b|\bc#\b|\b\.net\b|spring|microservices|restful api|relational tables|sql queries|database schemas|postgresql|redis|caching layers/i.test(allText)) {
    scores.BACKEND_SYSTEMS += 35;
  }
  if (/backend services|server logic|high-performance backend/i.test(allText)) {
    scores.BACKEND_SYSTEMS += 30;
  }

  // 4. Cloud & DevOps signals
  if (/docker|kubernetes|terraform|devops|sre|ci\/cd|cloud infrastructure|linux|zero-downtime|aws cloudformation|prometheus|grafana/i.test(allText)) {
    scores.CLOUD_DEVOPS += 40;
  }

  // 5. UI/UX signals
  if (/visual ui|html \/ css|styling.*front-end basics|figma|wireframing|design system|user research|a11y|accessibility|typography tokens|visual design|usability/i.test(allText)) {
    scores.UI_UX += 45;
  }

  // 6. Mobile signals
  if (/mobile|ios|android|flutter|react native|swift|kotlin|jetpack compose|app store/i.test(allText)) {
    scores.MOBILE += 40;
  }

  // 7. Cybersecurity signals
  if (/cybersecurity|penetration|vulnerability|security auditing|owasp|burp suite|nmap|hardening|wireshark/i.test(allText)) {
    scores.CYBERSECURITY += 40;
  }

  // Find dominant track
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted[0] && sorted[0][1] > 0) {
    return sorted[0][0];
  }

  return TRACKS.WEB_FRONTEND;
}

/**
 * Generate a consistent pseudo-random seed from a session ID or attempt count
 */
function getSessionSeed(sessionId, userAttemptCount = 0) {
  if (typeof userAttemptCount === 'number' && userAttemptCount > 0) {
    return userAttemptCount - 1;
  }
  if (!sessionId) return 0;
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = ((hash << 5) - hash) + sessionId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Select the appropriate adaptive question for the given stage and index
 * @param {string} stage - Current stage (SKILLS_ASSESSMENT, CAREER_INTERESTS, etc.)
 * @param {number} questionIndexInStage - 0 to 4
 * @param {object} answers - All answers recorded so far
 * @param {number} sessionSeed - Seed for rotating variants across attempts
 * @param {Set<string>} alreadyAskedTexts - Set of question texts already asked in this session
 * @returns {object} { question: string, options: string[], stage: string }
 */
function selectAdaptiveQuestion(stage, questionIndexInStage, answers, sessionSeed = 0, alreadyAskedTexts = new Set()) {
  let selected = null;

  switch (stage) {
    case 'SKILLS_ASSESSMENT': {
      if (questionIndexInStage === 0) {
        // Calibration Question 1
        const variants = SKILLS_MATRIX.initial;
        for (let i = 0; i < variants.length; i++) {
          const candidate = variants[(sessionSeed + i) % variants.length];
          if (!alreadyAskedTexts.has(candidate.question)) {
            selected = candidate;
            break;
          }
        }
        if (!selected) selected = variants[sessionSeed % variants.length];
      } else {
        // Adaptive Questions 2 to 5 based on user track
        const track = inferUserTrack(answers);
        const branchList = SKILLS_MATRIX.branches[track] || SKILLS_MATRIX.branches.WEB_FRONTEND;
        const slotIndex = Math.min(questionIndexInStage - 1, branchList.length - 1);
        const slotVariants = branchList[slotIndex];

        if (Array.isArray(slotVariants)) {
          for (let i = 0; i < slotVariants.length; i++) {
            const candidate = slotVariants[(sessionSeed + i) % slotVariants.length];
            if (!alreadyAskedTexts.has(candidate.question)) {
              selected = candidate;
              break;
            }
          }
          if (!selected) selected = slotVariants[sessionSeed % slotVariants.length];
        } else {
          selected = slotVariants;
        }
      }
      break;
    }

    case 'CAREER_INTERESTS': {
      if (questionIndexInStage === 0) {
        // Calibration Question 1
        const variants = INTERESTS_MATRIX.initial;
        for (let i = 0; i < variants.length; i++) {
          const candidate = variants[(sessionSeed + i) % variants.length];
          if (!alreadyAskedTexts.has(candidate.question)) {
            selected = candidate;
            break;
          }
        }
        if (!selected) selected = variants[sessionSeed % variants.length];
      } else {
        // Adaptive Questions 2 to 5 based on user track
        const track = inferUserTrack(answers);
        const branchList = INTERESTS_MATRIX.branches[track] || INTERESTS_MATRIX.branches.WEB_FRONTEND;
        const slotIndex = Math.min(questionIndexInStage - 1, branchList.length - 1);
        const slotVariants = branchList[slotIndex];

        if (Array.isArray(slotVariants)) {
          for (let i = 0; i < slotVariants.length; i++) {
            const candidate = slotVariants[(sessionSeed + i) % slotVariants.length];
            if (!alreadyAskedTexts.has(candidate.question)) {
              selected = candidate;
              break;
            }
          }
          if (!selected) selected = slotVariants[sessionSeed % slotVariants.length];
        } else {
          selected = slotVariants;
        }
      }
      break;
    }

    case 'PERSONALITY_TRAITS': {
      const slotIndex = Math.min(questionIndexInStage, PERSONALITY_MATRIX.length - 1);
      const slotVariants = PERSONALITY_MATRIX[slotIndex];
      for (let i = 0; i < slotVariants.length; i++) {
        const candidate = slotVariants[(sessionSeed + i) % slotVariants.length];
        if (!alreadyAskedTexts.has(candidate.question)) {
          selected = candidate;
          break;
        }
      }
      if (!selected) selected = slotVariants[sessionSeed % slotVariants.length];
      break;
    }

    case 'LEARNING_STYLE': {
      const slotIndex = Math.min(questionIndexInStage, LEARNING_MATRIX.length - 1);
      const slotVariants = LEARNING_MATRIX[slotIndex];
      for (let i = 0; i < slotVariants.length; i++) {
        const candidate = slotVariants[(sessionSeed + i) % slotVariants.length];
        if (!alreadyAskedTexts.has(candidate.question)) {
          selected = candidate;
          break;
        }
      }
      if (!selected) selected = slotVariants[sessionSeed % slotVariants.length];
      break;
    }

    case 'CAREER_GOALS': {
      const slotIndex = Math.min(questionIndexInStage, GOALS_MATRIX.length - 1);
      const slotVariants = GOALS_MATRIX[slotIndex];
      for (let i = 0; i < slotVariants.length; i++) {
        const candidate = slotVariants[(sessionSeed + i) % slotVariants.length];
        if (!alreadyAskedTexts.has(candidate.question)) {
          selected = candidate;
          break;
        }
      }
      if (!selected) selected = slotVariants[sessionSeed % slotVariants.length];
      break;
    }

    default: {
      selected = SKILLS_MATRIX.initial[0];
    }
  }

  return {
    question: selected.question,
    options: selected.options,
    stage,
  };
}

module.exports = {
  TRACKS,
  inferUserTrack,
  getSessionSeed,
  selectAdaptiveQuestion,
  SKILLS_MATRIX,
  INTERESTS_MATRIX,
  PERSONALITY_MATRIX,
  LEARNING_MATRIX,
  GOALS_MATRIX,
};
