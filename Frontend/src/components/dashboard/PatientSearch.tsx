/**
 * Patient Search Component
 * 
 * Provides a searchable list of stored patients with filtering options
 * for risk level, date range, and active alerts.
 * Now fetches from backend API in demo mode.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { apiUrl } from '../../config/api';
import {
    Search,
    Filter,
    X,
    User,
    AlertTriangle,
    ChevronRight,
    Clock,
    Activity,
    Bell,
    FileText,
    Heart,
    Pill,
    Download,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button, Card } from '../ui';

// Patient interface matching backend demo storage
interface PatientData {
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
    createdAt: string;
    updatedAt: string;
    medicalHistory?: {
        conditions: Array<{ condition: string; severity: string; controlled: boolean }>;
        allergies: Array<{ allergen: string; reaction: string; severity: string }>;
        pastSurgeries: Array<{ procedure: string; date: string }>;
        familyHistory: string[];
    };
    lifestyleFactors?: {
        chiefComplaint: string;
        smokingStatus: string;
        alcoholFrequency: string;
        exerciseFrequency: string;
        diet: string;
    };
    medicationCount?: number;
    treatmentPlanCount?: number;
}

interface PatientSearchFilters {
    query?: string;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    dateFrom?: string;
    dateTo?: string;
    hasActiveAlerts?: boolean;
    hasPendingFollowUps?: boolean;
}

interface PatientSearchProps {
    onSelectPatient?: (patient: PatientData) => void;
}

// Risk level badge colors
const RISK_COLORS = {
    low: 'bg-emerald-500/20 text-emerald-300',
    medium: 'bg-amber-500/20 text-amber-300',
    high: 'bg-orange-500/20 text-orange-300',
    critical: 'bg-rose-500/20 text-rose-300',
};

// Estimate risk level based on patient data
function estimateRiskLevel(patient: PatientData): string {
    let score = 0;

    // Age factor
    if (patient.age > 75) score += 25;
    else if (patient.age > 65) score += 15;
    else if (patient.age > 55) score += 10;

    // Condition count
    const conditionCount = patient.medicalHistory?.conditions?.length || 0;
    if (conditionCount >= 5) score += 30;
    else if (conditionCount >= 3) score += 20;
    else if (conditionCount >= 1) score += 10;

    // Medication count
    const medCount = patient.medicationCount || 0;
    if (medCount >= 8) score += 25;
    else if (medCount >= 5) score += 15;
    else if (medCount >= 3) score += 10;

    // BP factor
    if (patient.systolicBp >= 180 || patient.diastolicBp >= 120) score += 20;
    else if (patient.systolicBp >= 140 || patient.diastolicBp >= 90) score += 10;

    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
}

// Patient Card Component
const PatientCard: React.FC<{
    patient: PatientData;
    onSelect?: (patient: PatientData) => void;
    onExport?: (patientId: string) => void;
}> = ({ patient, onSelect, onExport }) => {
    const riskLevel = estimateRiskLevel(patient);
    const conditionCount = patient.medicalHistory?.conditions?.length || 0;
    const medCount = patient.medicationCount || 0;
    const planCount = patient.treatmentPlanCount || 0;

    return (
        <div className="bg-obsidian-800/60 rounded-lg border border-obsidian-600/30 p-4 hover:border-cyan-500/30 hover:shadow-glow-sm transition-all">
            <div className="flex items-start gap-4">
                {/* Patient Avatar */}
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-cyan-400" />
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h4 className="font-display font-semibold text-white">
                                {patient.patientId || patient.id.slice(0, 8)}
                            </h4>
                            <p className="text-sm text-slate-400">
                                {patient.age} years, {patient.sex}
                            </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${RISK_COLORS[riskLevel as keyof typeof RISK_COLORS] || 'bg-obsidian-700/50 text-slate-400'}`}>
                            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                        </span>
                    </div>

                    {/* Chief Complaint */}
                    <div className="mb-3">
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-500" />
                            <span className="truncate">
                                {patient.lifestyleFactors?.chiefComplaint || 'No chief complaint recorded'}
                            </span>
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 mb-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {conditionCount} conditions
                        </span>
                        <span className="flex items-center gap-1">
                            <Pill className="w-3 h-3" />
                            {medCount} medications
                        </span>
                        <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {planCount} plans
                        </span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {conditionCount >= 3 && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                Multiple Conditions
                            </span>
                        )}
                        {medCount >= 5 && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs">
                                <Bell className="w-3 h-3" />
                                Polypharmacy
                            </span>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-obsidian-700/50">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {patient.createdAt ? format(new Date(patient.createdAt), 'MMM d, yyyy') : 'Unknown'}
                        </span>

                        <div className="flex gap-2">
                            {onExport && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onExport(patient.id);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-obsidian-700/50 rounded"
                                    title="Export patient data"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            )}
                            {onSelect && (
                                <button
                                    onClick={() => onSelect(patient)}
                                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                                >
                                    View Details
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Patient Search Component
const PatientSearch: React.FC<PatientSearchProps> = ({ onSelectPatient }) => {
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<PatientSearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    // Fetch patients from API
    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(apiUrl('/patients'));
            if (!response.ok) {
                setError('Server returned an error. Please try again.');
                return;
            }
            const data = await response.json();

            if (data.success) {
                setPatients(data.data || []);
            } else {
                setError(data.message || 'Failed to load patients');
            }
        } catch (err) {
            console.error('Failed to fetch patients:', err);
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load patients on mount
    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // Filtered patients
    const filteredPatients = useMemo(() => {
        let result = [...patients];

        if (filters.query) {
            const query = filters.query.toLowerCase();
            result = result.filter(p => {
                const searchableText = [
                    p.patientId,
                    p.id,
                    p.lifestyleFactors?.chiefComplaint,
                    ...(p.medicalHistory?.conditions?.map(c => c.condition) || []),
                ].join(' ').toLowerCase();

                return searchableText.includes(query);
            });
        }

        if (filters.riskLevel) {
            result = result.filter(p => estimateRiskLevel(p) === filters.riskLevel);
        }

        return result;
    }, [patients, filters]);

    const handleExport = useCallback((patientId: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
            const exportData = JSON.stringify(patient, null, 2);
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `patient_${patientId}_export.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }, [patients]);

    const clearFilters = () => {
        setFilters({});
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

    const renderPatientListContent = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
                    <p className="text-slate-400">Loading patients...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                    <h4 className="text-lg font-display font-medium text-white mb-2">Error Loading Patients</h4>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <Button onClick={fetchPatients} variant="secondary">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            );
        }
        if (filteredPatients.length > 0) {
            return (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredPatients.slice(0, 50).map(patient => (
                        <PatientCard
                            key={patient.id}
                            patient={patient}
                            onSelect={onSelectPatient}
                            onExport={handleExport}
                        />
                    ))}
                    {filteredPatients.length > 50 && (
                        <div className="text-center py-4 text-slate-400">
                            Showing 50 of {filteredPatients.length} patients. Use filters to narrow results.
                        </div>
                    )}
                </div>
            );
        }
        return (
            <div className="text-center py-12">
                <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h4 className="text-lg font-display font-medium text-white mb-2">
                    {hasActiveFilters ? 'No Matching Patients' : 'No Patients Found'}
                </h4>
                <p className="text-slate-400 mb-4">
                    {hasActiveFilters
                        ? 'Try adjusting your search criteria or filters.'
                        : 'Start by adding a new patient through the intake wizard.'}
                </p>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mx-auto"
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </button>
                )}
            </div>
        );
    };

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-obsidian-600/30 bg-obsidian-800/40">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-cyan-400" />
                        Patient Records
                        <span className="ml-2 text-sm font-normal text-slate-400">
                            ({filteredPatients.length} patients)
                        </span>
                    </h3>

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={fetchPatients}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className={showFilters ? 'bg-cyan-500/20 text-cyan-300' : ''}
                        >
                            <Filter className="w-4 h-4 mr-1" />
                            Filters
                            {hasActiveFilters && (
                                <span className="ml-1 w-2 h-2 rounded-full bg-cyan-500" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={filters.query || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                        placeholder="Search by patient ID, condition, or complaint..."
                        className="w-full pl-10 pr-10 py-3 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 placeholder-slate-500"
                    />
                    {filters.query && (
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, query: undefined }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-obsidian-800/60 rounded-lg border border-obsidian-600/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Risk Level Filter */}
                            <div>
                                <label htmlFor="risk-level-filter" className="block text-sm font-medium text-slate-300 mb-2">
                                    Risk Level
                                </label>
                                <select
                                    id="risk-level-filter"
                                    value={filters.riskLevel || ''}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        riskLevel: e.target.value as PatientSearchFilters['riskLevel'] || undefined,
                                    }))}
                                    className="w-full px-3 py-2 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50"
                                >
                                    <option value="">All Levels</option>
                                    <option value="low">Low Risk</option>
                                    <option value="medium">Medium Risk</option>
                                    <option value="high">High Risk</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            {/* Date From Filter */}
                            <div>
                                <label htmlFor="date-from-filter" className="block text-sm font-medium text-slate-300 mb-2">
                                    From Date
                                </label>
                                <input
                                    id="date-from-filter"
                                    type="date"
                                    value={filters.dateFrom || ''}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateFrom: e.target.value || undefined,
                                    }))}
                                    className="w-full px-3 py-2 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>

                            {/* Date To Filter */}
                            <div>
                                <label htmlFor="date-to-filter" className="block text-sm font-medium text-slate-300 mb-2">
                                    To Date
                                </label>
                                <input
                                    id="date-to-filter"
                                    type="date"
                                    value={filters.dateTo || ''}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateTo: e.target.value || undefined,
                                    }))}
                                    className="w-full px-3 py-2 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>

                            {/* Stats */}
                            <div>
                                <label htmlFor="stats-display" className="block text-sm font-medium text-slate-300 mb-2">
                                    Statistics
                                </label>
                                <div id="stats-display" className="text-sm text-slate-400">
                                    <p>Total: {patients.length}</p>
                                    <p>Filtered: {filteredPatients.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Patient List */}
            <div className="p-4">
                {renderPatientListContent()}
            </div>
        </Card>
    );
};

export default PatientSearch;
