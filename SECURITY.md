# Security Policy — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Document Status:** Medical Device Security Policy  

We take the security of medical decision-support software and patient health information seriously. We appreciate the efforts of security researchers, clinicians, and community members who help us identify and address vulnerabilities.

---

## 1. Supported Versions

| Version | Status | Notes |
|---|---|---|
| **Vision AI v2.x** | **Supported** | Active production pipeline (`DR_EfficientNetB0_V2.keras`, FastAPI, Node/Express Gateway) |
| **Vision AI v1.x** | Deprecated | Legacy prototype; upgrade to v2.x recommended |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability or potential privacy leak (e.g. exposure of unmasked patient identifiers, authentication bypass, or model tampering):

- **Private Reporting:** Please do **not** open a public GitHub issue. Email the team lead privately at `security@visionai.health` or contact the maintainers via GitHub's private vulnerability reporting channel.
- **Report Details:** Please provide:
  1. Description of the vulnerability and attack vector.
  2. Steps to reproduce or proof-of-concept payload.
  3. Assessment of potential impact on patient data privacy or clinical decision integrity.
- **Response Timeline:** We commit to acknowledging reports within **48 hours** and providing an initial severity assessment within **5 business days**.

---

## 3. Medical Data Security & Incident Protocol

- **Zero-Tolerance for PHI Exposure:** Vision AI does not store raw 12-digit Aadhaar UID numbers or biometric templates. Any finding indicating raw identification leakage is treated as a P0 Critical vulnerability.
- **Model Weight Tamper-Resistance:** Model weights must match documented SHA-256 hashes. Unauthorized weight substitution is treated as a critical clinical safety threat.
- **Responsible Disclosure:** We ask researchers to give the maintainers reasonable time to remediate issues before public disclosure.
