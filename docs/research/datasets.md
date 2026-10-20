# Retinal Datasets & Benchmarking Scope — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Document Status:** Research Reference  

---

## 1. Overview of Retinal Datasets

Vision AI uses standardized, publicly available fundus photograph datasets for model development, pre-training, fine-tuning, and prospective evaluation.

In compliance with medical data privacy regulations and repository storage constraints, **no raw patient images or dataset splits are committed to this repository**. All dataset paths are configured externally via environment variables (e.g. `DATASET_ROOT`).

---

## 2. Dataset Inventory & Licensing

| Dataset | Primary Source | Access / License | Role in Vision AI | Sample Size | Classes / Annotations |
|---|---|---|---|:---:|---|
| **APTOS 2019 Blindness Detection** | Aravind Eye Hospital / Kaggle | Non-commercial research competition license | Fine-tuning & verification cohort | 3,662 images | 5-class ICDR severity grades (0–4) |
| **EyePACS (Kaggle DR)** | EyePACS / California Telehealth Network | Open research benchmark license | Backbone pre-training reference | ~35,000 images | 5-class ICDR severity grades (0–4) |
| **Messidor / Messidor-2** | Inserm / Messidor Consortium | Research use agreement | Prospective external generalization | 1,748 images | 4-class DR severity + macular edema |
| **IDRiD (Indian Diabetic Retinopathy Image Dataset)** | Eye Clinic, Nanded, India / IEEE Dataport | CC BY 4.0 | Planned lesion segmentation benchmark | 516 images | Pixel-level masks: MAs, HEs, SEs, Hemorrhages |
| **DRIVE (Digital Retinal Images for Vessel Extraction)** | University Medical Center Utrecht | Non-commercial research license | Planned vessel segmentation benchmark | 40 images | Manual binary vessel segmentations |

---

## 3. Data Split & Verification Methodology

### 3.1 Patient-Level Partitioning
To prevent data leakage, dataset splitting must occur at the **patient level** rather than the image level whenever multi-field or bilateral images exist for a single subject.

### 3.2 Held-Out Verification Split ($N=15$)
A stratified 15-sample verification subset was retained in `model/production/V2/verification_report.json` covering all five ICDR severity stages:
- Level 0 (No DR): 3 images
- Level 1 (Mild NPDR): 3 images
- Level 2 (Moderate NPDR): 3 images
- Level 3 (Severe NPDR): 3 images
- Level 4 (Proliferative DR): 3 images

This subset provides a fixed, reproducible benchmark for verifying model checkpoints on edge installations without downloading gigabyte-scale datasets.

---

## 4. Ethical Data Governance & Attribution

- **Patient Anonymization:** All benchmark datasets referenced have undergone full de-identification by their original institutional ethics committees.
- **Fair Representation:** IDRiD and APTOS represent Indian patient cohorts, specifically addressing variations in fundus pigmentation and lesion appearance common in South Asian populations.
