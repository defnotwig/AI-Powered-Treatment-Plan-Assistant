/**
 * Provider Notes Panel Component
 * 
 * Allows healthcare providers to add, view, and manage clinical notes
 * for patients. Supports different note types and privacy settings.
 */

import React, { useState, useMemo } from 'react';
import {
    FileText,
    Clock,
    Plus,
    Send,
    Lock,
    Unlock,
    Stethoscope,
    Calendar,
    MessageSquare,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    User,
    Search,
    Filter,
    X,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button, Card } from '../ui';

// Types
export interface ProviderNote {
    id: string;
    createdAt: string;
    providerId: string;
    providerName: string;
    noteType: 'clinical' | 'follow-up' | 'communication' | 'alert';
    content: string;
    isPrivate: boolean;
}

interface ProviderNotesPanelProps {
    notes: ProviderNote[];
    onAddNote: (note: Omit<ProviderNote, 'id' | 'createdAt'>) => void;
    currentProvider?: {
        id: string;
        name: string;
    };
}

// Note type configuration
const NOTE_TYPES = {
    clinical: {
        label: 'Clinical Note',
        icon: Stethoscope,
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        bgColor: 'bg-cyan-500/5',
    },
    'follow-up': {
        label: 'Follow-up Note',
        icon: Calendar,
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        bgColor: 'bg-emerald-500/5',
    },
    communication: {
        label: 'Communication',
        icon: MessageSquare,
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        bgColor: 'bg-purple-500/5',
    },
    alert: {
        label: 'Alert',
        icon: AlertCircle,
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        bgColor: 'bg-rose-500/5',
    },
};

