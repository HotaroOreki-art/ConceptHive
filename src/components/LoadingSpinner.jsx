export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-3 text-sm text-neutral-300">
      <span className="h-4 w-4 animate-spin rounded-lg border-2 border-neutral-700 border-t-emerald-400" />
      <span>{label}</span>
    </div>
  );
}
