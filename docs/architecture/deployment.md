# Deployment Architecture & Operations — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Status:** Production Edge Deployment Reference  

---

## 1. Overview of Deployment Architecture

Vision AI is containerized using Docker and orchestrated with Docker Compose to enable plug-and-play installation on local servers at rural Primary Health Centres (PHCs) and district hospitals.

```text
Host Server (Local Edge / Linux or macOS)
┌────────────────────────────────────────────────────────────────────────┐
│ Docker Compose Bridge Network: visionai_net                            │
│                                                                        │
│   ┌─────────────────────┐             ┌────────────────────────────┐   │
│   │ frontend (Port 3000)│ ──HTTP/WS── │ backend (Port 8080)        │   │
│   │ Nginx + React 18    │             │ Node.js 20 + Express 5     │   │
│   └─────────────────────┘             └─────────────┬──────────────┘   │
│                                                     │                  │
│                                                     │ REST / HTTP      │
│                                                     ▼                  │
│   ┌─────────────────────┐             ┌────────────────────────────┐   │
│   │ database (Port 5432)│ ◄──TCP/SQL──┤ inference (Port 8000)      │   │
│   │ PostgreSQL 16       │             │ FastAPI + TensorFlow 2.x   │   │
│   └─────────────────────┘             └────────────────────────────┘   │
│              │                                      │                  │
│              ▼                                      ▼                  │
│   [Persistent pgdata]                     [Persistent /uploads]        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Container Service Inventory

| Service | Container Image / Base | Internal Port | Host Port | Health Check |
|---|---|:---:|:---:|---|
| `frontend` | `node:20-alpine` (builder) + `nginx:alpine` | 80 | 3000 | HTTP `GET /` |
| `backend` | `node:20-alpine` | 8080 | 8080 | HTTP `GET /api/health` |
| `inference` | `python:3.11-slim` | 8000 | 8000 | HTTP `GET /health` |
| `database` | `postgres:16-alpine` | 5432 | 5432 | `pg_isready -U visionai` |

---

## 3. Persistent Volumes

1. **`postgres_data`:** Retains relational schema, patient intake records, screening history, clinical reviews, and audit logs.
2. **`uploads`:** Mounted at `/app/uploads` in `backend` and accessible to `inference`. Stores original fundus photographs and immutable generated clinical PDF reports.

---

## 4. Local Quick Start

### 4.1 Prerequisites
- Docker Engine 24.0+
- Docker Compose 2.20+
- 4 GB RAM minimum (8 GB recommended for simultaneous TensorFlow inference)
- 10 GB free disk space

### 4.2 Step-by-Step Installation

```bash
# 1. Clone repository
git clone https://github.com/SudarshanSingh1/DR-Screening-System.git
cd DR-Screening-System

# 2. Configure environment variables
cp .env.example .env

# 3. Launch the container stack
docker compose up --build
```

### 4.3 Verifying Service Health

```bash
# Check running containers
docker compose ps

# Check inference microservice health
curl -f http://localhost:8000/health

# Check backend gateway health
curl -f http://localhost:8080/api/health
```

---

## 5. Troubleshooting & Edge Maintenance

- **Inference Service Out of Memory (OOM):** On constrained edge devices ($<4\text{ GB}$ RAM), configure container memory limits in `docker-compose.yml` (`mem_limit: 2g`).
- **Database Connection Refused:** Verify that the `database` service health check passes before the backend launches. Docker Compose automatically enforces `depends_on: { database: { condition: service_healthy } }`.
- **Permission Errors on `/uploads`:** Ensure the directory is writable by user `node` (UID 1000) inside the backend container.
