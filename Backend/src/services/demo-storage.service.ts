/**
 * Demo Storage Service
 * Provides in-memory storage for demo mode with pre-seeded data
 * Persists data during server runtime (resets on restart)
 */

import { v4 as uuidv4 } from 'uuid';
import { FrontendTreatmentResponse, DemoCompletePatientData, DemoPatientSummary, TreatmentPlanResponse } from '../types';

// ==================== INTERFACES ====================

export interface DemoPatient {
    id: string;
    patientId: string;
    age: number;
    sex: 'male' | 'female' | 'other';
    weight: number;
    height: number;
    bmi: number;
    systolicBp: number;
    diastolicBp: number;
    heartRate: number;
    temperature: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface DemoMedicalHistory {
    id: string;
    patientId: string;
    conditions: Array<{ condition: string; diagnosisDate: string; severity: string; controlled: boolean }>;
    allergies: Array<{ allergen: string; reaction: string; severity: string }>;
    pastSurgeries: Array<{ procedure: string; date: string }>;
    familyHistory: string[];
}

export interface DemoMedication {
    id: string;
    patientId: string;
    drugName: string;
    genericName: string;
    dosage: string;
    frequency: string;
    route: string;
    startDate: string;
    prescribedBy: string;
}

export interface DemoLifestyle {
    id: string;
    patientId: string;
    smokingStatus: string;
    smokingPacksPerDay?: number;
    smokingYears?: number;
    alcoholFrequency: string;
    alcoholDrinksPerWeek?: number;
    exerciseFrequency: string;
    exerciseMinutesPerWeek?: number;
    diet: string;
    chiefComplaint: string;
    symptomDuration?: string;
}

export interface DemoTreatmentPlan {
    id: string;
    patientId: string;
    treatmentData: FrontendTreatmentResponse | TreatmentPlanResponse;
    overallRisk: string;
    riskScore: number;
    confidenceScore: number;
    status: 'pending' | 'approved' | 'rejected' | 'modified';
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    modifications?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface DemoAuditLog {
    id: string;
    timestamp: Date;
    userId: string;
    userName: string;
    action: string;
    patientId?: string;
    treatmentPlanId?: string;
    riskLevel?: string;
    changes?: Record<string, unknown>;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
}

// ==================== STORAGE MAPS ====================

class DemoStorageService {
    private readonly patients: Map<string, DemoPatient> = new Map();
    private readonly medicalHistories: Map<string, DemoMedicalHistory> = new Map();
    private readonly medications: Map<string, DemoMedication[]> = new Map();
    private readonly lifestyles: Map<string, DemoLifestyle> = new Map();
    private readonly treatmentPlans: Map<string, DemoTreatmentPlan> = new Map();
    private readonly auditLogs: Map<string, DemoAuditLog> = new Map();

    private patientIdCounter = 1;
    private planIdCounter = 1;
    private initialized = false;

    // ==================== PATIENT METHODS ====================

    createPatient(data: Omit<DemoPatient, 'id' | 'createdAt' | 'updatedAt'>): DemoPatient {
        const id = data.patientId || `demo-patient-${this.patientIdCounter++}`;
        const now = new Date();
        const patient: DemoPatient = {
            ...data,
            id,
            patientId: data.patientId || id,
            createdAt: now,
            updatedAt: now,
        };
        this.patients.set(id, patient);
        return patient;
    }

    getPatient(id: string): DemoPatient | undefined {
        return this.patients.get(id);
    }

    getAllPatients(): DemoPatient[] {
        return Array.from(this.patients.values()).sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
    }

    getPatientCount(): number {
        return this.patients.size;
    }

    deletePatient(id: string): boolean {
        this.medicalHistories.delete(id);
        this.medications.delete(id);
        this.lifestyles.delete(id);
        // Delete associated treatment plans
        for (const [planId, plan] of this.treatmentPlans.entries()) {
            if (plan.patientId === id) {
                this.treatmentPlans.delete(planId);
            }
        }
        return this.patients.delete(id);
    }

    // ==================== MEDICAL HISTORY METHODS ====================

    createMedicalHistory(data: Omit<DemoMedicalHistory, 'id'>): DemoMedicalHistory {
        const history: DemoMedicalHistory = {
            ...data,
            id: uuidv4(),
        };
        this.medicalHistories.set(data.patientId, history);
        return history;
    }

    getMedicalHistory(patientId: string): DemoMedicalHistory | undefined {
        return this.medicalHistories.get(patientId);
    }

    // ==================== MEDICATION METHODS ====================

    addMedication(patientId: string, data: Omit<DemoMedication, 'id' | 'patientId'>): DemoMedication {
        const medication: DemoMedication = {
            ...data,
            id: uuidv4(),
            patientId,
        };
        const existing = this.medications.get(patientId) || [];
        existing.push(medication);
        this.medications.set(patientId, existing);
        return medication;
    }

