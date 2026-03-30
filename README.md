# PipelineRadar

> A production-grade CI/CD observability platform that monitors GitHub Actions pipelines in real time — built and deployed using the full DevOps toolchain.

![CI](https://github.com/hashini-sugandika/pipeline-radar/actions/workflows/ci.yml/badge.svg)

## What is PipelineRadar?

PipelineRadar is a universal CI/CD monitoring platform that gives engineering teams a single place to:

- **Monitor** — real-time pipeline status across all connected GitHub repos
- **Analyze** — automatic failure pattern detection with root cause hints
- **Alert** — instant Slack notifications when pipelines degrade
- **Trend** — track build health, success rates, and duration over time

The most interesting part: PipelineRadar is deployed using the same DevOps toolchain it monitors. Every push to this repo triggers a GitHub Actions pipeline that builds Docker images, runs security scans, and deploys to Kubernetes via ArgoCD.

## Architecture
```
GitHub Actions Webhook
        │
        ▼
┌─────────────────┐     Redis Pub/Sub    ┌──────────────────┐
│ Ingestion       │─────────────────────▶│ Analysis         │
│ Service :3001   │                      │ Service :3002    │
│                 │                      │                  │
│ • Receives      │                      │ • Pattern detect │
│   webhooks      │                      │ • Consecutive    │
│ • Stores in     │                      │   failures       │
│   PostgreSQL    │                      │ • Slow builds    │
│ • Publishes     │                      │ • Timeouts       │
│   events        │                      │                  │
└─────────────────┘                      └──────────────────┘
        │                                        │
        │                                Redis Pub/Sub
        │                                        │
        ▼                                        ▼
┌─────────────────┐                    ┌──────────────────┐
│ PostgreSQL      │                    │ Alerts           │
│ Redis Cache     │                    │ Service :3003    │
│                 │                    │                  │
│ • Pipeline runs │                    │ • Slack notify   │
│ • Analysis data │                    │ • Alert history  │
│ • Real-time     │                    │ • Severity       │
│   state         │                    │   routing        │
└─────────────────┘                    └──────────────────┘
                                                │
                                                ▼
                                    ┌──────────────────┐
                                    │ React Dashboard  │
                                    │ :3000            │
                                    │                  │
                                    │ • Live status    │
                                    │ • Stats bar      │
                                    │ • Alerts feed    │
                                    │ • Auto-refresh   │
                                    └──────────────────┘
```

## Tech Stack

### Application
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 20 + Express | Microservice backend |
| Database | PostgreSQL 15 | Pipeline run history |
| Cache/Pub-Sub | Redis 7 | Real-time state + event streaming |
| Frontend | React 18 | Real-time dashboard UI |

### DevOps
| Tool | Purpose |
|------|---------|
| GitHub Actions | CI pipeline — build, test, push |
| Docker | Containerization |
| Kubernetes (kind/K3s) | Container orchestration |
| Helm | Kubernetes package management |
| ArgoCD | GitOps continuous delivery |
| Terraform | Infrastructure as Code (GCP) |
| Prometheus | Metrics collection |
| Grafana | Dashboards and visualization |
| Loki | Log aggregation |
| Trivy | Container security scanning |
| HashiCorp Vault | Secrets management |

## Project Structure
```
pipeline-radar/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── services/
│   ├── ingestion-service/      # Webhook receiver + API
│   ├── analysis-service/       # Failure pattern detection
│   └── alerts-service/         # Slack notifications
├── frontend/                   # React dashboard
├── k8s/
│   ├── base/                   # Kubernetes manifests
│   └── monitoring/             # Prometheus + Grafana config
├── helm/                       # Helm charts
├── terraform/                  # GCP infrastructure
└── docker-compose.yml          # Local development
```

## Getting Started

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- kubectl
- kind (for local Kubernetes)

### Local Development

**1. Start infrastructure:**
```bash
docker compose up postgres redis -d
```

**2. Start services (3 separate terminals):**
```bash
cd services/ingestion-service && npm run dev   # Terminal 1
cd services/analysis-service && npm run dev    # Terminal 2
cd services/alerts-service && npm run dev      # Terminal 3
```

**3. Start frontend:**
```bash
cd frontend && npm start
```

**4. Open dashboard:**
```
http://localhost:3000
```

**5. Send a test webhook:**
```bash
curl -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -H "x-github-event: workflow_run" \
  -d '{
    "workflow_run": {
      "id": 12345,
      "name": "CI Pipeline",
      "status": "completed",
      "conclusion": "failure",
      "head_branch": "main",
      "head_sha": "abc123",
      "run_started_at": "2026-03-26T05:00:00Z",
      "updated_at": "2026-03-26T05:02:30Z",
      "triggering_actor": { "login": "your-username" }
    },
    "repository": { "full_name": "your-org/your-repo" }
  }'
```

### Kubernetes Deployment

**1. Create kind cluster:**
```bash
kind create cluster --name pipeline-radar
```

**2. Install ArgoCD:**
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

**3. Apply ArgoCD app:**
```bash
kubectl apply -f k8s/argocd-app.yaml
```

ArgoCD will automatically sync all manifests from this repo.

### Infrastructure (GCP)
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Provisions a free `e2-micro` VM on GCP with K3s pre-installed.

## CI/CD Pipeline

Every push to `main` triggers:
```
Push to main
     │
     ├── Test Ingestion Service
     ├── Test Analysis Service
     └── Test Alerts Service
              │
              ▼
     Build & Push Docker Images
     (ghcr.io/hashini-sugandika/pipeline-radar-*)
              │
              ▼
     Security Scan (Trivy)
     (CRITICAL + HIGH vulnerabilities)
              │
              ▼
     ArgoCD detects new images
              │
              ▼
     Auto-deploy to Kubernetes
```

## API Reference

### Ingestion Service (`:3001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/webhook/github` | Receive GitHub Actions webhook |
| GET | `/pipelines` | List all pipeline runs |
| GET | `/pipelines/stats` | Aggregated statistics |
| GET | `/pipelines/:repo` | Runs for specific repo |
| GET | `/metrics` | Prometheus metrics |

### Analysis Service (`:3002`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/analysis/:repo` | Analysis results for repo |
| GET | `/analysis/summary/critical` | Critical patterns last 24h |

### Alerts Service (`:3003`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/alerts` | Alert history |
| GET | `/alerts/stats` | Alert statistics |

## Connecting a Real GitHub Repo

1. Go to your GitHub repo → **Settings** → **Webhooks** → **Add webhook**
2. Set **Payload URL** to `http://YOUR_SERVER_IP:3001/webhook/github`
3. Set **Content type** to `application/json`
4. Select **Workflow runs** under events
5. Click **Add webhook**

PipelineRadar will immediately start monitoring that repo's pipelines.

## Monitoring

- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3030` (admin/admin123)

Default dashboards include:
- Kubernetes cluster health
- Node metrics
- PipelineRadar custom metrics (webhooks, duration, failure rates)

## Author

**Hashini Sugandika**
Associate Engineer → DevOps Engineer

- GitHub: [@hashini-sugandika](https://github.com/hashini-sugandika)

## License

MIT
