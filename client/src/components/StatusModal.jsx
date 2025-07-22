export default function StatusModal({ open, onClose, status, progress }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-80 shadow-xl relative">
        <h4 className="text-xl font-bold mb-4 text-primary">Job Status</h4>
        <div className="mb-2">
          <strong>Status:&nbsp;</strong>
          <span>{status}</span>
        </div>
        <div className="mb-4 w-full bg-neutral-800 h-2 rounded">
          <div
            className="bg-primary h-2 rounded transition-all"
            style={{ width: `${progress || 0}%` }}
          />
        </div>
        <button
          className="bg-secondary text-background font-bold py-2 px-4 rounded-lg hover:bg-primary w-full"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
