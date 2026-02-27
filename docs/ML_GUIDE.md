# Machine Learning Guide

## Overview

The AI-Powered Treatment Plan Assistant uses TensorFlow.js for client-side machine learning inference and training.

## ML Pipeline

### Data Flow

Patient Data -> Feature Engineering -> Model Inference -> Risk Score -> Ensemble Scoring

### Feature Engineering

Patient features are extracted and normalized:

- Demographics: Age (normalized 0-1), weight, BMI, sex (one-hot)
- Medical History: Condition count, severity scores, allergy count
- Medications: Drug count, interaction risk score, polypharmacy flag
- Lifestyle: Smoking status, alcohol consumption, exercise frequency

### Model Architecture

Input Layer (12 features) -> Dense(64, ReLU) -> Dropout(0.3) -> Dense(32, ReLU) -> Dropout(0.2) -> Dense(16, ReLU) -> Output(1, Sigmoid)

## Training

### Adaptive Learning

The system implements adaptive learning where new treatment outcomes are collected as training samples. The model is periodically retrained with accumulated data. Performance metrics are tracked over time and concept drift detection triggers retraining.

## Ensemble Risk Scoring

Final risk scores combine multiple signals:

- Rule-based (40%): Deterministic safety rules
- ML Model (35%): TensorFlow.js prediction
- NLP Analysis (25%): Chief complaint analysis

## Drug Interaction Prediction

The ML-based drug interaction predictor encodes drug pairs as feature vectors, uses a classification model for severity prediction, provides confidence scores, and falls back to rule-based system if confidence is below 70%.

## Model Versioning

Models are versioned with timestamps. Previous versions are retained for rollback. A/B testing support for model comparison is available.
