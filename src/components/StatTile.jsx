export default function StatTile({ label, value, tone = "emerald" }) {
  const toneClass =
    tone === "amber"
      ? "border-amber-400/30 text-amber-200"
      : tone === "rose"
        ? "border-rose-400/30 text-rose-200"
        : "border-emerald-400/30 text-emerald-200";

  return (
    <section className={`border bg-neutral-950 p-5 ${toneClass}`}>
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-neutral-50">{value}</p>
    </section>
  );
}
