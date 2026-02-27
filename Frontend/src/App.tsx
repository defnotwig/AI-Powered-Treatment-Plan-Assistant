import React, { useEffect, useState } from 'react';
import { apiUrl } from './config/api';
import { AppProvider, useAppContext } from './context/AppContext';
import PatientIntakeWizard from './components/wizard/PatientIntakeWizard';
import TreatmentDashboard from './components/dashboard/TreatmentDashboard';
import { AnalyticsDashboard, PatientSearch } from './components/dashboard';
import MLTrainingProgress from './components/dashboard/MLTrainingProgress';
import { Button, BackNavigation } from './components/ui';
import { initializeRiskModel } from './services/ml-risk-predictor';
import {
  Activity,
  Users,
  FileText,
  Shield,
  Brain,
  ClipboardCheck,
  ArrowRight,
  Heart,
  Stethoscope,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  BarChart3,
  Search,
  Sparkles,
  Calculator,
  Download,
  Calendar
} from 'lucide-react';

// Type for real-time stats
interface SystemStats {
  totalPatients: number;
  totalTreatmentPlans: number;
  safetyDetectionRate: number;
  auditComplianceRate: number;
  drugInteractionsDetected: number;
  avgResponseTime: number;
  criticalAlertsDetected: number;
}

// Helper type for model status
type ModelStatus = 'loading' | 'ready' | 'error';

// Helper functions to avoid nested ternaries
function getModelStatusClass(status: ModelStatus): string {
  if (status === 'ready') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  if (status === 'loading') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
}