    getMedications(patientId: string): DemoMedication[] {
        return this.medications.get(patientId) || [];
    }

    setMedications(patientId: string, meds: DemoMedication[]): void {
        this.medications.set(patientId, meds);
    }

    // ==================== LIFESTYLE METHODS ====================

    createLifestyle(data: Omit<DemoLifestyle, 'id'>): DemoLifestyle {
        const lifestyle: DemoLifestyle = {
            ...data,
            id: uuidv4(),
        };
        this.lifestyles.set(data.patientId, lifestyle);
        return lifestyle;
    }

    getLifestyle(patientId: string): DemoLifestyle | undefined {
        return this.lifestyles.get(patientId);
    }

    // ==================== TREATMENT PLAN METHODS ====================

    createTreatmentPlan(data: Omit<DemoTreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>): DemoTreatmentPlan {
        const id = `demo-plan-${this.planIdCounter++}`;
        const now = new Date();
        const plan: DemoTreatmentPlan = {
            ...data,
            id,
            createdAt: now,
            updatedAt: now,
        };
        this.treatmentPlans.set(id, plan);
        return plan;
    }

    getTreatmentPlan(id: string): DemoTreatmentPlan | undefined {
        return this.treatmentPlans.get(id);
    }

    getTreatmentPlanByPatientId(patientId: string): DemoTreatmentPlan | undefined {
        for (const plan of this.treatmentPlans.values()) {
            if (plan.patientId === patientId) {
                return plan;
            }
        }
        return undefined;
    }

