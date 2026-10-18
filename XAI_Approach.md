# Explainable AI Approach for Diabetic Retinopathy Screening

## 1. Overview

This document describes the Explainable Artificial Intelligence (XAI) approach used in the **Diabetic Retinopathy Screening** project.

The objective of the project is to classify retinal fundus images into different diabetic retinopathy severity levels while providing an explanation of the regions that influenced the model's prediction.

The system combines image preprocessing, retinal feature analysis, deep learning-based classification, and explainability techniques.

---

## 2. System Pipeline

The overall workflow is:

```text
Retinal Fundus Image
        ↓
Image Preprocessing
        ↓
Blood Vessel Analysis
        ↓
Exudate Detection
        ↓
EfficientNetV2
        ↓
DR Severity Classification
        ↓
XAI Analysis
        ↓
Prediction + Visual Explanation
```

The model classifies diabetic retinopathy into five severity levels:

| Class | Description |
|---|---|
| 0 | No Diabetic Retinopathy |
| 1 | Mild |
| 2 | Moderate |
| 3 | Severe |
| 4 | Proliferative Diabetic Retinopathy |

---

## 3. Image Preprocessing

Before sending an image to the deep learning model, preprocessing is performed to improve consistency between input images.

The preprocessing pipeline includes:

- Image resizing
- Image normalization
- Image quality enhancement
- Removal/reduction of unwanted noise
- Preparation of the image for model input

The preprocessing stage helps the model focus on clinically relevant retinal patterns rather than differences caused by image size or acquisition conditions.

---

## 4. Retinal Feature Analysis

### 4.1 Blood Vessel Analysis

Blood vessels are important structures in retinal images and can provide useful information for diabetic retinopathy analysis.

Computer vision techniques are used to identify and analyze retinal blood vessel patterns.

The extracted vessel information can help identify structural abnormalities and provide additional information about the retinal condition.

### 4.2 Exudate Detection

Exudates are bright lesions that may appear in retinal images as a result of diabetic retinopathy.

The system analyzes retinal images to identify regions that may correspond to exudates.

These regions provide additional visual information that can support the classification process.

---

## 5. Deep Learning Model

### EfficientNetV2

The classification component uses **EfficientNetV2** as the deep learning architecture.

The model receives a preprocessed retinal image and predicts the corresponding diabetic retinopathy severity level.

```text
Input Image
     ↓
EfficientNetV2
     ↓
Feature Extraction
     ↓
Classification Layer
     ↓
DR Severity
```

EfficientNetV2 was selected because it provides a good balance between model performance and computational efficiency, making it suitable for image classification tasks.

---

## 6. Explainable AI

A major objective of this project is not only to obtain a prediction but also to understand **why the model produced that prediction**.

Deep learning models can sometimes behave like a black box. XAI techniques are therefore used to visualize the image regions that contribute to the model's decision.

### XAI Workflow

```text
Retinal Image
      ↓
EfficientNetV2
      ↓
Predicted DR Class
      ↓
XAI Method
      ↓
Importance / Activation Map
      ↓
Overlay on Original Image
```

The resulting visualization highlights areas that had a stronger influence on the model's prediction.

---

## 7. Interpretation of XAI Results

The XAI visualization can be used to determine whether the model is focusing on meaningful retinal structures.

For example, the explanation may highlight regions containing:

- Exudates
- Abnormal blood vessels
- Lesions
- Other retinal abnormalities

The explanation does not replace a medical professional's diagnosis. Instead, it provides a visual interpretation of the model's decision and can help researchers and clinicians understand model behavior.

---

## 8. Example Explanation

A typical prediction can be represented as:

```text
Input:
Retinal Fundus Image

Prediction:
DR Grade 3 — Severe

Confidence:
XX%

Important Regions:
Highlighted retinal regions

Explanation:
The XAI visualization indicates the image regions that
contributed most strongly to the predicted class.
```

> **Note:** Actual confidence values and predictions should be generated from the trained model and should not be manually assigned.

---

## 9. Evaluation

The model should be evaluated using multiple performance metrics rather than accuracy alone.

Recommended metrics include:

| Metric | Purpose |
|---|---|
| Accuracy | Overall classification performance |
| Precision | Correctness of positive predictions |
| Recall | Ability to identify relevant cases |
| F1-Score | Balance between precision and recall |
| Confusion Matrix | Class-wise prediction analysis |

Example:

```text
Accuracy  : XX%
Precision : XX%
Recall    : XX%
F1-Score  : XX%
```

The `XX%` values should be replaced with the actual results obtained from the trained model.

---

## 10. Limitations

The current system has several limitations:

- Performance depends on the quality and diversity of the dataset.
- Class imbalance can affect classification performance.
- XAI visualizations indicate model attention but do not automatically prove clinical causality.
- Further validation is required before using the system in real-world clinical environments.
- External datasets should be used to evaluate model generalization.

---

## 11. Future Improvements

Possible improvements include:

1. Training on larger and more diverse retinal datasets.
2. Handling class imbalance using appropriate sampling or augmentation techniques.
3. Improving blood vessel and exudate segmentation.
4. Comparing multiple XAI techniques.
5. Evaluating explanation consistency across different images.
6. Testing the model on external datasets.
7. Developing a web-based screening interface.
8. Adding confidence-based warnings for uncertain predictions.
9. Conducting expert evaluation of generated explanations.

---

## 12. Conclusion

The proposed system combines **computer vision, EfficientNetV2-based deep learning, and Explainable AI** to create an interpretable diabetic retinopathy screening pipeline.

Instead of providing only a severity prediction, the system aims to provide a visual explanation of the retinal regions that influenced the model.

This approach can improve model transparency and make the system easier to analyze during research and development.

**Important:** This system is intended as an AI-assisted screening/research tool and is not a replacement for professional medical diagnosis.