function getModelStatusLabel(status: ModelStatus): string {
  if (status === 'ready') return 'ML Risk Model Active';
  if (status === 'loading') return 'ML Model Training...';
  return 'ML Model Unavailable';
}

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [mlModelStatus, setMlModelStatus] = useState<ModelStatus>('loading');
  const [currentView, setCurrentView] = useState<'home' | 'analytics' | 'patients'>('home');
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalPatients: 0,
    totalTreatmentPlans: 0,
    safetyDetectionRate: 0,
    auditComplianceRate: 0,
    drugInteractionsDetected: 0,
    avgResponseTime: 0,
    criticalAlertsDetected: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch real-time system stats from backend
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const response = await fetch(apiUrl('/patients/analytics'));
        if (!response.ok) return;
        const result = await response.json();
        if (result.success && result.data) {
          setSystemStats({
            totalPatients: result.data.totalPatients || 0,
            totalTreatmentPlans: result.data.totalTreatmentPlans || 0,
            safetyDetectionRate: result.data.safetyDetectionRate || 0,
            auditComplianceRate: result.data.auditComplianceRate || 0,
            drugInteractionsDetected: result.data.drugInteractionsDetected || 0,
            avgResponseTime: result.data.avgResponseTime || 0,
            criticalAlertsDetected: result.data.criticalAlertsDetected || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch system stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchSystemStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize ML Risk Prediction Model on mount
  useEffect(() => {
    const initModel = async () => {
      try {
        await initializeRiskModel((epoch, loss) => {
          console.log(`ML Training - Epoch ${epoch}, Loss: ${loss.toFixed(4)}`);
        });
        setMlModelStatus('ready');
        console.log('✅ ML Risk Prediction Model ready');
      } catch (error) {
        console.error('ML Model initialization failed:', error);
        setMlModelStatus('error');
      }
    };
    initModel();
  }, []);

  // Demo data loader for quick testing
  const loadSamplePatient = async (riskLevel: 'high' | 'medium' | 'low') => {
    try {
      const { getSamplePatient } = await import('./data/sample-patients');
      const sampleData = getSamplePatient(riskLevel);
      dispatch({ type: 'SET_PATIENT_DATA', payload: sampleData });
      dispatch({ type: 'SET_STEP', payload: 'intake' });
    } catch (error) {
      console.error('Failed to load sample patient:', error);
    }
  };

  if (state.currentStep === 'dashboard') {
    return <TreatmentDashboard />;
  }

  if (state.currentStep === 'intake') {
    return <PatientIntakeWizard />;
  }

  // Analytics Dashboard View
  if (currentView === 'analytics') {
    return (
      <div className="min-h-screen bg-obsidian-950 dot-grid">
        <header className="bg-obsidian-900/80 backdrop-blur-xl border-b border-obsidian-600/30 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-3 hover:opacity-80"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Activity className="w-5 h-5 text-obsidian-950" />
                  </div>
                  <div>
                    <h1 className="text-xl font-display font-bold text-slate-100">MedAssist<span className="text-cyan-400">AI</span></h1>
                  </div>
                </button>
              </div>
              <nav className="flex items-center gap-4">
                <BackNavigation
                  label="Back"
                  fallbackLabel="Back to Home"
                  strategy="fallback-only"
                  onFallback={() => setCurrentView('home')}
                  variant="secondary"
                  size="sm"
                />
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentView('patients')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Patients
                </button>
                <Button
                  onClick={() => dispatch({ type: 'SET_STEP', payload: 'intake' })}
                >
                  New Patient
                </Button>
              </nav>
            </div>
          </div>
        </header>
        <AnalyticsDashboard />
      </div>
    );
  }

  // Patient Search View
  if (currentView === 'patients') {
    return (
      <div className="min-h-screen bg-obsidian-950 dot-grid">
        <header className="bg-obsidian-900/80 backdrop-blur-xl border-b border-obsidian-600/30 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-3 hover:opacity-80"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Activity className="w-5 h-5 text-obsidian-950" />
                  </div>
                  <div>
                    <h1 className="text-xl font-display font-bold text-slate-100">MedAssist<span className="text-cyan-400">AI</span></h1>
                  </div>
                </button>
              </div>
              <nav className="flex items-center gap-4">
                <BackNavigation
                  label="Back"
                  fallbackLabel="Back to Home"
                  strategy="fallback-only"
                  onFallback={() => setCurrentView('home')}
                  variant="secondary"
                  size="sm"
                />
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Analytics
                </button>
                <Button
                  onClick={() => dispatch({ type: 'SET_STEP', payload: 'intake' })}
                >
                  New Patient
                </Button>
              </nav>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PatientSearch />
        </div>
      </div>
    );
  }

  // Home/Landing page - Obsidian Clinical dark-mode design
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-200">
      {/* Navigation Header */}
      <header className="bg-obsidian-900/80 backdrop-blur-xl border-b border-obsidian-600/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-glow-pulse">
                <Activity className="w-5 h-5 text-obsidian-950" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-slate-100">MedAssist<span className="text-cyan-400">AI</span></h1>
                <p className="text-xs text-slate-500">Clinical Decision Support</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-slate-400 hover:text-cyan-400 transition-colors font-medium">How It Works</a>
              <a href="#features" className="text-slate-400 hover:text-cyan-400 transition-colors font-medium">Features</a>
              <button
                onClick={() => setCurrentView('analytics')}
                className="text-slate-400 hover:text-cyan-400 transition-colors font-medium flex items-center gap-1"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={() => setCurrentView('patients')}
                className="text-slate-400 hover:text-cyan-400 transition-colors font-medium flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                Patients
              </button>
              <Button
                onClick={() => dispatch({ type: 'SET_STEP', payload: 'intake' })}
              >
                Start Assessment
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs — floating background accents */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-orb pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl animate-orb-reverse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full text-sm font-medium border border-cyan-500/20">
                  <Shield className="w-4 h-4" />
                  AI-Powered Clinical Decision Support
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getModelStatusClass(mlModelStatus)}`}>
                  <Sparkles className="w-4 h-4" />
                  {getModelStatusLabel(mlModelStatus)}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
                Smarter Treatment Plans,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">
                  Safer Patients
                </span>
              </h1>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Advanced AI analysis for personalized treatment recommendations with automatic drug interaction detection,
                contraindication flagging, and comprehensive risk scoring.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => dispatch({ type: 'SET_STEP', payload: 'intake' })}
                  size="lg"
                  className="shadow-lg shadow-cyan-500/30 text-lg px-8"
                >
                  Start New Patient Intake
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => loadSamplePatient('high')}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8"
                >
                  Try Demo Patient
                </Button>
              </div>
            </div>

            {/* Stats Cards - Real-Time Data */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-obsidian-600/30 hover:border-cyan-500/20 hover:shadow-glow-sm transition-all duration-300">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-3xl font-display font-bold text-white">
                  {statsLoading ? '...' : systemStats.totalPatients.toLocaleString()}
                </div>
                <div className="text-slate-400">Patients in Database</div>
              </div>
              <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-obsidian-600/30 hover:border-emerald-500/20 hover:shadow-glow-sm transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-3xl font-display font-bold text-white">
                  {statsLoading ? '...' : `${systemStats.safetyDetectionRate}%`}
                </div>
                <div className="text-slate-400">Safety Detection Rate</div>
              </div>
              <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-obsidian-600/30 hover:border-amber-500/20 hover:shadow-glow-sm transition-all duration-300">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-3xl font-display font-bold text-white">
                  {statsLoading ? '...' : systemStats.drugInteractionsDetected.toLocaleString()}
                </div>
                <div className="text-slate-400">Interactions Detected</div>
              </div>
              <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-obsidian-600/30 hover:border-purple-500/20 hover:shadow-glow-sm transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-3xl font-display font-bold text-white">
                  {statsLoading ? '...' : `${systemStats.avgResponseTime}s`}
                </div>
                <div className="text-slate-400">Avg Analysis Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-obsidian-900/50 border-y border-obsidian-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Three simple steps to generate AI-powered, safety-validated treatment plans
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group animate-fade-in stagger-1">
              <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-8 border border-obsidian-600/30 hover:border-cyan-500/30 hover:shadow-glow-sm transition-all duration-300">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center text-obsidian-950 font-display font-bold text-xl shadow-lg shadow-cyan-500/30">
                  1
                </div>
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">Patient Intake</h3>
                <p className="text-slate-400">
                  Enter patient demographics, medical history, current medications, and lifestyle factors through our guided wizard.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group animate-fade-in stagger-2">
              <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-8 border border-obsidian-600/30 hover:border-emerald-500/30 hover:shadow-glow-sm transition-all duration-300">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-obsidian-950 font-display font-bold text-xl shadow-lg shadow-emerald-500/30">
                  2
                </div>
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">AI Analysis</h3>
                <p className="text-slate-400">
                  GPT-4o analyzes the data, checks for drug interactions, identifies contraindications, and calculates risk scores.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group animate-fade-in stagger-3">
              <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-8 border border-obsidian-600/30 hover:border-amber-500/30 hover:shadow-glow-sm transition-all duration-300">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-obsidian-950 font-display font-bold text-xl shadow-lg shadow-amber-500/30">
                  3
                </div>
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">Review & Approve</h3>
                <p className="text-slate-400">
                  Review the comprehensive treatment plan, flagged issues, and alternatives. Approve, modify, or reject with full audit trail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Patients Section */}
      <section className="py-20 bg-obsidian-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Try Sample Patients
            </h2>
            <p className="text-xl text-slate-400">
              Explore the system with pre-configured patient profiles at different risk levels
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => loadSamplePatient('high')}
              className="group bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-rose-500/20 hover:border-rose-500/50 hover:shadow-glow-rose transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <div className="font-display font-bold text-white">High Risk</div>
                  <div className="text-sm text-rose-400 font-medium">Critical Contraindication</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                72-year-old with CAD, taking nitroglycerin. ED complaint - tests sildenafil + nitrate contraindication.
              </p>
              <div className="flex items-center text-rose-400 font-medium group-hover:gap-2 transition-all">
                Load Patient <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>

            <button
              onClick={() => loadSamplePatient('medium')}
              className="group bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-amber-500/20 hover:border-amber-500/50 hover:shadow-glow-amber transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="font-display font-bold text-white">Medium Risk</div>
                  <div className="text-sm text-amber-400 font-medium">Monitoring Required</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                55-year-old with Type 2 Diabetes and hypertension. Multiple medications requiring careful monitoring.
              </p>
              <div className="flex items-center text-amber-400 font-medium group-hover:gap-2 transition-all">
                Load Patient <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>

            <button
              onClick={() => loadSamplePatient('low')}
              className="group bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-glow transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="font-display font-bold text-white">Low Risk</div>
                  <div className="text-sm text-emerald-400 font-medium">Standard Care</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                32-year-old healthy adult with mild seasonal allergies. Minimal medication interactions expected.
              </p>
              <div className="flex items-center text-emerald-400 font-medium group-hover:gap-2 transition-all">
                Load Patient <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* New Advanced Tools Section */}
      <section className="py-20 bg-obsidian-900/50 border-y border-obsidian-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm font-medium border border-purple-500/20 mb-4">
              <Sparkles className="w-4 h-4" />
              New Advanced Features
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Powerful Tools for Better Care
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Advanced analytics, ML-powered predictions, and comprehensive patient management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Analytics Dashboard Card */}
            <button
              onClick={() => setCurrentView('analytics')}
              className="group bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20 hover:border-indigo-400/40 hover:shadow-glow-sm transition-all duration-300 text-left"
            >
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-slate-400 text-sm mb-3">
                Visualize patient risk distributions, treatment trends, and performance metrics.
              </p>
              <span className="text-indigo-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                View Analytics <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            {/* Patient Search Card */}
            <button
              onClick={() => setCurrentView('patients')}
              className="group bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-glow-sm transition-all duration-300 text-left"
            >
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Patient Records</h3>
              <p className="text-slate-400 text-sm mb-3">
                Search and manage patient history, treatment plans, and follow-ups.
              </p>
              <span className="text-cyan-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Browse Patients <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            {/* ML Risk Prediction Card */}
            <div className="group bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 hover:border-amber-400/40 hover:shadow-glow-sm transition-all duration-300 text-left">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">ML Risk Prediction</h3>
              <p className="text-slate-400 text-sm mb-3">
                TensorFlow.js neural network for real-time patient risk scoring and feature importance.
              </p>
              <span className={`text-sm font-medium flex items-center gap-2 ${mlModelStatus === 'ready' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                <span className={`w-2 h-2 rounded-full ${mlModelStatus === 'ready' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`} />
                {mlModelStatus === 'ready' ? 'Model Active' : 'Training...'}
              </span>
            </div>

            {/* Dosing Calculator Card */}
            <div className="group bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 hover:shadow-glow-sm transition-all duration-300 text-left">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calculator className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Renal Dosing Calculator</h3>
              <p className="text-slate-400 text-sm mb-3">
                CrCl/eGFR calculations with automatic renal-adjusted dosing recommendations.
              </p>
              <span className="text-blue-400 font-medium text-sm flex items-center gap-1">
                Included in Analysis
              </span>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-obsidian-800/40 rounded-xl p-5 border border-obsidian-600/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-white">PDF Export</h4>
                <p className="text-sm text-slate-400">Professional treatment plan reports</p>
              </div>
            </div>

            <div className="bg-obsidian-800/40 rounded-xl p-5 border border-obsidian-600/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-white">Provider Notes</h4>
                <p className="text-sm text-slate-400">Clinical documentation system</p>
              </div>
            </div>

            <div className="bg-obsidian-800/40 rounded-xl p-5 border border-obsidian-600/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-white">Follow-up Scheduler</h4>
                <p className="text-sm text-slate-400">Appointment and reminder management</p>
              </div>
            </div>
          </div>

          {/* ML Training Progress Panel */}
          <div className="mt-8">
            <MLTrainingProgress />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-obsidian-950 dot-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Why Choose MedAssist<span className="text-cyan-400">AI</span>?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Advanced clinical decision support powered by the latest AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-obsidian-600/30 hover:border-cyan-500/20 hover:shadow-glow-sm transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
                <Pill className="w-7 h-7 text-obsidian-950" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Drug Interaction Detection</h3>
              <p className="text-slate-400">
                Automatic detection of major, moderate, and minor drug-drug interactions with clinical management recommendations.
              </p>
            </div>

            <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-obsidian-600/30 hover:border-rose-500/20 hover:shadow-glow-rose transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/20">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Contraindication Flagging</h3>
              <p className="text-slate-400">
                Identifies absolute and relative contraindications based on patient conditions, allergies, and current medications.
              </p>
            </div>

            <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-obsidian-600/30 hover:border-emerald-500/20 hover:shadow-glow-sm transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Risk Scoring</h3>
              <p className="text-slate-400">
                AI-powered risk assessment with confidence levels, contributing factors, and evidence-based recommendations.
              </p>
            </div>

            <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-obsidian-600/30 hover:border-blue-500/20 hover:shadow-glow-sm transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">GPT-4o Powered</h3>
              <p className="text-slate-400">
                Leverages OpenAI's most advanced model for nuanced clinical reasoning and personalized treatment recommendations.
              </p>
            </div>

            <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-obsidian-600/30 hover:border-purple-500/20 hover:shadow-glow-sm transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Dosage Adjustment</h3>
              <p className="text-slate-400">
                Automatic dosage calculations based on age, weight, renal function, and hepatic status for patient safety.
              </p>
            </div>

            <div className="bg-obsidian-800/60 backdrop-blur-sm rounded-2xl p-6 border border-obsidian-600/30 hover:border-amber-500/20 hover:shadow-glow-amber transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                <ClipboardCheck className="w-7 h-7 text-obsidian-950" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Audit Compliance</h3>
              <p className="text-slate-400">
                Complete audit trail for all clinical decisions with timestamps, user actions, and modification history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-20 bg-gradient-to-br from-obsidian-900 via-obsidian-800 to-obsidian-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Patient Safety is Our <span className="text-cyan-400">Top Priority</span>
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Every treatment recommendation undergoes rigorous safety validation before reaching clinicians.
                Our multi-layered approach ensures no critical interaction goes undetected.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Real-time drug interaction database with 10,000+ interactions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Absolute contraindication blocking for critical combinations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Geriatric and pediatric dosing adjustments</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Renal and hepatic function-based dose modifications</span>
                </li>
              </ul>
            </div>
            <div className="bg-obsidian-800/60 backdrop-blur-lg rounded-3xl p-8 border border-cyan-500/20 shadow-glow-sm">
              <div className="text-center">
                <div className="text-6xl font-display font-bold mb-2 text-cyan-400">
                  {statsLoading ? '...' : `${systemStats.safetyDetectionRate}%`}
                </div>
                <div className="text-xl text-slate-400 mb-6">Safety Detection Rate</div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-obsidian-700/60 rounded-xl p-4 border border-obsidian-600/30">
                    <div className="text-2xl font-display font-bold text-white">
                      {statsLoading ? '...' : systemStats.criticalAlertsDetected}
                    </div>
                    <div className="text-sm text-slate-400">Critical Alerts Detected</div>
                  </div>
                  <div className="bg-obsidian-700/60 rounded-xl p-4 border border-obsidian-600/30">
                    <div className="text-2xl font-display font-bold text-white">
                      {statsLoading ? '...' : `${systemStats.auditComplianceRate}%`}
                    </div>
                    <div className="text-sm text-slate-400">Audit Compliance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-obsidian-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to Improve <span className="text-cyan-400">Patient Safety</span>?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Start using AI-powered clinical decision support today. No setup required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 'intake' })}
              size="lg"
              className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 shadow-lg shadow-cyan-500/30 text-lg px-10 font-display font-bold"
            >
              Start New Patient Intake
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-obsidian-950 text-slate-500 py-12 border-t border-obsidian-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Activity className="w-5 h-5 text-obsidian-950" />
                </div>
                <div>
                  <h3 className="text-white font-display font-bold">MedAssist<span className="text-cyan-400">AI</span></h3>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                AI-powered clinical decision support for safer, personalized treatment plans.
              </p>
            </div>
            <div>
              <h4 className="text-slate-200 font-display font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Drug Interaction Detection</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Contraindication Flagging</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Risk Scoring</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Dosage Adjustment</li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-200 font-display font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">API Reference</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Safety Guidelines</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Support</li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-200 font-display font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 hover:text-cyan-400 transition-colors"><Mail className="w-4 h-4" /> support@medassist.ai</li>
                <li className="flex items-center gap-2 hover:text-cyan-400 transition-colors"><Phone className="w-4 h-4" /> +1 (555) 123-4567</li>
                <li className="flex items-center gap-2 hover:text-cyan-400 transition-colors"><MapPin className="w-4 h-4" /> San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-obsidian-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">© 2025 MedAssistAI. For demonstration purposes only.</p>
            <p className="text-sm text-slate-600">Powered by <span className="text-cyan-500">GPT-4o</span> with clinical safety validation</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
