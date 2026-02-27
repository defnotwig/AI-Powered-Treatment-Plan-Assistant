import React, { useState, useEffect } from 'react';
import { apiUrl } from '../../config/api';
import { useAppContext } from '../../context/AppContext';
import { Button, Alert, BackNavigation } from '../ui';
import {
  RiskScoreCard,
  FlaggedIssuesPanel,
  TreatmentPlanCard,
  AlternativesCarousel,
  RationaleAccordion,
  ActionPanel,
  ProviderNotesPanel,
  FollowUpScheduler,
} from './index';
import EnhancedRiskVisualization from './EnhancedRiskVisualization';
import { AlternativeTreatment, TreatmentRecommendation } from '../../types';
import { ArrowLeft, FileText, Download, FileDown, Brain, Calculator, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { downloadTreatmentPlanPDF } from '../../services/pdf-generator';
import { getRiskPredictionModel } from '../../services/ml-risk-predictor';
import { assessRenalFunction, type PatientParameters } from '../../services/dosing-calculator';
import { computeEnsembleRisk, type EnsembleRiskResult, type EnsemblePatientInput } from '../../services/ensemble-risk-scorer';
import type { ProviderNote } from './ProviderNotesPanel';
import type { ScheduledFollowUp } from './FollowUpScheduler';

// Helper functions to avoid nested ternaries
function getRiskLevelClass(riskLevel: string): string {
  if (riskLevel === 'CRITICAL') return 'bg-rose-500/20 text-rose-300';
  if (riskLevel === 'HIGH') return 'bg-orange-500/20 text-orange-300';
  if (riskLevel === 'MEDIUM') return 'bg-amber-500/20 text-amber-300';
  return 'bg-emerald-500/20 text-emerald-300';
}

function getStatusBadgeClass(status: string | undefined): string {
  if (status === 'approved') return 'bg-emerald-500/20 text-emerald-300';
  if (status === 'rejected') return 'bg-rose-500/20 text-rose-300';
  return 'bg-amber-500/20 text-amber-300';
}

function normalizeBloodPressure(bp?: { systolic?: number; diastolic?: number }): { systolic: number; diastolic: number } {
  return {
    systolic: bp?.systolic ?? 120,
    diastolic: bp?.diastolic ?? 80,
  };
}

const TreatmentDashboard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { treatmentPlan, currentPatientId, patientData } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [providerNotes, setProviderNotes] = useState<ProviderNote[]>([]);
  const [followUps, setFollowUps] = useState<ScheduledFollowUp[]>([]);
  const [showExtras, setShowExtras] = useState(false);
  const [ensembleResult, setEnsembleResult] = useState<EnsembleRiskResult | null>(null);
  const [mlPrediction, setMlPrediction] = useState<{
    riskScore: number;
    riskLevel: string;
    confidence: number;
    featureImportance: Record<string, number>;
  } | null>(null);
  const [renalFunction, setRenalFunction] = useState<{
    creatinineClearance: number;
    eGFR: number;
    ckdStage: number;
    ckdDescription: string;
    renalAdjustmentRequired: boolean;
  } | null>(null);

  // Get ML prediction and renal function on mount
  useEffect(() => {
    const analyze = async () => {
      if (!patientData) return;

      // ML Risk Prediction
      try {
        const model = getRiskPredictionModel();
        if (model.isModelTrained()) {
          const prediction = await model.predict({
            demographics: {
              age: patientData.demographics?.age || 50,
              bmi: patientData.demographics?.bmi || 25,
              bloodPressure: normalizeBloodPressure(patientData.demographics?.bloodPressure),
              heartRate: patientData.demographics?.heartRate || 72,
            },
            medicalHistory: {
              conditions: patientData.medicalHistory?.conditions || [],
              allergies: patientData.medicalHistory?.allergies || [],
            },
            currentMedications: {
              medications: patientData.currentMedications?.medications || [],
            },
            lifestyleFactors: {
              smokingStatus: patientData.lifestyleFactors?.smokingStatus || 'never',
              packYears: patientData.lifestyleFactors?.packYears,
              alcoholUse: patientData.lifestyleFactors?.alcoholUse || 'none',
              drinksPerWeek: patientData.lifestyleFactors?.drinksPerWeek,
              exerciseLevel: patientData.lifestyleFactors?.exerciseLevel || 'moderate',
            },
          });
          setMlPrediction(prediction);
        }
      } catch (error) {
        console.error('ML prediction failed:', error);
      }

      // Renal Function Assessment
      try {
        const params: PatientParameters = {
          age: patientData.demographics?.age || 50,
          weight: patientData.demographics?.weight || 70,
          height: patientData.demographics?.height || 170,
          sex: (patientData.demographics?.sex as 'male' | 'female' | 'other') || 'other',
          serumCreatinine: patientData.demographics?.serumCreatinine || 1, // Uses patient lab value, falls back to 1.0
        };
        const renal = assessRenalFunction(params);
        setRenalFunction(renal);
      } catch (error) {
        console.error('Renal assessment failed:', error);
      }

      // Ensemble Risk Assessment (combines all ML models)
      try {
        const ensembleInput: EnsemblePatientInput = {
          demographics: {
            age: patientData.demographics?.age || 50,
            bmi: patientData.demographics?.bmi || 25,
            bloodPressure: normalizeBloodPressure(patientData.demographics?.bloodPressure),
            heartRate: patientData.demographics?.heartRate || 72,
          },
          medicalHistory: {
            conditions: patientData.medicalHistory?.conditions || [],
            allergies: patientData.medicalHistory?.allergies || [],
          },
          currentMedications: {
            medications: (patientData.currentMedications?.medications || []).map((m: { drugName: string; genericName?: string; dosage?: string }) => ({
              drugName: m.drugName,
              genericName: m.genericName || m.drugName,
              dosage: m.dosage,
            })),
          },
          lifestyleFactors: {
            smokingStatus: patientData.lifestyleFactors?.smokingStatus || 'never',
            packYears: patientData.lifestyleFactors?.packYears,
            alcoholUse: patientData.lifestyleFactors?.alcoholUse || 'none',
            drinksPerWeek: patientData.lifestyleFactors?.drinksPerWeek,
            exerciseLevel: patientData.lifestyleFactors?.exerciseLevel || 'moderate',
            chiefComplaint: patientData.lifestyleFactors?.chiefComplaint,
          },
        };
        const result = await computeEnsembleRisk(ensembleInput);
        setEnsembleResult(result);
        console.log('✅ Ensemble risk assessment complete:', result.riskLevel, result.overallScore);
      } catch (error) {
        console.error('Ensemble risk assessment failed:', error);
      }
    };

    analyze();
  }, [patientData]);

  // Handler for adding provider notes
  const handleAddNote = (note: Omit<ProviderNote, 'id' | 'createdAt'>) => {
    const newNote: ProviderNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProviderNotes(prev => [newNote, ...prev]);
  };

  // Handler for scheduling follow-ups
  const handleScheduleFollowUp = (followUp: Omit<ScheduledFollowUp, 'id' | 'createdAt' | 'completed'>) => {
    const newFollowUp: ScheduledFollowUp = {
      ...followUp,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setFollowUps(prev => [...prev, newFollowUp]);
  };

  // Handler for completing follow-ups
  const handleCompleteFollowUp = (id: string, notes?: string) => {
    setFollowUps(prev => prev.map(fu =>
      fu.id === id
        ? { ...fu, completed: true, completedAt: new Date().toISOString(), notes }
        : fu
    ));
  };

  if (!treatmentPlan) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No treatment plan available</p>
          <Button onClick={() => dispatch({ type: 'SET_STEP', payload: 'intake' })}>
            <ArrowLeft className="w-4 h-4" /> Back to Intake
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateRecommendations = (recommendations: TreatmentRecommendation[]) => {
    dispatch({
      type: 'SET_TREATMENT_PLAN',
      payload: {
        ...treatmentPlan,
        recommendations,
      },
    });
  };

  const handleSelectAlternative = (alternative: AlternativeTreatment) => {
    // Convert alternative to recommendation and add to plan
    const newRecommendation: TreatmentRecommendation = {
      drugName: alternative.drugName,
      dosage: alternative.dosage,
      frequency: alternative.frequency,
      route: 'oral',
      priority: 'medium',
      rationale: alternative.reason,
    };

    handleUpdateRecommendations([...treatmentPlan.recommendations, newRecommendation]);
  };

  const handleApprove = async (notes: string) => {
    if (!currentPatientId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl(`/treatment-plans/${currentPatientId}/approve`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, treatmentPlan }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to approve treatment plan');
      }

      setSuccessMessage('Treatment plan approved successfully');
      dispatch({
        type: 'SET_TREATMENT_PLAN',
        payload: { ...treatmentPlan, status: 'approved' },
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to approve treatment plan',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModify = async (modifications: string) => {
    if (!currentPatientId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl(`/treatment-plans/${currentPatientId}/modify`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modifications, treatmentPlan }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit modifications');
      }

      const data = await response.json();
      setSuccessMessage('Treatment plan modifications submitted');
      if (data.treatmentPlan) {
        dispatch({ type: 'SET_TREATMENT_PLAN', payload: data.treatmentPlan });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to submit modifications',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!currentPatientId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl(`/treatment-plans/${currentPatientId}/reject`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reject treatment plan');
      }

      setSuccessMessage('Treatment plan rejected');
      dispatch({
        type: 'SET_TREATMENT_PLAN',
        payload: { ...treatmentPlan, status: 'rejected' },
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to reject treatment plan',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToIntake = () => {
    dispatch({ type: 'RESET_FORM' });
    dispatch({ type: 'SET_STEP', payload: 'intake' });
  };

  const handleBackToHome = () => {
    dispatch({ type: 'SET_STEP', payload: 'home' });
  };

  const handleExportJSON = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      patientId: currentPatientId,
      patientData: state.patientData,
      treatmentPlan,
      mlPrediction,
      renalFunction,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treatment-plan-${currentPatientId || 'unknown'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!treatmentPlan || !patientData) return;

    const demographics = patientData.demographics || {};
    const medicalHistory = patientData.medicalHistory || { conditions: [], allergies: [] };
    const currentMedications = patientData.currentMedications || { medications: [] };
    const lifestyleFactors = patientData.lifestyleFactors || { chiefComplaint: '' };

    downloadTreatmentPlanPDF(
      {
        patientId: currentPatientId || 'N/A',
        age: demographics.age || 0,
        sex: demographics.sex || 'unknown',
        weight: demographics.weight || 0,
        height: demographics.height || 0,
        bmi: demographics.bmi || 0,
        bloodPressure: normalizeBloodPressure(demographics.bloodPressure),
        heartRate: demographics.heartRate || 0,
        temperature: demographics.temperature || 98.6,
      },
      {
        conditions: medicalHistory.conditions.map((c: { condition: string; severity?: string; isControlled?: boolean }) => ({
          condition: c.condition,
          severity: c.severity,
          controlled: c.isControlled,
        })),
        allergies: medicalHistory.allergies.map((a: { allergen: string; reaction?: string; severity?: string }) => ({
          allergen: a.allergen,
          reaction: a.reaction,
          severity: a.severity,
        })),
        surgeries: medicalHistory.surgeries?.map((s: { procedure: string; date?: string }) => ({
          procedure: s.procedure,
          date: s.date,
        })),
        familyHistory: medicalHistory.familyHistory || [],
      },
      {
        medications: currentMedications.medications.map((m: { drugName: string; dosage: string; frequency: string; route?: string; prescribedBy?: string }) => ({
          drugName: m.drugName,
          dosage: m.dosage,
          frequency: m.frequency,
          route: m.route,
          prescribedBy: m.prescribedBy,
        })),
      },
      {
        chiefComplaint: lifestyleFactors.chiefComplaint || '',
        smokingStatus: lifestyleFactors.smokingStatus || 'unknown',
        packYears: lifestyleFactors.packYears,
        alcoholUse: lifestyleFactors.alcoholUse || 'unknown',
        drinksPerWeek: lifestyleFactors.drinksPerWeek,
        exerciseLevel: lifestyleFactors.exerciseLevel || 'unknown',
        dietType: lifestyleFactors.dietType,
      },
      {
        recommendations: treatmentPlan.recommendations.map(r => ({
          drugName: r.drugName,
          genericName: r.genericName,
          dosage: r.dosage,
          frequency: r.frequency,
          duration: r.duration,
          route: r.route,
          instructions: r.instructions,
          priority: r.priority,
        })),
        riskAssessment: {
          overallRisk: treatmentPlan.riskAssessment.overallRisk,
          riskScore: treatmentPlan.riskAssessment.riskScore,
          confidence: treatmentPlan.riskAssessment.confidence,
          riskFactors: treatmentPlan.riskAssessment.riskFactors,
        },
        flaggedIssues: treatmentPlan.flaggedIssues.map(i => ({
          type: i.type,
          severity: i.severity,
          title: i.title,
          description: i.description,
          recommendation: i.recommendation,
          affectedDrugs: i.affectedDrugs,
        })),
        rationale: treatmentPlan.rationale,
        clinicalGuidelines: treatmentPlan.clinicalGuidelines,
        alternatives: treatmentPlan.alternatives?.map(a => ({
          drugName: a.drugName,
          dosage: a.dosage,
          reason: a.reason,
        })),
      },
      {
        generatedBy: 'MedAssist AI',
        approvalStatus: (treatmentPlan.status as 'pending' | 'approved' | 'modified' | 'rejected') || 'pending',
      }
    );
  };

  return (
    <div className="min-h-screen bg-obsidian-950 py-8 px-4 relative">
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full text-sm font-display font-medium mb-3 border border-cyan-500/20">
              <FileText className="w-4 h-4" />
              AI Analysis Complete
            </div>
            <h1 className="text-3xl font-display font-bold text-white">Treatment Plan Dashboard</h1>
            <p className="text-slate-400 mt-1">
              AI-generated treatment recommendations based on patient analysis
            </p>
          </div>
          <div className="flex gap-3">
            <BackNavigation
              label="Back"
              fallbackLabel="Back to Home"
              strategy="fallback-only"
              onFallback={handleBackToHome}
              variant="secondary"
            />
            <Button variant="secondary" onClick={handleBackToIntake}>
              <ArrowLeft className="w-4 h-4" /> New Patient
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              <Download className="w-4 h-4" /> JSON
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10">
              <FileDown className="w-4 h-4" /> PDF Report
            </Button>
          </div>
        </div>

        {/* ML Insights & Renal Function Bar */}
        {(mlPrediction || renalFunction) && (
          <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-xl shadow-lg border border-obsidian-600/30 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-6">
              {mlPrediction && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">ML Risk Score</div>
                    <div className="font-bold text-white">
                      {mlPrediction.riskScore}/100
                      <span className={`ml-2 text-sm font-medium px-2 py-0.5 rounded-full ${getRiskLevelClass(mlPrediction.riskLevel)}`}>
                        {mlPrediction.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {renalFunction && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Renal Function</div>
                    <div className="font-bold text-white">
                      CrCl: {renalFunction.creatinineClearance} mL/min
                      <span className={`ml-2 text-sm font-medium px-2 py-0.5 rounded-full ${renalFunction.renalAdjustmentRequired ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                        CKD Stage {renalFunction.ckdStage}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {mlPrediction && (
                <div className="flex items-center gap-3 ml-auto">
                  <div className="text-xs text-slate-500">Top Risk Factors:</div>
                  <div className="flex gap-2">
                    {Object.entries(mlPrediction.featureImportance)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 3)
                      .map(([feature, importance]) => (
                        <span key={feature} className="text-xs bg-obsidian-700/60 text-slate-300 px-2 py-1 rounded border border-obsidian-600/30">
                          {feature}: {importance}%
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <Alert
            type="success"
            title="Success"
            className="mb-6"
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}

        {state.error && (
          <Alert
            type="error"
            title="Error"
            className="mb-6"
            onClose={() => dispatch({ type: 'SET_ERROR', payload: null })}
          >
            {state.error}
          </Alert>
        )}

        {/* Status Badge */}
        {treatmentPlan.status && treatmentPlan.status !== 'pending' && (
          <div className="mb-6">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeClass(treatmentPlan.status)}`}
            >
              <FileText className="w-4 h-4" />
              Status: {treatmentPlan.status.charAt(0).toUpperCase() + treatmentPlan.status.slice(1)}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Risk Assessment and Flagged Issues */}
          <div className="space-y-6">
            {/* Ensemble Risk Visualization (ML-powered multi-model view) */}
            {ensembleResult && (
              <EnhancedRiskVisualization result={ensembleResult} />
            )}

            <RiskScoreCard
              riskLevel={treatmentPlan.riskAssessment.overallRisk}
              riskScore={treatmentPlan.riskAssessment.riskScore}
              confidence={treatmentPlan.riskAssessment.confidence}
              riskFactors={treatmentPlan.riskAssessment.riskFactors}
            />

            <FlaggedIssuesPanel issues={treatmentPlan.flaggedIssues} />
          </div>

          {/* Center Column - Treatment Plan and Alternatives */}
          <div className="space-y-6">
            <TreatmentPlanCard
              recommendations={treatmentPlan.recommendations}
              onUpdate={handleUpdateRecommendations}
              editable={treatmentPlan.status !== 'approved'}
            />

            <AlternativesCarousel
              alternatives={treatmentPlan.alternatives}
              onSelect={handleSelectAlternative}
            />
          </div>

          {/* Right Column - Rationale and Actions */}
          <div className="space-y-6">
            <RationaleAccordion
              rationale={treatmentPlan.rationale}
              clinicalGuidelines={treatmentPlan.clinicalGuidelines}
              evidenceSources={treatmentPlan.evidenceSources}
            />

            {treatmentPlan.status !== 'approved' && treatmentPlan.status !== 'rejected' && (
              <ActionPanel
                treatmentPlanId={currentPatientId || ''}
                onApprove={handleApprove}
                onModify={handleModify}
                onReject={handleReject}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>

        {/* Provider Notes & Follow-up Section Toggle */}
        <div className="mt-8">
          <button
            onClick={() => setShowExtras(!showExtras)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-obsidian-800/60 backdrop-blur-sm rounded-xl border border-obsidian-600/30 text-slate-400 hover:bg-obsidian-700/60 hover:text-white transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span className="font-medium">
              {showExtras ? 'Hide' : 'Show'} Provider Notes & Follow-ups
            </span>
            {showExtras ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Provider Notes & Follow-up Panels */}
        {showExtras && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-fade-in">
            <ProviderNotesPanel
              notes={providerNotes}
              onAddNote={handleAddNote}
              currentProvider={{
                id: 'provider-001',
                name: 'Dr. Demo Provider',
              }}
            />

            <FollowUpScheduler
              followUps={followUps}
              onSchedule={handleScheduleFollowUp}
              onComplete={handleCompleteFollowUp}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentDashboard;
