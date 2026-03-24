import Link from "next/link";
import { requireMatrixAdmin } from "@/lib/auth/requireMatrixAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FlavorSearch } from "@/components/FlavorSearch";
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
      <div className="min-h-screen bg-zinc-950">
        <main className="px-6 py-10 max-w-5xl mx-auto">
          <PageHeader count={0} />
          <p className="text-red-400 text-sm">Failed to load flavors: {error.message}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
    <main className="px-6 py-10 max-w-5xl mx-auto">
      <PageHeader count={flavors.length} />

      {flavors.length === 0 ? (
        <p className="text-zinc-500 text-sm">No humor flavors found.</p>
      ) : (
        <FlavorSearch flavors={flavors} />
      )}
    </main>
    </div>
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
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/humor-flavors/new"
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-semibold px-4 py-2 transition shadow-sm shadow-violet-900/40"
        >
          <span className="text-violet-200 text-base leading-none">+</span>
          New Flavor
        </Link>
        <form action="/logout" method="POST">
          <button
            type="submit"
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 hover:text-zinc-100 text-sm font-medium px-4 py-2 transition"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
