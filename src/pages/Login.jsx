import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import SetupNotice from "../components/SetupNotice.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { supabaseReady, login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    }
  }, [location.state, navigate, user]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      subtitle="Sign in to continue building and revising your concept maps."
      title="Open your knowledge hive."
    >
      {!supabaseReady && <SetupNotice />}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-neutral-300">Email</span>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-50 placeholder:text-neutral-600"
            name="email"
            onChange={handleChange}
            placeholder="you@example.com"
            required
            type="email"
            value={form.email}
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-300">Password</span>
          <input
            autoComplete="current-password"
            className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-50 placeholder:text-neutral-600"
            minLength={6}
            name="password"
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
            type="password"
            value={form.password}
          />
        </label>

        {error && (
          <p className="border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>
        )}

        <button
          className="flex w-full items-center justify-center rounded-lg bg-emerald-400 px-4 py-3 font-bold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? <LoadingSpinner label="Signing in" /> : "Login"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-400">
        New here?{" "}
        <Link className="font-semibold text-emerald-300 hover:text-emerald-200" to="/signup">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
