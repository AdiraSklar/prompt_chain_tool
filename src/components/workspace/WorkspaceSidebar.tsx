import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

type Panel = "steps" | "library" | "generate";

type Props = {
  flavorId: number;
  flavorSlug: string;
  activePanel: Panel;
};

const navItems: { panel: Panel; label: string; icon: React.FC }[] = [
  { panel: "steps",    label: "Steps",           icon: StepsIcon },
  { panel: "library",  label: "Caption Library",  icon: LibraryIcon },
  { panel: "generate", label: "Generate",          icon: GenerateIcon },
];

export function WorkspaceSidebar({ flavorId, flavorSlug, activePanel }: Props) {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col">
      {/* Header — flavor name + back link */}
      <div className="px-4 pt-5 pb-4 border-b border-zinc-800">
        <Link
          href="/humor-flavors"
          className="text-xs text-zinc-500 hover:text-zinc-200 transition"
        >
          ← All Flavors
        </Link>
        <p className="mt-2 text-sm font-bold text-zinc-100 font-mono truncate" title={flavorSlug}>
          {flavorSlug}
        </p>
        <p className="mt-0.5 text-xs text-zinc-600">Humor Flavor</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ panel, label, icon: Icon }) => (
          <Link
            key={panel}
            href={`/humor-flavors/${flavorId}?panel=${panel}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activePanel === panel
                ? "bg-violet-600/25 text-violet-200 border border-violet-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:bg-zinc-700 border border-transparent"
            }`}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>

      {/* Theme toggle + sign out */}
      <div className="px-3 py-3 border-t border-zinc-800 flex items-center justify-between gap-2">
        <ThemeToggle />
        <form action="/logout" method="POST">
          <button
            type="submit"
            title="Sign out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 active:bg-zinc-700 transition"
          >
            <SignOutIcon />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function StepsIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function GenerateIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z" />
    </svg>
  );
}