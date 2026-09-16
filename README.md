<div align="center">

# VISION <span style="color: #4da8da;">AI</span>

### Explainable AI for Diabetic Retinopathy Screening in Rural India
**SIH26038 · Team Viltrumites**

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/MATLAB-0076A8?style=flat-square&logo=mathworks&logoColor=white" />
  <img src="https://img.shields.io/badge/Simulink-0076A8?style=flat-square&logo=mathworks&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

An AI-assisted screening platform connecting rural screening staff with remote ophthalmologists.

<br/>

[Overview](#overview) &nbsp;&nbsp;&nbsp; [Workflow](#clinical-workflow) &nbsp;&nbsp;&nbsp; [Architecture](#system-architecture) &nbsp;&nbsp;&nbsp; [AI Model](#ai-model) &nbsp;&nbsp;&nbsp; [Explainability](#explainability) &nbsp;&nbsp;&nbsp; [Simulation](#simulation) &nbsp;&nbsp;&nbsp; [Security](#security) &nbsp;&nbsp;&nbsp; [Setup](#setup) &nbsp;&nbsp;&nbsp; [Team](#team-viltrumites)

</div>

---

## Overview

Vision AI addresses the shortage of ophthalmologists in rural India by providing a secure, explainable, and AI-assisted diabetic retinopathy (DR) screening platform. The system enables screening staff to capture bilateral fundus images, leverages deep learning for initial analysis with explainability, and integrates a doctor-in-the-loop workflow for final clinical decision and reporting.

- AI-assisted triage for early DR screening in rural settings
- Bilateral eye analysis with explainability (Grad-CAM)
- Secure, role-based clinical workflow (Admin, Doctor, Staff, Patient)
- Rural deployment simulation using MATLAB/Simulink for resource planning

---

## Clinical Workflow

```mermaid
flowchart LR
    A((1<br/>Patient<br/>Registration)) --> B((2<br/>Bilateral<br/>Fundus Images<br/>Left & Right))
    B --> C((3<br/>AI<br/>Analysis))
    C --> D((4<br/>Explainability<br/>Grad-CAM))
    D --> E((5<br/>Doctor<br/>Review))
    E --> F((6<br/>Clinical<br/>Decision))
    F --> G((7<br/>Clinical<br/>Report))
    
    style A fill:#0d263b,stroke:#2a527b,color:#fff
    style B fill:#0d263b,stroke:#2a527b,color:#fff
    style C fill:#0d263b,stroke:#2a527b,color:#fff
    style D fill:#0d263b,stroke:#2a527b,color:#fff
    style E fill:#0d263b,stroke:#2a527b,color:#fff
    style F fill:#0d263b,stroke:#2a527b,color:#fff
    style G fill:#0d263b,stroke:#2a527b,color:#fff
```

---

## System Architecture

```mermaid
graph LR
    subgraph Client
        F[Frontend<br/>React / Vite]
    end
    
    subgraph Server
        B[Backend API<br/>Node.js / Express]
        DB[(PostgreSQL<br/>Database)]
    end
    
    subgraph AI Engine
        I[Inference Service<br/>Python / FastAPI]
        M[MATLAB Engine<br/>Model Inference]
        K[DR_EfficientNetB0_V2.mat<br/>5-Class Model]
    end

    F -->|HTTP| B
    B --- DB
    B -->|API| I
    I --> M
    M --> K
    
    style Client fill:#131d26,stroke:#304355,color:#fff
    style Server fill:#131d26,stroke:#304355,color:#fff
    style AI Engine fill:#131d26,stroke:#304355,color:#fff
```

---

## AI Model

The system uses a custom-trained **EfficientNetB0** model (`DR_EfficientNetB0_V2.mat`) for 5-class diabetic retinopathy classification. Left and right eye images are processed independently, and Grad-CAM is used to provide model attention visualization for clinical interpretability.

> [!NOTE]
> Grad-CAM highlights regions that influenced the model's prediction. It is an attention visualization tool and not a clinically validated lesion segmentation map.

<div align="center">

| Class | Diagnosis |
|:---:|:---|
| 0 | No DR |
| 1 | Mild |
| 2 | Moderate |
| 3 | Severe |
| 4 | Proliferative |

</div>

---

## Explainability & Simulation

<table width="100%" style="border: none;">
  <tr>
    <td width="50%" align="center" style="border: none;">
      <b>Clinical Explainability</b><br/><br/>
      <img src="frontend/public/images/hero-slide-2.png" width="90%" style="border-radius: 8px;" />
    </td>
    <td width="50%" align="center" style="border: none;">
      <b>MATLAB/Simulink Rural Simulation</b><br/><br/>
      <img src="frontend/src/assets/simulation-1.jpeg" width="45%" style="border-radius: 8px; margin-right: 5px;" />
      <img src="frontend/src/assets/simulation-2.jpeg" width="45%" style="border-radius: 8px;" />
    </td>
  </tr>
</table>

---

<table width="100%">
<tr>
<td width="50%" valign="top">

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Vite |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL |
| **AI Inference** | Python, FastAPI, MATLAB Engine |
| **Model** | EfficientNetB0 (`DR_EfficientNetB0_V2.mat`) |
| **Simulation** | MATLAB, Simulink |
| **Containerization** | Docker, Docker Compose |

</td>
<td width="50%" valign="top">

## Team Viltrumites

| Name | Role |
|---|---|
| **Akshay Kumar Verma** | Team Leader |
| **Anshu Kumar** | Team Member |
| **Aditi Gargi** | Team Member |
| **Sudarshan Kumar** | Team Member |
| **Krishna Kumar** | Team Member |
| **Aditya Singh** | Team Member |

</td>
</tr>
</table>

---

<table width="100%">
<tr>
<td width="50%" valign="top">

## Future Work

- Multi-image per eye processing
- Expanded model validation
- Dedicated segmentation models
- Scalable external object storage
- Enhanced rural simulation models
- Deployment optimization

</td>
<td width="50%" valign="top">

## License

Copyright © 2026. All rights reserved.

This project is developed for Smart India Hackathon (SIH26038) under Team Viltrumites.

</td>
</tr>
</table>
