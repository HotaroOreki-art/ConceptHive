import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/create", label: "Create Graph" },
];

export default function Navbar() {
  const { backendMode, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-[#080a09]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" to="/create">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-400/40 bg-emerald-400/15 text-lg font-black text-emerald-200">
            C
          </span>
          <span>
            <span className="block text-base font-semibold text-neutral-50">ConceptHive</span>
            <span className="block text-xs text-neutral-400">Knowledge graph builder</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-emerald-400 text-neutral-950"
                    : "text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50"
                }`
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-44 truncate text-sm text-neutral-400 sm:block">
            {user?.displayName || user?.email}
          </span>
          {backendMode === "local" ? (
            <span className="rounded-lg border border-emerald-400/30 px-3 py-2 text-sm text-emerald-200">
              Demo mode
            </span>
          ) : (
            <button
              className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 transition hover:border-rose-300 hover:text-rose-100"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
