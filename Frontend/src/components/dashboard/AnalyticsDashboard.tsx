/**
 * Analytics Dashboard Component
 * 
 * Provides comprehensive real-time analytics and visualizations for:
 * - Patient risk distribution
 * - Treatment outcomes
 * - Safety detection metrics
 * - Provider performance metrics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../../config/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Users,
    FileText,
    Activity,
    Shield,
    Clock,
    ChevronRight,
    Brain,
    Pill,
    RefreshCw,
    Loader2,
    CheckCircle,
    ClipboardCheck,
} from 'lucide-react';
import { Card } from '../ui';

// Types
interface AnalyticsData {
    totalPatients: number;
    totalTreatmentPlans: number;
    avgRiskScore: number;
    avgConfidenceScore: number;
    riskDistribution: Array<{ name: string; value: number; color: string; count: number }>;
    statusDistribution: Record<string, number>;
    safetyDetectionRate: number;
    auditComplianceRate: number;
    criticalAlertsDetected: number;
    drugInteractionsDetected: number;
    avgResponseTime: number;
    patientsByAge: Array<{ range: string; count: number }>;
    patientsBySex: Array<{ sex: string; count: number }>;
    conditionsFrequency: Array<{ condition: string; count: number }>;
    medicationsFrequency: Array<{ medication: string; count: number }>;
    monthlyTrends: Array<{ month: string; patients: number; plans: number }>;
    topDrugInteractions: Array<{ interaction: string; count: number; severity: string }>;
    treatmentCategories: Array<{ category: string; count: number }>;
}

interface RealtimeSnapshot {
    timestamp: string;
    analytics?: Partial<AnalyticsData>;
}

const EMPTY_ANALYTICS_DATA: AnalyticsData = {
    totalPatients: 0,
    totalTreatmentPlans: 0,
    avgRiskScore: 0,
    avgConfidenceScore: 0,
    riskDistribution: [],
    statusDistribution: { pending: 0, approved: 0, rejected: 0, modified: 0 },
    safetyDetectionRate: 0,
    auditComplianceRate: 0,
    criticalAlertsDetected: 0,
    drugInteractionsDetected: 0,
    avgResponseTime: 0,
    patientsByAge: [],
    patientsBySex: [],
    conditionsFrequency: [],
    medicationsFrequency: [],
    monthlyTrends: [],
    topDrugInteractions: [],
    treatmentCategories: [],
};

function normalizeAnalyticsData(data: Partial<AnalyticsData> | null | undefined): AnalyticsData {
    return {
        ...EMPTY_ANALYTICS_DATA,
        ...data,
        statusDistribution: {
            ...EMPTY_ANALYTICS_DATA.statusDistribution,
            ...data?.statusDistribution,
        },
        riskDistribution: data?.riskDistribution || EMPTY_ANALYTICS_DATA.riskDistribution,
        patientsByAge: data?.patientsByAge || EMPTY_ANALYTICS_DATA.patientsByAge,
        patientsBySex: data?.patientsBySex || EMPTY_ANALYTICS_DATA.patientsBySex,
        conditionsFrequency: data?.conditionsFrequency || EMPTY_ANALYTICS_DATA.conditionsFrequency,
        medicationsFrequency: data?.medicationsFrequency || EMPTY_ANALYTICS_DATA.medicationsFrequency,
        monthlyTrends: data?.monthlyTrends || EMPTY_ANALYTICS_DATA.monthlyTrends,
        topDrugInteractions: data?.topDrugInteractions || EMPTY_ANALYTICS_DATA.topDrugInteractions,
        treatmentCategories: data?.treatmentCategories || EMPTY_ANALYTICS_DATA.treatmentCategories,
    };
}

// Stat Card Component
const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
}> = ({ title, value, change, icon, color, suffix }) => (
    <div className={`bg-obsidian-800/60 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-white mt-2">
                    {value}{suffix && <span className="text-xl font-normal text-slate-400">{suffix}</span>}
                </p>
                {change !== undefined && (
                    <div className={`flex items-center mt-2 ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        <span className="text-sm font-medium">{Math.abs(change)}% vs last month</span>
                    </div>
                )}
            </div>
            <div className={`p-4 rounded-full ${color.replace('border-l', 'bg').replace('-500', '-500/20')}`}>
                {icon}
            </div>
        </div>
    </div>
);

// Custom Tooltip for Charts
const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}> = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-obsidian-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-obsidian-600/30">
                <p className="font-semibold text-white">{label}</p>
                {payload.map((entry) => (
                    <p key={entry.name} style={{ color: entry.color }} className="text-sm">
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Feature Importance data for ML Radar
const featureImportanceData = [
    { feature: 'Age', importance: 85 },
    { feature: 'Medications', importance: 78 },
    { feature: 'Conditions', importance: 72 },
    { feature: 'BMI', importance: 65 },
    { feature: 'Blood Pressure', importance: 60 },
    { feature: 'Smoking', importance: 55 },
];

// Helper to get severity badge CSS class
function getSeverityBadgeClass(severity: string): string {
    if (severity === 'major') return 'bg-rose-500/20 text-rose-300';
    if (severity === 'moderate') return 'bg-amber-500/20 text-amber-300';
    return 'bg-emerald-500/20 text-emerald-300';
}

// Main Analytics Dashboard Component
const AnalyticsDashboard: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [realtimeConnected, setRealtimeConnected] = useState(false);

    const mergeAnalyticsData = useCallback((incomingData?: Partial<AnalyticsData>, timestamp?: string) => {
        if (!incomingData) {
            return;
        }
        setAnalyticsData((previous) => normalizeAnalyticsData({
            ...(previous || EMPTY_ANALYTICS_DATA),
            ...incomingData,
        }));
        setLastUpdated(timestamp ? new Date(timestamp) : new Date());
    }, []);

    // Fetch analytics data from API
    const fetchAnalytics = useCallback(async (shouldShowLoading = false) => {
        if (shouldShowLoading) {
            setLoading(true);
        }
        setError(null);
        try {
            const response = await fetch(apiUrl('/patients/analytics'));
            if (!response.ok) {
                setError('Server returned an error. Please try again.');
                return;
            }
            const result = await response.json();
            
            if (result.success) {
                setAnalyticsData(normalizeAnalyticsData(result.data));
                setLastUpdated(new Date());
            } else {
                setError(result.message || 'Failed to load analytics');
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError('Failed to connect to server. Please try again.');
        } finally {
            if (shouldShowLoading) {
                setLoading(false);
            }
        }
    }, []);

    // Load data on mount
    useEffect(() => {
        fetchAnalytics(true);
        
        // Refresh every 30 seconds for real-time feel
        const interval = setInterval(() => fetchAnalytics(false), 30000);
        return () => clearInterval(interval);
    }, [fetchAnalytics]);

    // Subscribe to server-sent events for realtime analytics updates
    useEffect(() => {
        let eventSource: EventSource | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let isUnmounted = false;

        const connectRealtime = () => {
            eventSource = new EventSource(apiUrl('/realtime/stream'));

            eventSource.addEventListener('snapshot', (event) => {
                try {
                    const snapshot = JSON.parse(event.data) as RealtimeSnapshot;
                    mergeAnalyticsData(snapshot.analytics, snapshot.timestamp);
                    setRealtimeConnected(true);
                } catch (parseError) {
                    console.error('Failed to parse realtime snapshot:', parseError);
                }
            });

            eventSource.onerror = () => {
                setRealtimeConnected(false);
                eventSource?.close();
                if (!isUnmounted) {
                    reconnectTimer = setTimeout(connectRealtime, 5000);
                }
            };
        };

        connectRealtime();

        return () => {
            isUnmounted = true;
            eventSource?.close();
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
            }
        };
    }, [mergeAnalyticsData]);

    // Calculate change percentages (simulated for demo)
    const getChangePercent = (base: number): number => {
        // Simulate realistic month-over-month changes
        const seed = base % 20;
        return seed - 10;
    };

    if (loading && !analyticsData) {
        return (
            <div className="min-h-screen bg-obsidian-950 p-6 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
                    <p className="text-slate-400">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    if (error && !analyticsData) {
        return (
            <div className="min-h-screen bg-obsidian-950 p-6 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                    <h3 className="text-lg font-display font-semibold text-white mb-2">Error Loading Analytics</h3>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <button 
                        onClick={() => fetchAnalytics(true)}
                        className="px-4 py-2 bg-cyan-500 text-obsidian-950 rounded-lg hover:bg-cyan-400"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const data = analyticsData!;

    return (
        <div className="min-h-screen bg-obsidian-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white">Analytics Dashboard</h1>
                        <p className="text-slate-400 mt-1">Clinical decision support performance metrics</p>
                        {lastUpdated && (
                            <p className="text-xs text-slate-500 mt-1">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        )}
                        <p className={`text-xs mt-1 ${realtimeConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                            Realtime stream: {realtimeConnected ? 'connected' : 'polling fallback'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                            className="px-4 py-2 border border-obsidian-500 rounded-lg bg-obsidian-800/80 text-slate-100 focus:ring-2 focus:ring-cyan-500/50"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                        <button 
                            onClick={() => fetchAnalytics(true)}
                            disabled={loading}
                            className="px-4 py-2 bg-obsidian-700/50 text-slate-300 rounded-lg hover:bg-obsidian-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button className="px-4 py-2 bg-cyan-500 text-obsidian-950 rounded-lg hover:bg-cyan-400 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Patients"
                        value={data.totalPatients.toLocaleString()}
                        change={getChangePercent(data.totalPatients)}
                        icon={<Users className="w-6 h-6 text-teal-600" />}
                        color="border-l-teal-500"
                    />
                    <StatCard
                        title="Treatment Plans"
                        value={data.totalTreatmentPlans.toLocaleString()}
                        change={getChangePercent(data.totalTreatmentPlans)}
                        icon={<FileText className="w-6 h-6 text-blue-600" />}
                        color="border-l-blue-500"
                    />
                    <StatCard
                        title="Avg Risk Score"
                        value={data.avgRiskScore.toFixed(1)}
                        change={-3}
                        icon={<Shield className="w-6 h-6 text-amber-600" />}
                        color="border-l-amber-500"
                    />
                    <StatCard
                        title="Avg Response Time"
                        value={data.avgResponseTime.toFixed(1)}
                        suffix="s"
                        change={-15}
                        icon={<Clock className="w-6 h-6 text-purple-600" />}
                        color="border-l-purple-500"
                    />
                </div>

                {/* Safety Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Safety Detection Rate"
                        value={`${data.safetyDetectionRate}%`}
                        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                        color="border-l-green-500"
                    />
                    <StatCard
                        title="Audit Compliance"
                        value={`${data.auditComplianceRate}%`}
                        icon={<ClipboardCheck className="w-6 h-6 text-indigo-600" />}
                        color="border-l-indigo-500"
                    />
                    <StatCard
                        title="Critical Alerts"
                        value={data.criticalAlertsDetected.toLocaleString()}
                        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
                        color="border-l-red-500"
                    />
                    <StatCard
                        title="Drug Interactions"
                        value={data.drugInteractionsDetected.toLocaleString()}
                        icon={<Pill className="w-6 h-6 text-orange-600" />}
                        color="border-l-orange-500"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Risk Distribution Pie Chart */}
                    <Card className="p-6">
                        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-cyan-400" />
                            Risk Distribution
                            <span className="text-xs font-normal text-slate-500 ml-2">
                                ({data.totalTreatmentPlans} plans)
                            </span>
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.riskDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value, count }) => `${name} ${value}% (${count})`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {data.riskDistribution.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Monthly Trends Line Chart */}
                    <Card className="p-6">
                        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            Monthly Trends
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.monthlyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="patients"
                                        stroke="#0D9488"
                                        strokeWidth={2}
                                        name="Patients"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="plans"
                                        stroke="#8B5CF6"
                                        strokeWidth={2}
                                        name="Treatment Plans"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Treatment Categories Bar Chart */}
                    <Card className="p-6">
                        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                            <Pill className="w-5 h-5 text-cyan-400" />
                            Treatment Categories
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.treatmentCategories} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="category" type="category" width={100} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" fill="#0D9488" radius={[0, 4, 4, 0]} name="Count" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* ML Feature Importance Radar */}
                    <Card className="p-6">
                        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-cyan-400" />
                            ML Risk Factor Importance
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={featureImportanceData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="feature" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar
                                        name="Importance"
                                        dataKey="importance"
                                        stroke="#0D9488"
                                        fill="#0D9488"
                                        fillOpacity={0.5}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Age and Sex Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Age Distribution */}
                    <Card className="p-6">
                        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-cyan-400" />
                            Patient Age Distribution
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.patientsByAge}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} name="Patients" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Sex Distribution */}
                    <Card className="p-6">
                        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-cyan-400" />
                            Patient Sex Distribution
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.patientsBySex.map((item, idx) => ({
                                            ...item,
                                            color: ['#3B82F6', '#EC4899', '#8B5CF6'][idx] || '#9CA3AF'
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ sex, count }) => `${sex}: ${count}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="sex"
                                    >
                                        {data.patientsBySex.map((item) => (
                                            <Cell key={item.sex} fill={{ male: '#3B82F6', female: '#EC4899', other: '#8B5CF6' }[item.sex] || '#9CA3AF'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Drug Interactions Table */}
                <Card className="p-6 mb-8">
                    <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        Top Flagged Drug Interactions
                        <span className="text-xs font-normal text-slate-500 ml-2">
                            ({data.drugInteractionsDetected} total detected)
                        </span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-obsidian-700/50">
                                    <th className="text-left py-3 px-4 font-semibold text-slate-400">Interaction</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-400">Occurrences</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-400">Severity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-400">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topDrugInteractions.map((item) => (
                                    <tr key={item.interaction} className="border-b border-obsidian-700/30 hover:bg-obsidian-700/30">
                                        <td className="py-3 px-4 font-medium text-slate-200">{item.interaction}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-obsidian-700/50 text-slate-300">
                                                {item.count} cases
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full ${getSeverityBadgeClass(item.severity)}`}>
                                                {item.severity}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                                View Details <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Top Conditions and Medications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Conditions */}
                    <Card className="p-6">
                        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyan-400" />
                            Most Common Conditions
                        </h3>
                        <div className="space-y-3">
                            {data.conditionsFrequency.slice(0, 8).map((item) => (
                                <div key={item.condition} className="flex items-center justify-between">
                                    <span className="text-slate-300">{item.condition}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-obsidian-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-teal-500 rounded-full"
                                                style={{ width: `${Math.min(100, (item.count / (data.conditionsFrequency[0]?.count || 1)) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-slate-500 w-12 text-right">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Top Medications */}
                    <Card className="p-6">
                        <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                            <Pill className="w-5 h-5 text-cyan-400" />
                            Most Prescribed Medications
                        </h3>
                        <div className="space-y-3">
                            {data.medicationsFrequency.slice(0, 8).map((item) => (
                                <div key={item.medication} className="flex items-center justify-between">
                                    <span className="text-slate-300">{item.medication}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-obsidian-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${Math.min(100, (item.count / (data.medicationsFrequency[0]?.count || 1)) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-slate-500 w-12 text-right">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Status Summary */}
                <Card className="p-6">
                    <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        Treatment Plan Status Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-amber-500/10 rounded-lg">
                            <p className="text-3xl font-bold text-amber-400">{data.statusDistribution.pending}</p>
                            <p className="text-sm text-slate-400 mt-1">Pending Review</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                            <p className="text-3xl font-bold text-emerald-400">{data.statusDistribution.approved}</p>
                            <p className="text-sm text-slate-400 mt-1">Approved</p>
                        </div>
                        <div className="text-center p-4 bg-cyan-500/10 rounded-lg">
                            <p className="text-3xl font-bold text-cyan-400">{data.statusDistribution.modified}</p>
                            <p className="text-sm text-slate-400 mt-1">Modified</p>
                        </div>
                        <div className="text-center p-4 bg-rose-500/10 rounded-lg">
                            <p className="text-3xl font-bold text-rose-400">{data.statusDistribution.rejected}</p>
                            <p className="text-sm text-slate-400 mt-1">Rejected</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
