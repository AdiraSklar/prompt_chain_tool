import { notFound } from "next/navigation";
import { requireMatrixAdmin } from "@/lib/auth/requireMatrixAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { StepsPanel } from "./_panels/StepsPanel";
import { CaptionLibraryPanel } from "./_panels/CaptionLibraryPanel";
import { GeneratePanel } from "./_panels/GeneratePanel";

export const metadata = { title: "Humor Flavor Workspace" };

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ panel?: string }>;
};

type Panel = "steps" | "library" | "generate";

function resolvePanel(raw: string | undefined): Panel {
  if (raw === "library" || raw === "generate") return raw;
  return "steps";
}

export default async function HumorFlavorWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  await requireMatrixAdmin();

  const [{ id }, { panel: rawPanel }] = await Promise.all([params, searchParams]);

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const activePanel = resolvePanel(rawPanel);

  // Fetch flavor — always needed (sidebar + all panels)
  const supabase = await createSupabaseServerClient();
  const { data: flavor, error: flavorError } = await supabase
    .from("humor_flavors")
    .select("id, slug, description, modified_datetime_utc")
    .eq("id", numericId)
    .single();

  if (flavorError?.code === "PGRST116" || !flavor) notFound();

  const f = flavor as {
    id: number;
    slug: string;
    description: string | null;
    modified_datetime_utc: string;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-zinc-950">
      <WorkspaceSidebar
        flavorId={numericId}
        flavorSlug={f.slug}
        activePanel={activePanel}
      />

      <main className="flex-1 overflow-y-auto">
        {activePanel === "steps" && (
          <StepsPanel flavor={f} />
        )}
        {activePanel === "library" && (
          <CaptionLibraryPanel flavorId={numericId} />
        )}
        {activePanel === "generate" && (
          <GeneratePanel flavorId={numericId} flavorSlug={f.slug} />
        )}
      </main>
    </div>
  );
}