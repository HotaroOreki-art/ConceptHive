import { Link } from "react-router-dom";

export default function SetupNotice() {
  return (
    <div className="border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
      <p className="font-semibold text-amber-200">Local demo mode active</p>
      <p className="mt-1 text-amber-100/90">
        Supabase is not configured, so this browser will use localStorage. Add your
        Supabase URL and anon key later to switch on real login and database storage.
      </p>
      <Link className="mt-3 inline-block text-emerald-200 underline" to="/signup">
        Back to account setup
      </Link>
    </div>
  );
}
