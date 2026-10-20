# Medical Data Privacy & Security Architecture — Vision AI

**Project:** Vision AI — SIH26038 | Smart India Hackathon 2026  
**Document Status:** Security & Privacy Specification  

---

## 1. Regulatory Context & Compliance Mandates

Vision AI is designed in alignment with healthcare data protection principles:
- **Digital Personal Data Protection (DPDP) Act 2023 (India)**: Data minimization, purpose limitation, and lawful processing of personal health data.
- **UIDAI Aadhaar Data Security Guidelines**: Prohibition of unencrypted storage of 12-digit UID numbers.
- **ISO/IEC 27001 & HIPAA Security Rule Concepts**: Role-based access control, cryptographic isolation, and audit logging.

---

## 2. Aadhaar & Patient Data Governance

```text
Patient Registration Intake
┌────────────────────────────────────────────────────────┐
│ Client-side registration form                          │
│ Patient provides identification / demographic info     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Backend Sanitization Engine                            │
│ - Raw 12-digit UID numbers are NEVER stored or logged  │
│ - Generates opaque internal UUID: patientId            │
│ - Retains masked reference only: 'XXXX XXXX 1234'      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ PostgreSQL 'Patient' Model                             │
│ Column 'aadhaarReference' = 'XXXX XXXX 1234'           │
│ Column 'patientId' = 'pat_c87f2e1a...'                 │
└────────────────────────────────────────────────────────┘
```

1. **No Raw UID Ingestion:** The database schema (`backend/prisma/schema.prisma`) and application code explicitly prohibit storing raw 12-digit Aadhaar UID numbers or biometric templates.
2. **Opaque Patient References:** All patient entities use cryptographically secure random UUIDs (`patientId`) as their primary key.
3. **Masked Display on Reports:** Generated referral reports (`pdf.ts`) display identification strictly in masked format: `XXXX XXXX 1234`.

---

## 3. Role-Based Access Control (RBAC) & Authorization

The platform enforces strict role-based separation:

| Role | Permitted Actions | Data Visibility |
|---|---|---|
| **SCREENING_STAFF** | Patient intake, bilateral fundus upload, view quality alerts | Own centre's registered patients |
| **DOCTOR** | Access tele-review queue, inspect full-res images, sign diagnosis | District tele-review queue |
| **PATIENT** | Download own signed clinical referral report | Own screening record and PDF report only |
| **ADMIN** | User provisioning, view system audit logs, hospital config | System metrics and audit metadata |

### Insecure Direct Object Reference (IDOR) Protection
- All patient endpoints (`/api/patients/:id`) and screening endpoints (`/api/screenings/:id`) enforce contextual ownership checks in Express middleware.
- A user with role `PATIENT` cannot request or download another patient's medical records or fundus images.

---

## 4. Storage & Transport Security

- **Transport Encryption:** All production traffic between clients and backend microservices is encrypted using TLS 1.3 (HTTPS / WSS).
- **Filesystem Isolation:** Original retinal photographs are stored in `/app/uploads/{screeningId}/` on isolated container volumes. Direct URL access without a valid session token is forbidden.
- **PDF Report Tamper-Resistance:** Generated reports include a SHA-256 integrity hash rendered as a verification QR code. Any unauthorized alteration to the PDF invalidates the cryptographic checksum.
- **Ephemeral Inference Tensors:** The Python FastAPI service processes images in-memory and immediately frees raw tensor memory after prediction generation.

---

## 5. Security & Privacy Audit Checklist

- [x] `.env` files, production secrets, and database credentials excluded from Git via `.gitignore`.
- [x] Zero raw 12-digit Aadhaar numbers or biometrics stored in the database.
- [x] Passwords hashed using bcrypt (cost factor $\ge 10$) with unique salts.
- [x] Role-based route guards verified on every backend API endpoint.
- [x] File upload size limits ($25\text{ MB}$) and MIME-type validation enforced.
- [x] Path traversal protections (`../` filtering) active in `utils/storage.ts`.
- [x] Rate limiting active on authentication and inference gateways.
- [x] Immutable audit trail logging all clinical review actions (`AuditLog` table).
