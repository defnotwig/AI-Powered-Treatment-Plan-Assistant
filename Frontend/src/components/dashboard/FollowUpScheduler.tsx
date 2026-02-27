/**
 * Follow-Up Scheduler Component
 * 
 * Allows providers to schedule and manage patient follow-up appointments,
 * lab reviews, medication reviews, and specialist referrals.
 */

import React, { useState, useMemo } from 'react';
import {
    Calendar,
    Clock,
    Plus,
    Check,
    X,
    AlertCircle,
    ChevronRight,
    Bell,
    Stethoscope,
    FlaskConical,
    Pill,
    UserPlus,
    CalendarDays,
    CheckCircle2,
} from 'lucide-react';
import { format, parseISO, isBefore, addDays, startOfDay } from 'date-fns';
import { Button, Card } from '../ui';

const getFollowUpBorderClass = (isOverdue: boolean, isToday: boolean): string => {
  if (isOverdue) return 'bg-rose-500/10 border-rose-500/30';
  if (isToday) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-obsidian-800/60 border-obsidian-600/30';
};

// Types
export interface ScheduledFollowUp {
    id: string;
    createdAt: string;
    scheduledDate: string;
    type: 'check-up' | 'lab-review' | 'medication-review' | 'specialist-referral';
    description: string;
    completed: boolean;
    completedAt?: string;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
}

type FollowUpOmitFields = 'id' | 'createdAt' | 'completed';

interface FollowUpSchedulerProps {
    followUps: ScheduledFollowUp[];
    onSchedule: (followUp: Omit<ScheduledFollowUp, FollowUpOmitFields>) => void;
    onComplete: (id: string, notes?: string) => void;
    onCancel?: (id: string) => void;
}

// Follow-up type configuration
const FOLLOWUP_TYPES = {
    'check-up': {
        label: 'Check-up',
        icon: Stethoscope,
        color: 'bg-cyan-500/20 text-cyan-300',
        borderColor: 'border-cyan-500/30',
    },
    'lab-review': {
        label: 'Lab Review',
        icon: FlaskConical,
        color: 'bg-purple-500/20 text-purple-300',
        borderColor: 'border-purple-500/30',
    },
    'medication-review': {
        label: 'Medication Review',
        icon: Pill,
        color: 'bg-emerald-500/20 text-emerald-300',
        borderColor: 'border-emerald-500/30',
    },
    'specialist-referral': {
        label: 'Specialist Referral',
        icon: UserPlus,
        color: 'bg-amber-500/20 text-amber-300',
        borderColor: 'border-amber-500/30',
    },
};

// Priority configuration
const PRIORITY_CONFIG = {
    low: { label: 'Low', color: 'bg-obsidian-700/50 text-slate-400' },
    medium: { label: 'Medium', color: 'bg-amber-500/20 text-amber-300' },
    high: { label: 'High', color: 'bg-rose-500/20 text-rose-300' },
};

// Schedule Form Component
const ScheduleForm: React.FC<{
    onSubmit: (followUp: Omit<ScheduledFollowUp, 'id' | 'createdAt' | 'completed'>) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [type, setType] = useState<ScheduledFollowUp['type']>('check-up');
    const [scheduledDate, setScheduledDate] = useState(
        format(addDays(new Date(), 7), 'yyyy-MM-dd')
    );
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSubmit({
            type,
            scheduledDate: new Date(scheduledDate).toISOString(),
            description,
            priority,
        });

        // Reset form
        setType('check-up');
        setScheduledDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
        setDescription('');
        setPriority('medium');
    };

    const minDate = format(new Date(), 'yyyy-MM-dd');

    return (
        <form onSubmit={handleSubmit} className="bg-obsidian-800/60 rounded-lg border border-obsidian-600/30 p-6">
            <h4 className="font-display font-semibold text-white mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-cyan-400" />
                Schedule Follow-Up
            </h4>

            {/* Follow-up Type */}
            <div className="mb-4">
                <span className="block text-sm font-medium text-slate-300 mb-2">
                    Follow-up Type
                </span>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(FOLLOWUP_TYPES).map(([key, config]) => {
                        const Icon = config.icon;
                        const isSelected = type === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setType(key as ScheduledFollowUp['type'])}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                        ? 'border-cyan-500/50 bg-cyan-500/10'
                                        : 'border-obsidian-600/30 hover:border-obsidian-500'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                                <span className={`text-sm font-medium ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                                    {config.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Date Selection */}
            <div className="mb-4">
                <label htmlFor="followup-date" className="block text-sm font-medium text-slate-300 mb-2">
                    Scheduled Date
                </label>
                <input
                    id="followup-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={minDate}
                    className="w-full px-4 py-2 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    required
                />
            </div>

            {/* Priority */}
            <div className="mb-4">
                <span className="block text-sm font-medium text-slate-300 mb-2">
                    Priority
                </span>
                <div className="flex gap-3">
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setPriority(key as typeof priority)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${priority === key
                                    ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-obsidian-900'
                                    : ''
                                } ${config.color}`}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div className="mb-6">
                <label htmlFor="followup-description" className="block text-sm font-medium text-slate-300 mb-2">
                    Description / Instructions
                </label>
                <textarea
                    id="followup-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter any specific instructions or notes for this follow-up..."
                    rows={3}
                    className="w-full px-4 py-2 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none placeholder-slate-500"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                </Button>
            </div>
        </form>
    );
};

