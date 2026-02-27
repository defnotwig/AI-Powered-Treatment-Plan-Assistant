import React, { useState } from 'react';
import { apiUrl } from '../../config/api';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Alert, BackNavigation } from '../ui';
import {
  DemographicsStep,
  MedicalHistoryStep,
  MedicationsStep,
  LifestyleStep,
  ReviewStep,
} from './index';
import {
  User,
  Heart,
  Pill,
  Activity,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const PatientIntakeWizard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Demographics',
      description: 'Basic patient information',
      icon: <User className="w-5 h-5" />,
      component: <DemographicsStep />,
    },
    {
      id: 2,
      title: 'Medical History',
      description: 'Conditions, allergies, surgeries',
      icon: <Heart className="w-5 h-5" />,
      component: <MedicalHistoryStep />,
    },
    {
      id: 3,
      title: 'Medications',
      description: 'Current medications',
      icon: <Pill className="w-5 h-5" />,
      component: <MedicationsStep />,
    },
    {
      id: 4,
      title: 'Lifestyle',
      description: 'Lifestyle and chief complaint',
      icon: <Activity className="w-5 h-5" />,
      component: <LifestyleStep />,
    },
    {
      id: 5,
      title: 'Review',
      description: 'Review and submit',
      icon: <ClipboardCheck className="w-5 h-5" />,
      component: <ReviewStep />,
    },
  ];

  const canSubmit = (): boolean => {
    const { demographics, lifestyleFactors } = state.patientData;
    return !!(
      demographics.age &&
      demographics.weight &&
      demographics.height &&
      lifestyleFactors.chiefComplaint
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    dispatch({ type: 'SET_ANALYZING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Call API to analyze patient
      const response = await fetch(apiUrl('/treatment-plans/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.patientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as Record<string, string>).message || 'Analysis failed');
      }

      const data = await response.json();

      dispatch({ type: 'SET_TREATMENT_PLAN', payload: data.treatmentPlan });
      dispatch({ type: 'SET_CURRENT_PATIENT_ID', payload: data.patient.id });
      dispatch({ type: 'SET_STEP', payload: 'dashboard' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const getStepClasses = (index: number): string => {
    if (index < currentStep) return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20';
    if (index === currentStep) return 'bg-cyan-500 text-obsidian-950 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/30';
    return 'bg-obsidian-700 text-slate-500';
  };

  return (
    <div className="min-h-screen bg-obsidian-950 py-8 px-4 relative">
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="max-w-5xl mx-auto relative">
        <div className="mb-4">
          <BackNavigation
            label="Back"
            fallbackLabel="Back to Home"
            strategy="fallback-only"
            onFallback={() => dispatch({ type: 'SET_STEP', payload: 'home' })}
            variant="secondary"
            size="sm"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full text-sm font-display font-medium mb-4 border border-cyan-500/20">
            <ClipboardCheck className="w-4 h-4" />
            Patient Intake
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Patient Intake Form</h1>
          <p className="text-slate-400 mt-2">
            Complete the following steps to generate an AI-powered treatment plan
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(index)}
                  className={`flex flex-col items-center transition-all ${index <= currentStep ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  disabled={index > currentStep + 1}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${getStepClasses(index)
                      }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${index <= currentStep ? 'text-slate-200' : 'text-slate-500'
                        }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-600 hidden md:block">{step.description}</p>
                  </div>
                </button>

                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${index < currentStep ? 'bg-emerald-500' : 'bg-obsidian-700'
                      }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <Alert type="error" title="Error" className="mb-6" onClose={() => dispatch({ type: 'SET_ERROR', payload: null })}>
            {state.error}
          </Alert>
        )}

        {/* Step Content */}
        <Card className="mb-6 shadow-xl shadow-obsidian-950/50 border border-obsidian-600/30 overflow-visible">
          {steps[currentStep].component}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          <span className="text-sm text-slate-500">
            Step {currentStep + 1} of {steps.length}
          </span>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-display font-semibold">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit() || state.isAnalyzing}
              className="min-w-[180px] bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-display font-semibold"
            >
              {state.isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Generate Treatment Plan
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientIntakeWizard;
