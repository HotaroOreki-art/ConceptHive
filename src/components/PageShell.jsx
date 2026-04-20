import Navbar from "./Navbar.jsx";

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-[#080a09] text-neutral-100">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
