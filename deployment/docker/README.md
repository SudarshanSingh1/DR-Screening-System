# Containerized Deployment & Docker Operations — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Document Status:** Deployment Guide  

---

## 1. Overview

Vision AI deploys as a 4-container stack managed via Docker Compose:

1. **`frontend`:** Nginx reverse proxy serving the compiled React 18 / Vite single-page application on port 3000.
2. **`backend`:** Node.js 20 / Express 5 API gateway handling authentication, session cookies, RBAC, and PDFKit report generation on port 8080.
3. **`inference`:** FastAPI Python 3.11 service running TensorFlow 2.x and the production EfficientNetB0 V2 classifier on port 8000.
4. **`database`:** PostgreSQL 16 relational database retaining screening metadata, patient records, and audit trails on port 5432.

---

## 2. Quick Start Commands

```bash
# 1. From repository root, configure environment
cp .env.example .env

# 2. Build and launch all 4 services
docker compose up --build

# 3. Check container logs
docker compose logs -f

# 4. Tear down the stack
docker compose down
```

---

## 3. Persistent Volumes

- **`postgres_data`:** Retains relational database tables across container restarts.
- **`uploads`:** Mounted at `/app/uploads` in `backend` and `inference` to persist original fundus images and immutable signed PDF reports.
