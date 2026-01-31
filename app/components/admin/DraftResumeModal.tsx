import { X, Clock, FileText } from 'lucide-react';

interface DraftItem {
  id: string;
  title?: string;
  updatedAt?: string;
  completionStep?: number;
  isLocal?: boolean;
}

interface DraftResumeModalProps {
  isOpen: boolean;
  drafts: DraftItem[];
  onSelectDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string, isLocal?: boolean) => void;
  onStartNew: () => void;
  onClose: () => void;
}

const formatUpdatedAt = (value?: string) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
};

export default function DraftResumeModal({
  isOpen,
  drafts,
  onSelectDraft,
  onDeleteDraft,
  onStartNew,
  onClose,
}: DraftResumeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Resume Draft</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-sm text-gray-400">
            Select a draft to resume, or start a new service.
          </p>

          {drafts.length === 0 ? (
            <div className="p-4 rounded-lg border border-gray-700 bg-gray-900 text-gray-400">
              No drafts available.
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="w-full p-4 rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onSelectDraft(draft.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gray-800 text-gray-300">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-white">
                            {draft.title || 'Untitled Draft'}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            Last updated {formatUpdatedAt(draft.updatedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Step {typeof draft.completionStep === 'number' ? draft.completionStep + 1 : 1}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center justify-end gap-3 mt-4">
                  <span className="text-xs text-gray-500">
                    {draft.isLocal ? 'Local' : 'Server'}
                  </span>
                    <button
                      type="button"
                      onClick={() => onDeleteDraft(draft.id, draft.isLocal)}
                      className="px-3 py-1.5 text-xs text-red-300 border border-red-500/40 rounded-md hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-900">
          <button
            type="button"
            onClick={onStartNew}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Start New
          </button>
        </div>
      </div>
    </div>
  );
}
