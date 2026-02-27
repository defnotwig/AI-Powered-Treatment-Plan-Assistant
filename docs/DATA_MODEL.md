# Data Model Documentation

## Overview

Data models used in the AI-Powered Treatment Plan Assistant.

## Entity Relationship

Patient has many MedicalHistory, CurrentMedication, TreatmentPlan, and AuditLog records. Patient has one LifestyleFactors record. DrugInteraction, Contraindication, and DosageGuideline are standalone lookup tables.

## Core Models

### Patient

Fields: id (UUID PK), firstName, lastName, dateOfBirth, sex, weight (kg), height (cm), bmi (calculated), bloodPressureSystolic (60-250), bloodPressureDiastolic (40-150), heartRate (30-220), creatinine (0.1-15.0).

### MedicalHistory

Fields: id (UUID PK), patientId (FK), condition, severity (mild/moderate/severe), diagnosedDate, status (active/resolved/chronic).

### CurrentMedication

Fields: id (UUID PK), patientId (FK), drugName, dosage, frequency, route (oral/IV/IM/SC/topical/inhaled), startDate, prescribedBy.

### LifestyleFactors

Fields: id (UUID PK), patientId (FK), smokingStatus, smokingYears, alcoholConsumption, drinksPerWeek, exerciseFrequency, diet, chiefComplaint (max 2000 chars).

### TreatmentPlan

Fields: id (UUID PK), patientId (FK), riskScore (0-100), riskLevel, confidence (0-1.0), recommendations (JSON), flaggedIssues (JSON), alternatives (JSON), rationale (text), generatedAt.

### AuditLog

Fields: id (UUID PK), patientId (FK nullable), action, severity, details (JSON), userId, ipAddress, correlationId, createdAt.

## Lookup Tables

DrugInteraction: drug1, drug2, severity, description, recommendation. Contraindication: drug, condition, type (absolute/relative), description. DosageGuideline: drug, standardDose, maxDose, renalAdjustment, hepaticAdjustment, geriatricDose, pediatricDose.

## Validation

All models enforce validation at database constraints, Sequelize validators, API schema validation, and medical safety rule layers.
