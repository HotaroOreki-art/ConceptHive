const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80";

export default function AuthShell({ children, eyebrow, title, subtitle }) {
  return (
    <main className="grid min-h-screen bg-[#080a09] text-neutral-100 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold text-emerald-300">{eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black text-neutral-50">{title}</h1>
            <p className="mt-3 text-neutral-400">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>

      <aside className="relative hidden overflow-hidden border-l border-neutral-800 lg:block">
        <img
          alt="Abstract network of connected lights"
          className="h-full w-full object-cover opacity-70"
          src={AUTH_IMAGE}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute bottom-10 left-10 right-10 border border-emerald-400/25 bg-black/55 p-6 backdrop-blur">
          <p className="text-sm text-emerald-200">From scattered notes to connected concepts.</p>
          <p className="mt-3 text-2xl font-semibold text-neutral-50">
            Build a visual map of what you know, then find what needs attention.
          </p>
        </div>
      </aside>
    </main>
  );
}
