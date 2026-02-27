import React, { useState } from 'react';
import { Card, Button, Alert } from '../ui';
import { CheckCircle, XCircle, Edit3, Loader2, MessageSquare } from 'lucide-react';

interface ActionPanelProps {
  treatmentPlanId: string;
  onApprove: (notes: string) => Promise<void>;
  onModify: (modifications: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  treatmentPlanId: _treatmentPlanId,
  onApprove,
  onModify,
  onReject,
  isSubmitting,
}) => {
  const [action, setAction] = useState<'approve' | 'modify' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!action) return;

    setError(null);

    try {
      switch (action) {
        case 'approve':
          await onApprove(notes);
          break;
        case 'modify':
          if (!notes.trim()) {
            setError('Please provide modification details');
            return;
          }
          await onModify(notes);
          break;
        case 'reject':
          if (!notes.trim()) {
            setError('Please provide a reason for rejection');
            return;
          }
          await onReject(notes);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getActionConfig = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Approve Treatment Plan',
          description: 'Confirm that this treatment plan is appropriate and safe for the patient.',
          placeholder: 'Optional: Add any notes or additional instructions...',
          buttonText: 'Confirm Approval',
          buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
          icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
        };
      case 'modify':
        return {
          title: 'Modify Treatment Plan',
          description: 'Specify the changes needed to the treatment plan.',
          placeholder: 'Describe the modifications needed (required)...',
          buttonText: 'Submit Modifications',
          buttonColor: 'bg-teal-600 hover:bg-teal-700',
          icon: <Edit3 className="w-6 h-6 text-teal-500" />,
        };
      case 'reject':
        return {
          title: 'Reject Treatment Plan',
          description: 'This treatment plan will be marked as rejected and not implemented.',
          placeholder: 'Provide reason for rejection (required)...',
          buttonText: 'Confirm Rejection',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: <XCircle className="w-6 h-6 text-red-500" />,
        };
      default:
        return null;
    }
  };

  const config = getActionConfig();

  return (
    <Card className="shadow-lg border border-obsidian-600/30">
      <div className="p-4 border-b border-obsidian-600/30 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10">
        <h3 className="text-lg font-display font-semibold text-white">Clinical Decision</h3>
        <p className="text-sm text-slate-400 mt-1">Review and take action on this treatment plan</p>
      </div>

      <div className="p-4">
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setAction('approve')}
            disabled={isSubmitting}
            className={`p-4 rounded-xl border-2 transition-all ${
              action === 'approve'
                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-md'
                : 'border-obsidian-600/30 hover:border-emerald-500/30 hover:bg-emerald-500/5'
            }`}
          >
            <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${action === 'approve' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <p className={`font-medium ${action === 'approve' ? 'text-emerald-300' : 'text-slate-400'}`}>Approve</p>
          </button>

          <button
            onClick={() => setAction('modify')}
            disabled={isSubmitting}
            className={`p-4 rounded-xl border-2 transition-all ${
              action === 'modify'
                ? 'border-cyan-500/50 bg-cyan-500/10 shadow-md'
                : 'border-obsidian-600/30 hover:border-cyan-500/30 hover:bg-cyan-500/5'
            }`}
          >
            <Edit3 className={`w-8 h-8 mx-auto mb-2 ${action === 'modify' ? 'text-cyan-400' : 'text-slate-500'}`} />
            <p className={`font-medium ${action === 'modify' ? 'text-cyan-300' : 'text-slate-400'}`}>Modify</p>
          </button>

          <button
            onClick={() => setAction('reject')}
            disabled={isSubmitting}
            className={`p-4 rounded-xl border-2 transition-all ${
              action === 'reject'
                ? 'border-rose-500/50 bg-rose-500/10 shadow-md'
                : 'border-obsidian-600/30 hover:border-rose-500/30 hover:bg-rose-500/5'
            }`}
          >
            <XCircle className={`w-8 h-8 mx-auto mb-2 ${action === 'reject' ? 'text-rose-400' : 'text-slate-500'}`} />
            <p className={`font-medium ${action === 'reject' ? 'text-rose-300' : 'text-slate-400'}`}>Reject</p>
          </button>
        </div>

        {/* Action Form */}
        {config && (
          <div className="bg-obsidian-700/50 rounded-xl p-4 border border-obsidian-600/30">
            <div className="flex items-center gap-3 mb-3">
              {config.icon}
              <div>
                <h4 className="font-medium text-white">{config.title}</h4>
                <p className="text-sm text-slate-400">{config.description}</p>
              </div>
            </div>

            {error && (
              <Alert type="error" className="mb-4">
                {error}
              </Alert>
            )}

            <textarea
              className="w-full px-4 py-3 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors mb-4 placeholder-slate-500"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={config.placeholder}
              disabled={isSubmitting}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setAction(null);
                  setNotes('');
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-xl text-white font-medium transition-colors flex items-center gap-2 shadow-lg ${config.buttonColor} disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" /> {config.buttonText}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!action && (
          <div className="text-center text-slate-500 py-4">
            <p>Select an action above to proceed</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActionPanel;
