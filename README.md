# Khashana Attack Surface Intelligence

External Attack Surface Discovery & Vulnerability Prioritization

Khashana Attack Surface Intelligence demonstrates how a security researcher can move from asset discovery to validated risk and actionable remediation. It is a **local-only, simulated security assessment platform** built around the fictional organization Northstar Labs. It never represents real-client data and does not scan third-party infrastructure.

> “Know your attack surface before an attacker does.”

## What this demonstrates

- Discovery, classification, and inventory of synthetic local-lab assets
- Intelligence-layer normalization rather than raw terminal output
- Contextual asset risk scoring, not vulnerability-count ranking
- Explicit separation of detection, human validation, and final priority
- Baseline comparison and attack-surface change detection
- Remediation/retest states and a downloadable executive PDF

## Portfolio story

| Client question | Demonstrated capability |
| --- | --- |
| What is exposed? | Asset inventory and attack-surface map |
| What matters most? | Contextual risk prioritization |
| Is it actually exploitable? | Security Researcher Review and validation states |
| How do we fix it? | Evidence, recommendations, remediation status |
| Did the risk go away? | Baseline change detection and reassessment |

## Technology Stack

- **Backend / Core Engine:** Node.js (v20+, zero external runtime dependencies, built using `node:http`, `node:test`, `node:crypto`)
- **Frontend Dashboard:** Vanilla JavaScript (ES6+), Semantic HTML5, CSS3 with responsive dark UI
- **Persistence & Containerization (Optional):** PostgreSQL 16 Alpine, Docker & Docker Compose
- **Specification & CI/CD:** OpenAPI 3.1 specification, GitHub Actions CI workflow

## Project Structure

```text
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated lint, test, and container build
├── database/
│   └── schema.sql               # PostgreSQL schema with audit logs and scope enforcement
├── docs/
│   ├── architecture.md          # Data flow and finding lifecycle diagrams
│   ├── freelance-service.md     # External attack surface assessment service scope
│   ├── HUMAN-FINAL-TOUCH.md     # Researcher notes and evaluation guidelines
│   ├── methodology.md           # 7-step assessment methodology
│   ├── openapi.yaml             # OpenAPI 3.1 REST API specification
│   └── freelance/
│       └── case-study.md        # Simulated Northstar Labs engagement narrative
├── public/
│   ├── app.js                   # Client-side reactivity, filtering, and review modal
│   ├── index.html               # Security intelligence single-page dashboard
│   ├── overrides.css            # Responsive layout constraints
│   └── styles.css               # Professional dark cybersecurity design system
├── test/
│   └── server.test.js           # Deterministic unit and integration tests (node:test)
├── .env.example                 # Example configuration environment variables
├── .gitignore                   # Excludes secrets, node_modules, and cache files
├── Dockerfile                   # Lightweight multi-stage Node.js container image
├── docker-compose.yml           # Local-lab orchestration with isolated network
├── package.json                 # Scripts and engine definitions
├── package-lock.json            # Deterministic dependency lockfile
└── server.js                    # Core HTTP server, synthetic risk engine & reporting
```

## Installation & Local Setup

### Prerequisites
- Node.js 20 or later
- (Optional) Docker & Docker Compose

### Quick Start (Standalone)

```bash
# Clone the repository
git clone https://github.com/Khashana22/khashana-attack-surface-intelligence.git
cd khashana-attack-surface-intelligence

# Copy environment configuration (optional defaults work out of the box)
cp .env.example .env

# Run the local intelligence platform
npm start
# Open http://localhost:3000 in your browser
```

### Docker Compose (with PostgreSQL)

```bash
docker compose up --build
```

The Compose network is strictly internal; the demo’s scan route accepts only `.local` targets and returns a normalized synthetic fixture—no external network scan is performed.

## Testing & Quality

Run the test suite and syntax verification:

```bash
# Run unit and integration tests
npm test

# Run syntax and linter checks
npm run lint
```

## Architecture and Methodology

- [Architecture](docs/architecture.md)
- [Methodology](docs/methodology.md)
- [Simulated case study](docs/freelance/case-study.md)
- [Freelance service positioning](docs/freelance-service.md)
- [Human final touch](docs/HUMAN-FINAL-TOUCH.md)
- [OpenAPI contract](docs/openapi.yaml)

## Risk model

Each asset’s score caps at 100 and accounts for business criticality, environment/exposure, authentication surface, and open finding severity adjusted for confidence. Remediated, closed, and false-positive signals are excluded. This deliberately lets a medium-confidence exposure on a high-criticality production authentication surface outrank a more severe issue on an isolated development host when the context warrants it.

## Security notes

The platform applies secure response headers, input bounds, a local-lab-only target allow-list, no hard-coded application secrets, and validation for finding state transitions. The PostgreSQL schema includes audit logs and explicit scope authorization fields. Production deployment still requires real authentication/authorization, CSRF protection for cookie sessions, persistent database integration, rate limits at the edge, and a secrets manager.

## Screenshots

Start the demo locally to view real, generated interface states. Screenshot capture is intentionally not committed until it is captured from a running instance; no stock or fabricated tool screenshots are used.

## Author

Sayed Khashana — Web & API Security Researcher  
[github.com/Khashana22](https://github.com/Khashana22)

## Disclaimer

This is a training and portfolio demonstration using only fictional organizations and controlled local-lab data. Obtain written authorization before conducting any security testing.
