import Link from "next/link";
import { requireMatrixAdmin } from "@/lib/auth/requireMatrixAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DeleteFlavorButton } from "@/components/DeleteFlavorButton";
import type { HumorFlavor } from "@/types/db";

export const metadata = { title: "Humor Flavors" };

type HumorFlavorRow = Pick<
  HumorFlavor,
  "id" | "slug" | "description" | "modified_datetime_utc"
>;

export default async function HumorFlavorsPage() {
  await requireMatrixAdmin();

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("humor_flavors")
    .select("id, slug, description, modified_datetime_utc")
    .order("modified_datetime_utc", { ascending: false });

  const flavors: HumorFlavorRow[] = data ?? [];

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 max-w-5xl mx-auto">
        <PageHeader count={0} />
        <p className="text-red-400 text-sm">Failed to load flavors: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 max-w-5xl mx-auto">
      <PageHeader count={flavors.length} />

      {flavors.length === 0 ? (
        <p className="text-zinc-500 text-sm">No humor flavors found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {flavors.map((flavor) => (
            <FlavorCard key={flavor.id} flavor={flavor} />
          ))}
        </div>
      )}
    </main>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

function PageHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          Humor Flavors
        </h1>
        <span className="rounded-full bg-violet-500/15 text-violet-400 text-xs font-semibold px-2.5 py-0.5 border border-violet-500/20">
          {count}
        </span>
      </div>
      <Link
        href="/humor-flavors/new"
        className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 transition"
      >
        + New Flavor
      </Link>
    </div>
  );
}

// ─── Flavor card ──────────────────────────────────────────────────────────────
// Note: <Link> and <DeleteFlavorButton> are siblings, not nested, to keep
// the HTML valid (no interactive elements inside <a>).

function FlavorCard({ flavor }: { flavor: HumorFlavorRow }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col">
      {/* Clickable content area */}
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

      {/* Footer: date + actions */}
      <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-3">
        <p className="text-xs text-zinc-700">
          Modified {new Date(flavor.modified_datetime_utc).toLocaleString()}
        </p>
        <DeleteFlavorButton id={flavor.id} slug={flavor.slug} />
      </div>
    </div>
  );
}