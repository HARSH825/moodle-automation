export default function DocGeneration({ onGenerate, loading, canGenerate, maxCount }) {
  return (
    <div className="bg-card p-8 rounded-xl flex flex-col items-center">
      <button
        className="bg-primary text-background px-8 py-3 rounded-lg font-bold transition hover:bg-secondary disabled:opacity-50"
        disabled={!canGenerate || loading}
        onClick={onGenerate}
      >
        {loading ? "Generating..." : `Generate (${maxCount} max)`}
      </button>
      {!canGenerate && (
        <p className="mt-3 text-danger text-sm">
          Select at least one assignment (up to {maxCount}) to generate.
        </p>
      )}
    </div>
  );
}
