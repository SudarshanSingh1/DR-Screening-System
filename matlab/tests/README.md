# MATLAB Pipeline Tests

This directory contains automated execution tests for the MATLAB research and reference pipeline.

> **Note:** These tests verify pipeline structure, data type integrity, and execution flow. They do **not** validate clinical diagnostic accuracy.

---

## Available Tests

| Test Script | Scope | Prerequisites |
|---|---|---|
| [`testRealPipeline.m`](testRealPipeline.m) | End-to-end execution test: model loading, preprocessing, inference, Grad-CAM generation, and reporting | MATLAB R2023b+, Deep Learning Toolbox, Image Processing Toolbox |

---

## Test Images and Fixtures

The pipeline test dynamically locates test fundus images from two sources in order of preference:

1. **Dedicated Test Directory (Recommended for full test sets):**
   ```text
   data/test_images/
   ├── Level0/   # No DR sample images (*.png)
   ├── Level1/   # Mild DR sample images (*.png)
   ├── Level2/   # Moderate DR sample images (*.png)
   ├── Level3/   # Severe DR sample images (*.png)
   └── Level4/   # Proliferative DR sample images (*.png)
   ```
2. **Repository Sample Fixtures (Fallback):**
   If `data/test_images/` is not present, the test automatically falls back to verified sample images in:
   ```text
   frontend/public/images/fundus/
   ├── level0.png
   ├── level1.png
   ├── level2.png
   ├── level3.png
   └── level4.png
   ```

---

## Running Tests

From the MATLAB Command Window:

```matlab
% Navigate to test directory
cd('path/to/DR-Screening-System/matlab/tests')

% Run the end-to-end pipeline test
testRealPipeline
```

---

## Expected Output

```text
======================================================
 DR Screening System -- Real Pipeline Execution Test
======================================================

[INFO] Using repository sample fixtures from: .../frontend/public/images/fundus
[TEST A] Model path repository-relative, loading...
  PASS: Model loaded.

[TEST 1] Executing pipeline on level0.png (Execution check only)
  PASS: Pipeline executed successfully. (Prediction: No_DR)
...
======================================================
 Results: 6/6 passed
 ALL EXECUTION TESTS PASSED
======================================================
```
