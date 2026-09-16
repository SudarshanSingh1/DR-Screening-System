import re

with open('README.md', 'r') as f:
    content = f.read()

mermaid_diagram = """
---

## Deep Learning Pipeline

```mermaid
flowchart TD
    A[📷 Raw Fundus Image] --> B[🔍 Quality Assessment: assessQuality]
    
    B -- "0.40 <= Score < 0.65 Borderline" --> C[✨ Adaptive Enhancement: enhanceImage]
    B -- "Score < 0.40 Reject" --> D[❌ Recapture Image Feedback]
    B -- "Score >= 0.65 Good" --> E
    
    C --> E
    
    subgraph Micro-Structure Extraction
        E[👁️ Retinal Structure Segmentation]
        E --> F[Optic Disc & Fovea Localization]
        E --> G[Multi-scale Gabor Vessel Extraction]
        E --> H[Multi-Lesion Detection: MA, Exudate, Hem, NV]
    end
    
    F --> I
    G --> I
    H --> I
    
    subgraph Multi-Stream Intelligence
        I[🧠 Deep Ensemble & Feature Fusion]
        I --> J[9 Quantitative Clinical Feature Metrics]
        I --> K[InceptionV3 & EfficientNet-B0 + TTA]
    end
    
    J --> L
    K --> L
    
    L[🌲 Random Forest Fusion & Temperature Calibration]
    
    L --> M[🔥 Grad-CAM Heatmap & Lesion Overlay]
    L --> N[📊 Referable DR Decision: Level >= 2]
    
    M --> O[📄 Clinical PDF/PNG Screening Report Generator]
    N --> O
    N --> P[📡 Telemedicine Simulink Workflow Simulation]
    
    classDef default fill:#1e1e1e,stroke:#444,stroke-width:1px,color:#fff
    classDef reject fill:#3a1d1d,stroke:#ff4d4d,color:#fff
    
    class D reject
```
"""

# Find where to insert it. We'll insert it right after the AI Model section's image and before Project Structure.
pattern = r'(<br /><sub>AI-assisted screening interface demonstrating bilateral analysis and clinical workflow\.</sub>\n</div>)'

content = re.sub(pattern, r'\1\n' + mermaid_diagram, content)

# Add to Table of Contents
toc_pattern = r'(- \[AI Model\]\(#ai-model\))'
content = re.sub(toc_pattern, r'\1\n- [Deep Learning Pipeline](#deep-learning-pipeline)', content)

with open('README.md', 'w') as f:
    f.write(content)

print("Patched README.md")
