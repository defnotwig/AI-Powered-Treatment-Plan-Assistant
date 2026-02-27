# 🏥 AI-Powered Treatment Plan Assistant

<!-- GitHub Shields (Dynamic) -->
[![CI](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/defnotwig/AI-Powered-Treatment-Plan-Assistant?style=flat-square&color=yellow)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/defnotwig/AI-Powered-Treatment-Plan-Assistant?style=flat-square&logo=github&label=Stars)](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/defnotwig/AI-Powered-Treatment-Plan-Assistant?style=flat-square&logo=github&label=Forks)](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/defnotwig/AI-Powered-Treatment-Plan-Assistant?style=flat-square&logo=github&label=Issues)](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/defnotwig/AI-Powered-Treatment-Plan-Assistant?style=flat-square&logo=github&label=PRs)](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant/pulls)
[![Last Commit](https://img.shields.io/github/last-commit/defnotwig/AI-Powered-Treatment-Plan-Assistant?style=flat-square&logo=git&logoColor=white&label=Last%20Commit)](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant/commits/master)
[![Repo Size](https://img.shields.io/github/repo-size/defnotwig/AI-Powered-Treatment-Plan-Assistant?style=flat-square&logo=github&label=Repo%20Size)](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant)
[![GitHub Contributors](https://img.shields.io/github/contributors/defnotwig/AI-Powered-Treatment-Plan-Assistant?style=flat-square&logo=github&label=Contributors)](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant/graphs/contributors)

<!-- Tech Stack Badges -->
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)

<!-- AI & ML Badges -->
[![OpenAI GPT-4o](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-ML-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)](https://tensorflow.org)

<!-- Database & Infrastructure -->
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?style=flat-square&logo=sequelize&logoColor=white)](https://sequelize.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](docker-compose.yml)

<!-- Testing & Quality -->
[![Vitest](https://img.shields.io/badge/Vitest-224%20tests-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)
[![Jest](https://img.shields.io/badge/Jest-3%20tests-C21325?style=flat-square&logo=jest&logoColor=white)](https://jestjs.io)
[![ESLint](https://img.shields.io/badge/ESLint-0%20errors-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org)
[![SonarQube](https://img.shields.io/badge/SonarQube-0%20issues-4E9BCD?style=flat-square&logo=sonarqube&logoColor=white)](https://sonarqube.org)

<!-- Security & Compliance -->
[![Security](https://img.shields.io/badge/Security-HIPAA%20Audit%20Logging-red?style=flat-square&logo=shieldsdotio&logoColor=white)](#-safety-features)
[![CVE](https://img.shields.io/badge/Docker%20CVEs-0-brightgreen?style=flat-square&logo=docker&logoColor=white)](#-architecture)
[![API](https://img.shields.io/badge/API-v1%20(Versioned)-blue?style=flat-square&logo=openapiinitiative&logoColor=white)](#-api-documentation)

<!-- Status -->
[![Status: Complete](https://img.shields.io/badge/Status-Complete-brightgreen?style=flat-square)](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square&logo=github)](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant/pulls)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)](https://github.com/defnotwig)

An advanced clinical decision support system that transforms patient intake data into **personalized, safety-checked treatment plans**. This AI-powered assistant helps doctors make faster, data-driven decisions while **aggressively flagging drug interactions, contraindications, and risk factors**.

> 🎯 **Safety > Everything**: The system is designed to flag high-risk cases aggressively. False positives are preferable to missed safety issues.

![Dashboard Preview](docs/dashboard-preview.png)

---

## 📋 Table of Contents

- [Features Overview](#-features-overview)
- [Bounty Checklist](#-bounty-checklist)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Safety Features](#-safety-features)
- [Demo Patients](#-demo-patients)
- [Testing](#-testing)
- [Advanced Features](#-advanced-features)

---

## ✨ Features Overview

### 🩺 Patient Intake Flow
Multi-step wizard capturing comprehensive patient data:

| Step | Data Captured | Implementation |
|------|---------------|----------------|
| **1. Demographics** | Age, sex, weight, height, BMI, vitals | `DemographicsStep.tsx` |
| **2. Medical History** | Conditions, allergies, surgeries, family history | `MedicalHistoryStep.tsx` |
| **3. Medications** | Drug name, dosage, frequency, route, prescriber | `MedicationsStep.tsx` |
| **4. Lifestyle** | Smoking, alcohol, exercise, diet, occupation | `LifestyleStep.tsx` |
| **5. Review** | Chief complaint, symptom duration, severity | `ReviewStep.tsx` |

### 🤖 AI-Powered Analysis
- **OpenAI GPT-4o Integration** with medical guidelines in system prompt
- **Drug-drug interaction checking** against 50+ interaction rules
- **Contraindication detection** based on patient conditions/allergies
- **Dosage appropriateness** validation with age/renal adjustments
- **Structured JSON output** with schema validation

### 📊 Clinical Decision Support Dashboard
- **Risk Score Card** - Visual 0-100 risk score with color coding
- **Flagged Issues Panel** - Critical risks shown first (red/orange/green indicators)
- **Treatment Plan Display** - Primary and alternative recommendations
- **Action Panel** - Approve / Modify / Reject workflows
- **Rationale Accordion** - "Why" behind each recommendation

### 🧠 Machine Learning (TensorFlow.js)
- Neural network-based risk prediction model
- 11 input features analyzed (age, BMI, conditions, medications, etc.)
- Real-time training with synthetic medical data
- Confidence scores per prediction

### 📈 Real-Time Analytics Dashboard
- Live patient statistics from database
- Safety Detection Rate metrics
- Audit Compliance tracking
- Risk distribution visualizations
- Treatment category breakdown

---

## ✅ Bounty Checklist

### Core Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **Working patient intake flow** | ✅ Complete | 5-step wizard in `PatientIntakeWizard.tsx` |
| **Medical history (conditions, allergies)** | ✅ Complete | `MedicalHistoryStep.tsx` with 500+ conditions |
| **Current medications (drug, dosage, frequency)** | ✅ Complete | `MedicationsStep.tsx` with 100+ drugs |
| **Health metrics (age, weight, BMI, BP)** | ✅ Complete | `DemographicsStep.tsx` with auto-BMI calc |
| **Lifestyle factors (smoking, alcohol, exercise)** | ✅ Complete | `LifestyleStep.tsx` with 70+ occupational hazards |
| **Primary complaint** | ✅ Complete | Chief complaint with duration/severity |
| **LLM Integration** | ✅ Complete | GPT-4o via `openai.service.ts` |
| **Drug-drug interactions** | ✅ Complete | 50+ rules + database validation |
| **Contraindication checking** | ✅ Complete | Condition-drug mapping + allergy check |
| **Dosage appropriateness** | ✅ Complete | Age/renal/hepatic adjustments |
| **Structured JSON output** | ✅ Complete | JSON schema validation via AJV |
| **Dashboard showing treatment plan** | ✅ Complete | `TreatmentDashboard.tsx` |
| **Safety risk indicator** | ✅ Complete | Color-coded LOW/MEDIUM/HIGH/CRITICAL |
| **Flagged issues list** | ✅ Complete | `FlaggedIssuesPanel.tsx` with severity |
| **Realistic demo patient** | ✅ Complete | 3 demo patients (High/Medium/Low risk) |

### Bonus Features

| Feature | Status | Implementation |
|---------|--------|----------------|
| **JSON Schema validation** | ✅ Complete | `validation.service.ts` with AJV |
| **Drug interaction database** | ✅ Complete | PostgreSQL models + in-memory fallback |
| **Multi-step wizard** | ✅ Complete | 5-step intake → AI → Review → Summary |
| **Confidence scores** | ✅ Complete | Per-recommendation + ML-based |
| **Alternative treatments** | ✅ Complete | 2-3 alternatives per plan |
| **Audit logging** | ✅ Complete | Full HIPAA-style logging in `AuditLog` |

### Extra Features (Beyond Requirements)

| Feature | Status | Implementation |
|---------|--------|----------------|
| **TensorFlow.js ML Model** | ✅ Complete | `ml-risk-predictor.ts` |
| **PDF Report Generation** | ✅ Complete | `pdf-generator.ts` with jsPDF |
| **Real-time Analytics** | ✅ Complete | `AnalyticsDashboard.tsx` |
| **Patient Search & Records** | ✅ Complete | `PatientSearch.tsx` |
| **Provider Notes** | ✅ Complete | `ProviderNotesPanel.tsx` |
| **Follow-up Scheduler** | ✅ Complete | `FollowUpScheduler.tsx` |
| **Renal Dosing Calculator** | ✅ Complete | `dosing-calculator.ts` |
| **1000+ Patient Seeder** | ✅ Complete | `demo-seeder.ts` |
| **Cross-Validation Service** | ✅ Complete | `cross-validation.service.ts` |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   React 18  │  │ TensorFlow  │  │   Recharts  │  │    jsPDF    │     │
│  │   + Vite    │  │     .js     │  │             │  │             │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │                │             │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐     │
│  │                      Application Layer                         │     │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐│     │
│  │  │ Patient Intake  │  │    Treatment    │  │    Analytics     ││     │
│  │  │     Wizard      │  │    Dashboard    │  │    Dashboard     ││     │
│  │  └─────────────────┘  └─────────────────┘  └──────────────────┘│     │
│  └────────────────────────────────┬───────────────────────────────┘     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │ REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Express   │  │   OpenAI    │  │  Sequelize  │  │  Validation │     │
│  │   Server    │  │   GPT-4o    │  │     ORM     │  │   (AJV)     │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │                │             │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐     │
│  │                      Service Layer                             │     │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐│     │
│  │  │  OpenAI Service │  │ Cross-Validation│  │  Demo Storage    ││     │
│  │  │  (AI Analysis)  │  │    Service      │  │   Service        ││     │
│  │  └─────────────────┘  └─────────────────┘  └──────────────────┘│     │
│  └────────────────────────────────┬───────────────────────────────┘     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                 │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                      PostgreSQL / SQLite                        │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │     │
│  │  │ Patients │ │ Medical  │ │Treatment │ │  Audit   │           │     │
│  │  │          │ │ History  │ │  Plans   │ │   Logs   │           │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                         │     │
│  │  │   Drug   │ │Contra-   │ │ Dosage   │                         │     │
│  │  │Interact. │ │indications│ │Guidelines│                        │     │
│  │  └──────────┘ └──────────┘ └──────────┘                         │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| TypeScript | 5.5.3 | Type Safety |
| Tailwind CSS | 3.4.0 | Styling |
| Vite | 5.4.2 | Build Tool |
| TensorFlow.js | 4.22.0 | ML Risk Prediction |
| Recharts | 2.15.4 | Data Visualization |
| jsPDF | 3.0.4 | PDF Generation |
| Lucide React | 0.294.0 | Icons |
| Axios | 1.6.2 | HTTP Client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 4.18.2 | Web Framework |
| TypeScript | 5.3.3 | Type Safety |
| OpenAI SDK | 4.24.1 | GPT-4o Integration |
| Sequelize | 6.35.2 | ORM |
| PostgreSQL | 15.x | Database |
| AJV | 8.12.0 | JSON Schema Validation |
| Helmet | 7.1.0 | Security Headers |
| Winston | 3.11.0 | Logging |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or use demo mode with SQLite)
- OpenAI API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/ai-treatment-plan-assistant.git
cd ai-treatment-plan-assistant/APTP

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### Environment Setup

Create `Backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (set to demo mode if no PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=treatment_plan
DB_USER=postgres
DB_PASSWORD=your_password_here

# OpenAI API
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.3

# Demo Mode (true if DB not configured)
DEMO_MODE=false
```

### Running the Application

```bash
# Terminal 1: Start Backend
cd Backend
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Start Frontend
cd Frontend
npm run dev
# App runs on http://localhost:3000
```

### Seeding Data

```bash
# Seed drug interaction database
npm run db:seedx`

# Seed 1000+ demo patients (demo mode)
# This happens automatically on server start if DEMO_MODE=true
```

---

## 📡 API Documentation

### Endpoints

#### Patient Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/patients` | Create new patient |
| `GET` | `/api/patients` | Get all patients |
| `GET` | `/api/patients/:id` | Get patient by ID |
| `DELETE` | `/api/patients/:id` | Delete patient |
| `GET` | `/api/patients/search` | Search patients |
| `GET` | `/api/patients/statistics` | Get basic statistics |
| `GET` | `/api/patients/analytics` | Get comprehensive analytics |

#### Treatment Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/treatment-plans/analyze` | Generate AI treatment plan |
| `GET` | `/api/treatment-plans/:id` | Get treatment plan |
| `PUT` | `/api/treatment-plans/:id/approve` | Approve plan |
| `PUT` | `/api/treatment-plans/:id/reject` | Reject plan |
| `PUT` | `/api/treatment-plans/:id/modify` | Modify plan |

#### Drug Database

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/drug-database/interactions` | Get all interactions |
| `GET` | `/api/drug-database/contraindications` | Get contraindications |
| `GET` | `/api/drug-database/dosage-guidelines` | Get dosage guidelines |

#### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/audit-logs` | Get all audit logs |
| `GET` | `/api/audit-logs/patient/:patientId` | Get logs by patient |

### Request/Response Examples

#### Generate Treatment Plan

**Request:**
```json
POST /api/treatment-plans/analyze
{
  "demographics": {
    "age": 72,
    "sex": "male",
    "weight": 85,
    "height": 170,
    "bloodPressure": { "systolic": 145, "diastolic": 92 }
  },
  "medicalHistory": {
    "conditions": [
      { "condition": "Coronary Artery Disease", "severity": "severe" }
    ],
    "allergies": [
      { "allergen": "Sulfa drugs", "severity": "severe" }
    ]
  },
  "currentMedications": {
    "medications": [
      { "drugName": "Nitroglycerin", "dosage": "0.4mg", "frequency": "PRN" }
    ]
  },
  "lifestyleFactors": {
    "chiefComplaint": "Erectile dysfunction",
    "smokingStatus": "former"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "treatmentPlan": {
      "recommendations": [
        {
          "drugName": "Vacuum Erection Device",
          "type": "device",
          "dosage": "As needed",
          "priority": "primary",
          "rationale": "Safe option for ED without drug interactions"
        }
      ],
      "safeAlternatives": [
        {
          "name": "Alprostadil",
          "dosage": "10-20mcg",
          "route": "intracavernosal"
        }
      ]
    },
    "riskAssessment": {
      "overallRisk": "CRITICAL",
      "riskScore": 95,
      "confidenceScore": 90
    },
    "flaggedIssues": [
      {
        "type": "contraindication",
        "severity": "critical",
        "title": "⛔ ABSOLUTE CONTRAINDICATION - PDE5 Inhibitors with Nitrates",
        "description": "Patient is on nitroglycerin. ALL PDE5 inhibitors are ABSOLUTELY CONTRAINDICATED.",
        "recommendation": "DO NOT prescribe Sildenafil, Tadalafil, or Vardenafil"
      }
    ],
    "aiEnabled": true,
    "criticalSafetyAlert": true
  }
}
```

---

## 🗄 Database Schema

### Core Tables

```sql
-- Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY,
    age INTEGER NOT NULL,
    sex VARCHAR(10),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    bmi DECIMAL(4,1),
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    heart_rate INTEGER,
    temperature DECIMAL(4,1),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Medical History
CREATE TABLE medical_histories (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    conditions JSONB,      -- Array of condition objects
    allergies JSONB,       -- Array of allergy objects
    past_surgeries JSONB,  -- Array of surgery objects
    family_history TEXT[]
);

-- Current Medications
CREATE TABLE current_medications (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    drug_name VARCHAR(255),
    generic_name VARCHAR(255),
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    route VARCHAR(50),
    prescribed_by VARCHAR(255)
);

-- Treatment Plans
CREATE TABLE treatment_plans (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    status VARCHAR(20) DEFAULT 'pending',
    overall_risk VARCHAR(20),
    risk_score INTEGER,
    confidence_score INTEGER,
    recommendations JSONB,
    flagged_issues JSONB,
    ai_response JSONB,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    user_id VARCHAR(255),
    user_name VARCHAR(255),
    action VARCHAR(50),  -- created, approved, modified, rejected, viewed
    patient_id UUID,
    treatment_plan_id UUID,
    changes JSONB,
    reason TEXT,
    risk_level VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Drug Interactions
CREATE TABLE drug_interactions (
    id SERIAL PRIMARY KEY,
    drug1 VARCHAR(255),
    drug2 VARCHAR(255),
    severity VARCHAR(20),  -- major, moderate, minor
    effect TEXT,
    management TEXT
);

-- Contraindications
CREATE TABLE contraindications (
    id SERIAL PRIMARY KEY,
    drug VARCHAR(255),
    condition VARCHAR(255),
    type VARCHAR(20),  -- absolute, relative
    reason TEXT,
    alternatives TEXT[]
);
```

---

## 🛡 Safety Features

### Pre-Analysis Safety Check

The system performs a **critical safety check BEFORE** AI analysis:

```typescript
// openai.service.ts - Pre-analysis check
const CRITICAL_CONTRAINDICATIONS = [
  {
    medications: ['sildenafil', 'tadalafil', 'vardenafil', 'avanafil'],
    contraindicatedWith: ['nitroglycerin', 'isosorbide', 'nitrate'],
    reason: 'ABSOLUTE CONTRAINDICATION - Severe hypotension',
    alternatives: ['Vacuum devices', 'Alprostadil']
  }
];
```

### Risk Scoring Logic

| Factor | Points Added | Threshold |
|--------|-------------|-----------|
| Age > 65 | +20 | Geriatric dosing |
| Multiple conditions (3+) | +15 | Complexity alert |
| Polypharmacy (5+ drugs) | +20 | Interaction risk |
| Known allergies | +10 | Allergy check |
| Drug interaction found | +25 | Major interaction |
| Contraindication found | +35 | Stop alert |

### Risk Levels

| Level | Score Range | Color | Action |
|-------|------------|-------|--------|
| LOW | 0-30 | 🟢 Green | Proceed with standard care |
| MEDIUM | 31-60 | 🟡 Yellow | Review with caution |
| HIGH | 61-80 | 🟠 Orange | Specialist consultation |
| CRITICAL | 81-100 | 🔴 Red | Do not proceed without override |

### Safety Override Mechanism

When a critical contraindication is detected, the system:
1. **Automatically upgrades** risk level to CRITICAL
2. **Displays prominent warning banner**
3. **Suggests safe alternatives only**
4. **Requires explicit acknowledgment** to proceed
5. **Logs override in audit trail**

---

## 👥 Demo Patients

### High-Risk Patient (ED + Nitrates)
- **Age:** 72, Male
- **Conditions:** CAD, Hypertension, Type 2 Diabetes, CKD Stage 3
- **Medications:** Nitroglycerin, Metformin, Lisinopril, Atorvastatin
- **Chief Complaint:** Erectile dysfunction
- **Expected Result:** ⛔ CRITICAL - PDE5 inhibitors contraindicated

### Medium-Risk Patient (Hair Loss)
- **Age:** 45, Male
- **Conditions:** Hyperlipidemia
- **Medications:** Simvastatin
- **Chief Complaint:** Male pattern baldness
- **Expected Result:** 🟡 MEDIUM - Finasteride with monitoring

### Low-Risk Patient (Weight Management)
- **Age:** 32, Female
- **Conditions:** None
- **Medications:** None
- **Chief Complaint:** Weight management
- **Expected Result:** 🟢 LOW - Lifestyle modifications

---

## 🧪 Testing

### Running Tests

```bash
# Backend unit tests
cd Backend
npm test

# AI Validation Script
npm run validate:ai

# Frontend lint
cd Frontend
npm run lint
```

### AI Validation Script

The `validate-ai.ts` script performs comprehensive testing:

```bash
npm run validate:ai

# Output:
✅ OpenAI Connection: PASSED
✅ GPT-4o Model: AVAILABLE
✅ High-Risk Detection: PASSED
✅ Contraindication Flagging: PASSED
✅ JSON Schema Validation: PASSED
✅ Safety Override: PASSED
```

### Manual Testing Checklist

- [ ] Load high-risk demo patient
- [ ] Navigate through all wizard steps
- [ ] Submit for AI analysis
- [ ] Verify CRITICAL risk score displayed
- [ ] Verify contraindication banner shown
- [ ] Test Approve/Modify/Reject actions
- [ ] Download PDF report
- [ ] Check audit log entries

---

## 🚀 Advanced Features

### TensorFlow.js ML Model

```typescript
// ml-risk-predictor.ts
const model = tf.sequential({
  layers: [
    tf.layers.dense({ units: 64, activation: 'relu', inputShape: [11] }),
    tf.layers.dropout({ rate: 0.3 }),
    tf.layers.dense({ units: 32, activation: 'relu' }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 1, activation: 'sigmoid' })
  ]
});

// Features: [age, bmi, systolicBP, diastolicBP, heartRate, 
//            numConditions, numAllergies, numMedications, 
//            smokingScore, alcoholScore, exerciseScore]
```

### Renal Dosing Calculator

```typescript
// dosing-calculator.ts
function calculateRenalAdjustment(
  creatinine: number,
  age: number,
  weight: number,
  sex: 'male' | 'female'
): DosageAdjustment {
  // Cockcroft-Gault equation for CrCl
  const crCl = ((140 - age) * weight * (sex === 'female' ? 0.85 : 1)) / 
               (72 * creatinine);
  
  if (crCl < 30) return { adjustment: 0.25, reason: 'Severe renal impairment' };
  if (crCl < 60) return { adjustment: 0.50, reason: 'Moderate renal impairment' };
  return { adjustment: 1.0, reason: 'No adjustment needed' };
}
```

### PDF Report Generation

```typescript
// pdf-generator.ts
export function generateTreatmentPlanPDF(
  patient: PatientInfo,
  plan: TreatmentPlanData
): void {
  const doc = new jsPDF();
  
  // Header with branding
  doc.addImage(logo, 'PNG', 10, 10, 30, 30);
  doc.setFontSize(20);
  doc.text('Clinical Treatment Plan', 50, 25);
  
  // Risk Score with color coding
  const riskColor = getRiskColor(plan.riskAssessment.overallRisk);
  doc.setFillColor(...riskColor);
  doc.rect(10, 50, 190, 20, 'F');
  doc.text(`Risk Level: ${plan.riskAssessment.overallRisk}`, 15, 63);
  
  // ... detailed sections for medications, issues, rationale
  
  doc.save(`treatment-plan-${patient.patientId}.pdf`);
}
```

### Real-Time Analytics API

```typescript
// patient.controller.ts
export const getComprehensiveAnalytics = async (req, res) => {
  const analytics = demoStorage.getComprehensiveAnalytics();
  
  return res.json({
    success: true,
    data: {
      totalPatients: analytics.totalPatients,
      totalTreatmentPlans: analytics.totalTreatmentPlans,
      avgRiskScore: analytics.avgRiskScore,
      safetyDetectionRate: analytics.safetyDetectionRate,  // Real calculation
      auditComplianceRate: analytics.auditComplianceRate,  // Real calculation
      riskDistribution: analytics.riskDistribution,
      monthlyTrends: analytics.monthlyTrends,
      topDrugInteractions: analytics.topDrugInteractions,
      // ... more metrics
    },
    timestamp: new Date().toISOString()
  });
};
```

---

## 📁 Project Structure

```
APTP/
├── Backend/
│   ├── src/
│   │   ├── config/          # Database & app configuration
│   │   ├── controllers/     # API request handlers
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # Express routes
│   │   ├── seeds/           # Database seeders
│   │   ├── services/        # Business logic
│   │   │   ├── openai.service.ts        # GPT-4o integration
│   │   │   ├── validation.service.ts    # JSON schema validation
│   │   │   ├── cross-validation.service.ts  # DB cross-check
│   │   │   └── demo-storage.service.ts  # In-memory demo storage
│   │   ├── scripts/         # Utility scripts
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/   # Treatment dashboard components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   └── wizard/      # Patient intake wizard steps
│   │   ├── context/         # React Context (AppContext)
│   │   ├── data/            # Static data (medical-data.ts)
│   │   ├── services/        # Frontend services
│   │   │   ├── api.ts               # API client
│   │   │   ├── ml-risk-predictor.ts # TensorFlow.js ML
│   │   │   ├── pdf-generator.ts     # PDF reports
│   │   │   └── dosing-calculator.ts # Renal dosing
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── docs/                    # Documentation
└── agents/                  # AI agent instructions
```

---

## 📜 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- OpenAI for GPT-4o API
- TensorFlow.js team for browser-based ML
- Medical guidelines from FDA drug interaction databases
- React and Express.js communities

---

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for safer clinical decision-making**