// Note Item Component
const NoteItem: React.FC<{
    note: ProviderNote;
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ note, isExpanded, onToggle }) => {
    const noteConfig = NOTE_TYPES[note.noteType];
    const Icon = noteConfig.icon;

    return (
        <div className={`rounded-lg border ${noteConfig.bgColor} overflow-hidden transition-all duration-200`}>
            <button
                onClick={onToggle}
                className="w-full p-4 text-left flex items-start gap-4 hover:bg-obsidian-700/30 transition-colors"
            >
                <div className={`p-2 rounded-lg ${noteConfig.color}`}>
                    <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${noteConfig.color}`}>
                            {noteConfig.label}
                        </span>
                        {note.isPrivate && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Private
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-slate-300 line-clamp-2">
                        {note.content}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {note.providerName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(note.createdAt), 'MMM d, yyyy HH:mm')}
                        </span>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                    <div className="ml-12 pl-4 border-l-2 border-obsidian-600/30">
                        <p className="text-sm text-slate-400 whitespace-pre-wrap">
                            {note.content}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Add Note Form Component
const AddNoteForm: React.FC<{
    onSubmit: (note: Omit<ProviderNote, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
    currentProvider?: { id: string; name: string };
}> = ({ onSubmit, onCancel, currentProvider }) => {
    const [noteType, setNoteType] = useState<ProviderNote['noteType']>('clinical');
    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        onSubmit({
            providerId: currentProvider?.id || 'provider-001',
            providerName: currentProvider?.name || 'Dr. Demo Provider',
            noteType,
            content: content.trim(),
            isPrivate,
        });

        setContent('');
        setNoteType('clinical');
        setIsPrivate(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-obsidian-800/60 rounded-lg border border-obsidian-600/30 p-4">
            <h4 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Add New Note
            </h4>

            {/* Note Type Selection */}
            <div className="mb-4">
                <span className="block text-sm font-medium text-slate-300 mb-2">
                    Note Type
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(NOTE_TYPES).map(([type, config]) => {
                        const TypeIcon = config.icon;
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setNoteType(type as ProviderNote['noteType'])}
                                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${noteType === type
                                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                                        : 'border-obsidian-600/30 hover:border-obsidian-500 text-slate-400'
                                    }`}
                            >
                                <TypeIcon className="w-4 h-4 mx-auto mb-1" />
                                {config.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Textarea */}
            <div className="mb-4">
                <label htmlFor="note-content" className="block text-sm font-medium text-slate-300 mb-2">
                    Note Content
                </label>
                <textarea
                    id="note-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your clinical note..."
                    rows={4}
                    className="w-full px-3 py-2 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none placeholder-slate-500"
                    required
                />
            </div>

            {/* Privacy Toggle */}
            <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <button
                        type="button"
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${isPrivate ? 'bg-amber-500' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isPrivate ? 'left-7' : 'left-1'
                                }`}
                        />
                    </button>
                    <span className="text-sm text-slate-300 flex items-center gap-2">
                        {isPrivate ? (
                            <>
                                <Lock className="w-4 h-4 text-amber-600" />
                                Private Note (only visible to you)
                            </>
                        ) : (
                            <>
                                <Unlock className="w-4 h-4 text-slate-500" />
                                Shared Note (visible to care team)
                            </>
                        )}
                    </span>
                </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                    <Send className="w-4 h-4 mr-2" />
                    Add Note
                </Button>
            </div>
        </form>
    );
};

// Main Provider Notes Panel Component
const ProviderNotesPanel: React.FC<ProviderNotesPanelProps> = ({
    notes,
    onAddNote,
    currentProvider,
}) => {
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<ProviderNote['noteType'] | 'all'>('all');

    // Filter and sort notes
    const filteredNotes = useMemo(() => {
        return notes
            .filter(note => {
                // Filter by type
                if (filterType !== 'all' && note.noteType !== filterType) {
                    return false;
                }

                // Filter by search query
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    return (
                        note.content.toLowerCase().includes(query) ||
                        note.providerName.toLowerCase().includes(query)
                    );
                }

                return true;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [notes, filterType, searchQuery]);

    const handleAddNote = (note: Omit<ProviderNote, 'id' | 'createdAt'>) => {
        onAddNote(note);
        setIsAddingNote(false);
    };

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-obsidian-600/30 bg-obsidian-800/40">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        Provider Notes
                        <span className="ml-2 text-sm font-normal text-slate-500">
                            ({notes.length} total)
                        </span>
                    </h3>

                    {!isAddingNote && (
                        <Button
                            onClick={() => setIsAddingNote(true)}
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Note
                        </Button>
                    )}
                </div>

                {/* Search and Filter */}
                {!isAddingNote && notes.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search notes..."
                                className="w-full pl-10 pr-4 py-2 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm placeholder-slate-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                                className="pl-10 pr-8 py-2 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm appearance-none"
                            >
                                <option value="all">All Types</option>
                                <option value="clinical">Clinical</option>
                                <option value="follow-up">Follow-up</option>
                                <option value="communication">Communication</option>
                                <option value="alert">Alert</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Add Note Form */}
                {isAddingNote && (
                    <div className="mb-6">
                        <AddNoteForm
                            onSubmit={handleAddNote}
                            onCancel={() => setIsAddingNote(false)}
                            currentProvider={currentProvider}
                        />
                    </div>
                )}

                {/* Notes List */}
                {filteredNotes.length > 0 ? (
                    <div className="space-y-3">
                        {filteredNotes.map(note => (
                            <NoteItem
                                key={note.id}
                                note={note}
                                isExpanded={expandedNoteId === note.id}
                                onToggle={() => setExpandedNoteId(
                                    expandedNoteId === note.id ? null : note.id
                                )}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-white mb-2">
                            {notes.length === 0 ? 'No Notes Yet' : 'No Matching Notes'}
                        </h4>
                        <p className="text-slate-500 mb-4">
                            {notes.length === 0
                                ? 'Add clinical notes to document patient care.'
                                : 'Try adjusting your search or filter criteria.'}
                        </p>
                        {notes.length === 0 && !isAddingNote && (
                            <Button
                                onClick={() => setIsAddingNote(true)}
                                className="bg-teal-600 hover:bg-teal-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Note
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ProviderNotesPanel;

