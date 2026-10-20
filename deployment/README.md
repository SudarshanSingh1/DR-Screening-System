# Deployment & Infrastructure Guide — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Document Status:** Deployment Overview  

---

## Deployment Topologies

1. **Local Edge Screening Appliance (Primary Deployment):**
   - Deployed on on-premise hardware at Primary Health Centres (PHCs) or mobile screening vans.
   - Orchestrated via Docker Compose (`docker-compose.yml`).
   - Does not require high-speed public internet for real-time screening or quality gate evaluation.
   - For detailed instructions, see [`deployment/docker/README.md`](docker/README.md).

2. **District Tele-Ophthalmology Server:**
   - Deployed at a District Hospital or Medical College.
   - Hosts the Doctor Review Portal where vitreoretinal specialists examine prioritized tele-triage queues.
   - Receives encrypted screening batches from peripheral PHCs.

---

## Environment Configuration

Copy `.env.example` to `.env` before starting services. Ensure production environments configure a minimum 32-character random string for `SESSION_SECRET` and set `PRESENTATION_DEMO_MODE="false"`.