    getPatientTreatmentPlans(patientId: string): DemoTreatmentPlan[] {
        return Array.from(this.treatmentPlans.values())
            .filter(plan => plan.patientId === patientId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    getAllTreatmentPlans(): DemoTreatmentPlan[] {
        return Array.from(this.treatmentPlans.values()).sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
    }

    updateTreatmentPlan(id: string, updates: Partial<DemoTreatmentPlan>): DemoTreatmentPlan | undefined {
        const plan = this.treatmentPlans.get(id);
        if (!plan) return undefined;

        const updated: DemoTreatmentPlan = {
            ...plan,
            ...updates,
            updatedAt: new Date(),
        };
        this.treatmentPlans.set(id, updated);
        return updated;
    }

    // ==================== AUDIT LOG METHODS ====================

    createAuditLog(data: Omit<DemoAuditLog, 'id'>): DemoAuditLog {
        const log: DemoAuditLog = {
            ...data,
            id: uuidv4(),
        };
        this.auditLogs.set(log.id, log);
        return log;
    }

    getAuditLogs(patientId?: string): DemoAuditLog[] {
        const logs = Array.from(this.auditLogs.values());
        if (patientId) {
            return logs.filter(log => log.patientId === patientId)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        }
        return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // ==================== COMPLETE PATIENT DATA ====================

    getCompletePatientData(patientId: string): DemoCompletePatientData | null {
        const patient = this.patients.get(patientId);
        if (!patient) return null;

        return {
            ...patient,
            medicalHistory: this.medicalHistories.get(patientId),
            currentMedications: this.medications.get(patientId) || [],
            lifestyleFactors: this.lifestyles.get(patientId),
            treatmentPlans: this.getPatientTreatmentPlans(patientId),
        };
    }

    getAllPatientsWithData(): DemoPatientSummary[] {
        return this.getAllPatients().map(patient => ({
            ...patient,
            medicalHistory: this.medicalHistories.get(patient.id),
            lifestyleFactors: this.lifestyles.get(patient.id),
            medicationCount: (this.medications.get(patient.id) || []).length,
            treatmentPlanCount: this.getPatientTreatmentPlans(patient.id).length,
        }));
    }

    // ==================== INITIALIZATION ====================

    isInitialized(): boolean {
        return this.initialized;
    }

    setInitialized(value: boolean): void {
        this.initialized = value;
    }

    // ==================== STATISTICS ====================

    getStatistics(): {
        totalPatients: number;
        totalTreatmentPlans: number;
        riskDistribution: Record<string, number>;
        statusDistribution: Record<string, number>;
    } {
        const plans = Array.from(this.treatmentPlans.values());

        const riskDistribution: Record<string, number> = {
            low: 0,
            moderate: 0,
            high: 0,
            critical: 0,
        };

        const statusDistribution: Record<string, number> = {
            pending: 0,
            approved: 0,
            rejected: 0,
            modified: 0,
        };

        for (const plan of plans) {
            const risk = plan.overallRisk?.toLowerCase() || 'low';
            if (risk in riskDistribution) {
                riskDistribution[risk]++;
            }

            const status = plan.status || 'pending';
            if (status in statusDistribution) {
                statusDistribution[status]++;
            }
        }

        return {
            totalPatients: this.patients.size,
            totalTreatmentPlans: this.treatmentPlans.size,
            riskDistribution,
            statusDistribution,
        };
    }

    // ==================== ANALYTICS HELPERS ====================

    private calculateRiskMetrics(plans: DemoTreatmentPlan[]) {
        const riskCounts = { low: 0, moderate: 0, high: 0, critical: 0 };
        let totalRiskScore = 0;
        let totalConfidence = 0;
        let criticalAlerts = 0;

        for (const plan of plans) {
            const risk = plan.overallRisk?.toLowerCase() || 'low';
            if (risk in riskCounts) {
                riskCounts[risk as keyof typeof riskCounts]++;
            }
            totalRiskScore += plan.riskScore || 0;
            totalConfidence += plan.confidenceScore || 80;
            if (risk === 'critical' || risk === 'high') {
                criticalAlerts++;
            }
        }

        const totalPlans = plans.length || 1;
        return { riskCounts, totalRiskScore: totalRiskScore / totalPlans, totalConfidence: totalConfidence / totalPlans, criticalAlerts, totalPlans };
    }

    private calculateAgeDistribution(patients: DemoPatient[]) {
        const ageRanges = [
            { range: '0-17', min: 0, max: 17, count: 0 },
            { range: '18-34', min: 18, max: 34, count: 0 },
            { range: '35-49', min: 35, max: 49, count: 0 },
            { range: '50-64', min: 50, max: 64, count: 0 },
            { range: '65-79', min: 65, max: 79, count: 0 },
            { range: '80+', min: 80, max: 150, count: 0 },
        ];
        for (const patient of patients) {
            for (const range of ageRanges) {
                if (patient.age >= range.min && patient.age <= range.max) {
                    range.count++;
                    break;
                }
            }
        }
        return ageRanges.map(r => ({ range: r.range, count: r.count }));
    }

    private calculateSexDistribution(patients: DemoPatient[]) {
        const sexCounts: Record<string, number> = { male: 0, female: 0, other: 0 };
        for (const patient of patients) {
            const sex = patient.sex?.toLowerCase() || 'other';
            if (sex in sexCounts) {
                sexCounts[sex]++;
            }
        }
        return Object.entries(sexCounts).map(([sex, count]) => ({ sex, count }));
    }

    private calculateConditionFrequency() {
        const conditionCounts: Record<string, number> = {};
        for (const patientId of this.medicalHistories.keys()) {
            const history = this.medicalHistories.get(patientId);
            if (history?.conditions) {
                for (const cond of history.conditions) {
                    const condName = cond.condition || 'Unknown';
                    conditionCounts[condName] = (conditionCounts[condName] || 0) + 1;
                }
            }
        }
        return Object.entries(conditionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([condition, count]) => ({ condition, count }));
    }

    private calculateMedicationFrequency() {
        const medCounts: Record<string, number> = {};
        for (const meds of this.medications.values()) {
            for (const med of meds) {
                const medName = med.drugName || 'Unknown';
                medCounts[medName] = (medCounts[medName] || 0) + 1;
            }
        }
        return Object.entries(medCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([medication, count]) => ({ medication, count }));
    }

    private calculateMonthlyTrends(patientCount: number) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData: Record<string, { patients: number; plans: number }> = {};
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            monthlyData[months[date.getMonth()]] = { patients: 0, plans: 0 };
        }
        const monthKeys = Object.keys(monthlyData);
        monthKeys.forEach((month, idx) => {
            const baseCount = Math.floor(patientCount / 6);
            const variance = Math.floor(Math.random() * (baseCount * 0.3));
            monthlyData[month].patients = baseCount + variance + (idx * Math.floor(baseCount * 0.1));
            monthlyData[month].plans = Math.floor(monthlyData[month].patients * 0.85);
        });
        return monthKeys.map(month => ({ month, patients: monthlyData[month].patients, plans: monthlyData[month].plans }));
    }

    private categorizeTreatments() {
        const categoryMapping: Record<string, string> = {
            'heart': 'Cardiovascular', 'cardiac': 'Cardiovascular', 'chest pain': 'Cardiovascular',
            'hypertension': 'Cardiovascular', 'blood pressure': 'Cardiovascular',
            'diabetes': 'Metabolic', 'weight': 'Metabolic', 'thyroid': 'Metabolic',
            'depression': 'Psychiatric', 'anxiety': 'Psychiatric', 'mental': 'Psychiatric', 'insomnia': 'Psychiatric',
            'breathing': 'Respiratory', 'asthma': 'Respiratory', 'copd': 'Respiratory', 'cough': 'Respiratory',
            'pain': 'Musculoskeletal', 'arthritis': 'Musculoskeletal', 'back': 'Musculoskeletal', 'joint': 'Musculoskeletal',
            'skin': 'Dermatology', 'rash': 'Dermatology',
            'erectile': 'Urology', 'urinary': 'Urology',
        };
        const categoryCounts: Record<string, number> = {};
        for (const lifestyle of this.lifestyles.values()) {
            const complaint = (lifestyle.chiefComplaint || '').toLowerCase();
            let category = 'General';
            for (const [keyword, cat] of Object.entries(categoryMapping)) {
                if (complaint.includes(keyword)) {
                    category = cat;
                    break;
                }
            }
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
        return Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => ({ category, count }));
    }

    // ==================== COMPREHENSIVE ANALYTICS ====================

    getComprehensiveAnalytics() {
        const patients = Array.from(this.patients.values());
        const plans = Array.from(this.treatmentPlans.values());
        const auditLogs = Array.from(this.auditLogs.values());

        const riskMetrics = this.calculateRiskMetrics(plans);
        const { riskCounts, totalRiskScore: avgRiskScore, totalConfidence: avgConfidence, criticalAlerts, totalPlans } = riskMetrics;

        // Status distribution
        const statusDist: Record<string, number> = { pending: 0, approved: 0, rejected: 0, modified: 0 };
        for (const plan of plans) {
            const status = plan.status || 'pending';
            if (status in statusDist) {
                statusDist[status]++;
            }
        }

        // Safety & audit metrics
        const highRiskPlans = riskCounts.high + riskCounts.critical;
        const safetyDetectionRate = plans.length > 0 
            ? Math.min(98, 85 + (highRiskPlans / plans.length) * 15)
            : 95;

        const totalActions = plans.length + patients.length;
        const auditComplianceRate = totalActions > 0 
            ? Math.min(100, Math.round((auditLogs.length / Math.max(1, totalActions / 2)) * 100))
            : 100;

        // Drug interactions (simulated)
        const interactionPatterns = [
            { interaction: 'Warfarin + NSAIDs', severity: 'major' },
            { interaction: 'ACE-I + K+ Supplements', severity: 'moderate' },
            { interaction: 'Sildenafil + Nitrates', severity: 'major' },
            { interaction: 'Metformin + Contrast', severity: 'major' },
            { interaction: 'Statins + Grapefruit', severity: 'minor' },
            { interaction: 'SSRIs + MAOIs', severity: 'major' },
            { interaction: 'Beta-blockers + Calcium Channel Blockers', severity: 'moderate' },
        ];
        const topDrugInteractions = interactionPatterns.map((p, i) => ({
            ...p,
            count: Math.max(1, Math.floor(criticalAlerts / (i + 1))),
        }));

        return {
            totalPatients: patients.length,
            totalTreatmentPlans: plans.length,
            avgRiskScore: Math.round(avgRiskScore * 10) / 10,
            avgConfidenceScore: Math.round(avgConfidence * 10) / 10,
            riskDistribution: [
                { name: 'Low Risk', value: Math.round((riskCounts.low / Math.max(1, totalPlans)) * 100), color: '#10B981', count: riskCounts.low },
                { name: 'Medium Risk', value: Math.round((riskCounts.moderate / Math.max(1, totalPlans)) * 100), color: '#F59E0B', count: riskCounts.moderate },
                { name: 'High Risk', value: Math.round((riskCounts.high / Math.max(1, totalPlans)) * 100), color: '#F97316', count: riskCounts.high },
                { name: 'Critical', value: Math.round((riskCounts.critical / Math.max(1, totalPlans)) * 100), color: '#EF4444', count: riskCounts.critical },
            ],
            statusDistribution: statusDist,
            safetyDetectionRate: Math.round(safetyDetectionRate * 10) / 10,
            auditComplianceRate: Math.round(auditComplianceRate * 10) / 10,
            criticalAlertsDetected: criticalAlerts,
            drugInteractionsDetected: topDrugInteractions.reduce((sum, i) => sum + i.count, 0),
            avgResponseTime: 5.8,
            patientsByAge: this.calculateAgeDistribution(patients),
            patientsBySex: this.calculateSexDistribution(patients),
            conditionsFrequency: this.calculateConditionFrequency(),
            medicationsFrequency: this.calculateMedicationFrequency(),
            monthlyTrends: this.calculateMonthlyTrends(patients.length),
            topDrugInteractions,
            treatmentCategories: this.categorizeTreatments(),
        };
    }
    // ==================== CLEAR ALL DATA ====================

    clearAll(): void {
        this.patients.clear();
        this.medicalHistories.clear();
        this.medications.clear();
        this.lifestyles.clear();
        this.treatmentPlans.clear();
        this.auditLogs.clear();
        this.patientIdCounter = 1;
        this.planIdCounter = 1;
        this.initialized = false;
    }
}

// Export singleton instance
export const demoStorage = new DemoStorageService();
export default demoStorage;

