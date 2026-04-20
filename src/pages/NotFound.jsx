import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080a09] px-4 text-neutral-100">
      <section className="max-w-md border border-neutral-800 bg-neutral-950 p-6 text-center">
        <p className="text-sm font-semibold text-amber-300">404</p>
        <h1 className="mt-2 text-3xl font-black">This concept is not connected.</h1>
        <p className="mt-3 text-neutral-400">The page you opened does not exist in this graph.</p>
        <Link
          className="mt-5 inline-flex rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-neutral-950"
          to="/dashboard"
        >
          Go to Dashboard
        </Link>
      </section>
    </main>
  );
}
