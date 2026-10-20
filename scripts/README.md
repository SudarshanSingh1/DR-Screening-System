# Repository Utility Scripts — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Document Status:** Operational Scripts Guide  

---

## Available Scripts

1. **`run_all_tests.sh`:**
   Unified automated test runner executing:
   - Backend unit tests (`npm test`)
   - Python unit tests (Quality Gate & evidence generators)
   - FastAPI integration tests
   - Security and privacy validation tests
   - Evaluation pipeline unit tests
   - Reproducible Referable-DR benchmark evaluation
   ```bash
   bash scripts/run_all_tests.sh
   ```

2. **`verify_environment.py`:**
   Pre-flight environment and model artifact checker verifying Python version, required modules, Node, Docker, and Keras/MATLAB weight paths.
   ```bash
   python3 scripts/verify_environment.py
   ```
