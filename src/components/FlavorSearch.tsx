"use client";

import { useState } from "react";
import Link from "next/link";
import { DeleteFlavorButton } from "@/components/DeleteFlavorButton";
import { DuplicateFlavorModal } from "@/components/DuplicateFlavorModal";

type Flavor = {
  id: number;
  slug: string;
  description: string | null;
  modified_datetime_utc: string;
};

type DuplicateTarget = { id: number; slug: string } | null;

export function FlavorSearch({ flavors }: { flavors: Flavor[] }) {
  const [query, setQuery] = useState("");
  const [duplicateTarget, setDuplicateTarget] = useState<DuplicateTarget>(null);

  const filtered = query.trim()
    ? flavors.filter(
        (f) =>
          f.slug.toLowerCase().includes(query.toLowerCase()) ||
          (f.description ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : flavors;

  return (
    <>
    {duplicateTarget && (
      <DuplicateFlavorModal
        flavorId={duplicateTarget.id}
        originalSlug={duplicateTarget.slug}
        onClose={() => setDuplicateTarget(null)}
      />
    )}
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search flavors…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          No flavors match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((flavor) => (
            <div
              key={flavor.id}
              className="flavor-card rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-violet-500 hover:ring-2 hover:ring-violet-500/30 hover:scale-[1.03] transition-all duration-150 flex flex-col hover:shadow-lg hover:shadow-violet-900/30"
            >
              <Link
                href={`/humor-flavors/${flavor.id}`}
                className="group flex-1 block px-6 pt-5 pb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-zinc-600 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5">
                    #{flavor.id}
                  </span>
                  <span className="text-base font-semibold font-mono text-zinc-100 group-hover:text-violet-300 transition-colors truncate">
                    {flavor.slug}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                  {flavor.description ?? (
                    <span className="italic text-zinc-700">No description</span>
                  )}
                </p>
              </Link>
              <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-3">
                <p className="text-xs text-zinc-700">
                  Modified {new Date(flavor.modified_datetime_utc).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.preventDefault(); setDuplicateTarget({ id: flavor.id, slug: flavor.slug }); }}
                    title="Duplicate flavor"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 transition"
                  >
                    <DuplicateIcon />
                  </button>
                  <DeleteFlavorButton id={flavor.id} slug={flavor.slug} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}

function DuplicateIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}