<div align="center">
  
<img src="frontend/public/VisionAi.png" width="150" alt="Vision AI Logo" />

# VISION AI

**Explainable AI for Diabetic Retinopathy Screening in Rural India**  
*SIH26038 | Team Viltrumites*

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/MATLAB-0076A8?style=flat-square&logo=mathworks&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

An AI-assisted triage platform connecting rural screening staff with remote ophthalmologists.

</div>

---

## ⚡ Overview

**Vision AI** tackles the critical shortage of ophthalmologists in rural India by providing a fast, secure, and explainable AI-assisted screening platform.

- **Bilateral Analysis**: Independent screening for Left & Right eyes.
- **Explainable AI**: Grad-CAM attention heatmaps for clinical trust.
- **Doctor-in-the-Loop**: AI assists; the remote doctor makes the final clinical decision.
- **Role-Based Portals**: Tailored workflows for Admin, Doctor, Staff, and Patient.

---

## 🔄 Clinical Workflow

<div align="center">
  <img src="frontend/src/assets/workflow-diagram.png" width="80%" alt="Workflow Diagram" />
</div>

1. **Staff** registers patient and uploads bilateral fundus images.
2. **AI Inference** processes images and returns a 5-class DR prediction per eye + Grad-CAM heatmap.
3. **Doctor** reviews the AI assessment and full-resolution images remotely.
4. **Final Decision** is recorded by the doctor, generating a secure clinical report.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Frontend[Frontend: React/Vite] --> Backend[Backend: Node.js/Express]
    Backend --> DB[(PostgreSQL)]
    Backend --> Inference[Inference Service: FastAPI]
    Inference --> Model[DR_EfficientNetB0_V2]
```

---

## 🧠 AI Model & Explainability

- **Model**: `DR_EfficientNetB0_V2` (5-Class Classification: No DR, Mild, Moderate, Severe, Proliferative)
- **Explainability**: **Grad-CAM** generates heatmaps showing where the AI focused. *(Note: This is an attention visualization, not diagnostic lesion segmentation).*

<div align="center">
  <img src="frontend/public/images/hero-slide-2.png" width="80%" alt="AI Screening" />
</div>

---

## ⚙️ Rural Simulation (MATLAB/Simulink)

We utilize **MATLAB** and **Simulink** to simulate rural screening deployment, optimizing resource planning and identifying facility bottlenecks.

<div align="center">
  <img src="frontend/src/assets/simulation-1.jpeg" width="45%" alt="Simulation 1" />
  <img src="frontend/src/assets/simulation-2.jpeg" width="45%" alt="Simulation 2" />
</div>

---

## 🛠️ Quick Start

**Prerequisites**: Docker, Docker Compose, Node.js

```bash
# 1. Setup Environment
cp .env.example .env

# 2. Launch Platform
docker compose up --build
```

---

## 👥 Team Viltrumites

| Role | Member |
|------|--------|
| **Team Leader** | Akshay Kumar Verma |
| **Members** | Anshu Kumar, Aditi Gargi, Sudarshan Kumar, Krishna Kumar, Aditya Singh |

---
<div align="center">
  <i>Copyright © 2026. All rights reserved.</i>
</div>
