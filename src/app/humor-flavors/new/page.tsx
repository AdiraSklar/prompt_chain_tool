import Link from "next/link";
import { requireMatrixAdmin } from "@/lib/auth/requireMatrixAdmin";
import { FlavorForm } from "@/components/FlavorForm";
import { createHumorFlavor } from "@/lib/actions/humor-flavors";

export const metadata = { title: "New Humor Flavor" };

export default async function NewHumorFlavorPage() {
  await requireMatrixAdmin();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 max-w-xl mx-auto">
      <Link
        href="/humor-flavors"
        className="text-xs text-zinc-600 hover:text-zinc-400 transition mb-6 inline-block"
      >
        ← Back to flavors
      </Link>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-7 py-6">
        <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2">
          New Humor Flavor
        </p>
        <h1 className="text-xl font-bold text-zinc-100 mb-6">Create Flavor</h1>

        <FlavorForm action={createHumorFlavor} submitLabel="Create Flavor" />
      </div>
    </main>
  );
}