// Follow-up Item Component
const FollowUpItem: React.FC<{
    followUp: ScheduledFollowUp;
    onComplete: (id: string, notes?: string) => void;
    onCancel?: (id: string) => void;
}> = ({ followUp, onComplete, onCancel }) => {
    const [showCompleteForm, setShowCompleteForm] = useState(false);
    const [completionNotes, setCompletionNotes] = useState('');

    const config = FOLLOWUP_TYPES[followUp.type];
    const Icon = config.icon;

    const scheduledDate = parseISO(followUp.scheduledDate);
    const today = startOfDay(new Date());
    const isOverdue = isBefore(scheduledDate, today) && !followUp.completed;
    const isToday = format(scheduledDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

    const handleComplete = () => {
        onComplete(followUp.id, completionNotes || undefined);
        setShowCompleteForm(false);
        setCompletionNotes('');
    };

    if (followUp.completed) {
        return (
            <div className="p-4 rounded-lg bg-obsidian-700/30 border border-obsidian-600/20">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                                {config.label}
                            </span>
                            <span className="text-xs text-slate-500">Completed</span>
                        </div>
                        <p className="text-sm text-slate-500 line-through">
                            {followUp.description || `Scheduled for ${format(scheduledDate, 'MMM d, yyyy')}`}
                        </p>
                        {followUp.notes && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                                Note: {followUp.notes}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`p-4 rounded-lg border-2 transition-all ${getFollowUpBorderClass(isOverdue, isToday)}`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                            {config.label}
                        </span>
                        {followUp.priority && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[followUp.priority].color}`}>
                                {PRIORITY_CONFIG[followUp.priority].label} Priority
                            </span>
                        )}
                        {isOverdue && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Overdue
                            </span>
                        )}
                        {isToday && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                Due Today
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-slate-200 mb-2">
                        {followUp.description || 'No description provided'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(scheduledDate, 'MMMM d, yyyy')}
                        </span>
                    </div>

                    {showCompleteForm && (
                        <div className="mt-4 p-3 bg-obsidian-700/50 rounded-lg">
                            <textarea
                                value={completionNotes}
                                onChange={(e) => setCompletionNotes(e.target.value)}
                                placeholder="Add completion notes (optional)..."
                                rows={2}
                                className="w-full px-3 py-2 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none mb-3 placeholder-slate-500"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowCompleteForm(false)}
                                    className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleComplete}
                                    className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    Confirm
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!showCompleteForm && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCompleteForm(true)}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                            title="Mark as completed"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        {onCancel && (
                            <button
                                onClick={() => onCancel(followUp.id)}
                                className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                                title="Cancel follow-up"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Follow-Up Scheduler Component
const FollowUpScheduler: React.FC<FollowUpSchedulerProps> = ({
    followUps,
    onSchedule,
    onComplete,
    onCancel,
}) => {
    const [isScheduling, setIsScheduling] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

    // Filter and categorize follow-ups
    const { overdueFollowUps, todayFollowUps, upcomingFollowUps, completedFollowUps } = useMemo(() => {
        const today = startOfDay(new Date());
        const todayStr = format(today, 'yyyy-MM-dd');

        const overdue: ScheduledFollowUp[] = [];
        const todayItems: ScheduledFollowUp[] = [];
        const upcoming: ScheduledFollowUp[] = [];
        const completed: ScheduledFollowUp[] = [];

        followUps.forEach(fu => {
            if (fu.completed) {
                completed.push(fu);
            } else {
                const scheduledDate = parseISO(fu.scheduledDate);
                const scheduledDateStr = format(scheduledDate, 'yyyy-MM-dd');

                if (isBefore(scheduledDate, today)) {
                    overdue.push(fu);
                } else if (scheduledDateStr === todayStr) {
                    todayItems.push(fu);
                } else {
                    upcoming.push(fu);
                }
            }
        });

        // Sort by date
        overdue.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
        upcoming.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
        completed.sort((a, b) => new Date(b.completedAt || b.scheduledDate).getTime() - new Date(a.completedAt || a.scheduledDate).getTime());

        return {
            overdueFollowUps: overdue,
            todayFollowUps: todayItems,
            upcomingFollowUps: upcoming,
            completedFollowUps: completed,
        };
    }, [followUps]);

    const pendingCount = overdueFollowUps.length + todayFollowUps.length + upcomingFollowUps.length;

    const handleSchedule = (followUp: Omit<ScheduledFollowUp, 'id' | 'createdAt' | 'completed'>) => {
        onSchedule(followUp);
        setIsScheduling(false);
    };

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-obsidian-600/30 bg-obsidian-800/40">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        Follow-Up Scheduler
                        {pendingCount > 0 && (
                            <span className="ml-2 text-sm font-normal bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                                {pendingCount} pending
                            </span>
                        )}
                    </h3>

                    {!isScheduling && (
                        <Button
                            onClick={() => setIsScheduling(true)}
                            size="sm"
                            className="bg-cyan-500 hover:bg-cyan-600 text-obsidian-950"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Schedule
                        </Button>
                    )}
                </div>

                {/* Filter Tabs */}
                {!isScheduling && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'pending'
                                    ? 'bg-cyan-500 text-obsidian-950'
                                    : 'bg-obsidian-700/50 text-slate-400 hover:bg-obsidian-700'
                                }`}
                        >
                            Pending ({pendingCount})
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'completed'
                                    ? 'bg-cyan-500 text-obsidian-950'
                                    : 'bg-obsidian-700/50 text-slate-400 hover:bg-obsidian-700'
                                }`}
                        >
                            Completed ({completedFollowUps.length})
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-cyan-500 text-obsidian-950'
                                    : 'bg-obsidian-700/50 text-slate-400 hover:bg-obsidian-700'
                                }`}
                        >
                            All ({followUps.length})
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Schedule Form */}
                {isScheduling && (
                    <div className="mb-6">
                        <ScheduleForm
                            onSubmit={handleSchedule}
                            onCancel={() => setIsScheduling(false)}
                        />
                    </div>
                )}

                {/* Follow-ups List */}
                {!isScheduling && (
                    <>
                        {/* Overdue Section */}
                        {(filter === 'pending' || filter === 'all') && overdueFollowUps.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Overdue ({overdueFollowUps.length})
                                </h4>
                                <div className="space-y-3">
                                    {overdueFollowUps.map(fu => (
                                        <FollowUpItem
                                            key={fu.id}
                                            followUp={fu}
                                            onComplete={onComplete}
                                            onCancel={onCancel}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Today Section */}
                        {(filter === 'pending' || filter === 'all') && todayFollowUps.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Today ({todayFollowUps.length})
                                </h4>
                                <div className="space-y-3">
                                    {todayFollowUps.map(fu => (
                                        <FollowUpItem
                                            key={fu.id}
                                            followUp={fu}
                                            onComplete={onComplete}
                                            onCancel={onCancel}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Section */}
                        {(filter === 'pending' || filter === 'all') && upcomingFollowUps.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Upcoming ({upcomingFollowUps.length})
                                </h4>
                                <div className="space-y-3">
                                    {upcomingFollowUps.map(fu => (
                                        <FollowUpItem
                                            key={fu.id}
                                            followUp={fu}
                                            onComplete={onComplete}
                                            onCancel={onCancel}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Section */}
                        {(filter === 'completed' || filter === 'all') && completedFollowUps.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Completed ({completedFollowUps.length})
                                </h4>
                                <div className="space-y-3">
                                    {completedFollowUps.slice(0, 5).map(fu => (
                                        <FollowUpItem
                                            key={fu.id}
                                            followUp={fu}
                                            onComplete={onComplete}
                                        />
                                    ))}
                                    {completedFollowUps.length > 5 && (
                                        <button className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 py-2">
                                            View all {completedFollowUps.length} completed
                                            <ChevronRight className="w-4 h-4 inline ml-1" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {filter === 'pending' && pendingCount === 0 && (
                            <div className="text-center py-12">
                                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <h4 className="text-lg font-display font-medium text-white mb-2">
                                    No Pending Follow-ups
                                </h4>
                                <p className="text-slate-400 mb-4">
                                    Schedule a follow-up to keep track of patient care.
                                </p>
                                <Button
                                    onClick={() => setIsScheduling(true)}
                                    className="bg-cyan-500 hover:bg-cyan-600 text-obsidian-950"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Schedule Follow-up
                                </Button>
                            </div>
                        )}

                        {filter === 'completed' && completedFollowUps.length === 0 && (
                            <div className="text-center py-12">
                                <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <h4 className="text-lg font-display font-medium text-white mb-2">
                                    No Completed Follow-ups
                                </h4>
                                <p className="text-slate-400">
                                    Completed follow-ups will appear here.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};

export default FollowUpScheduler;

