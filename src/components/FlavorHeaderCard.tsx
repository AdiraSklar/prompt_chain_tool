"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFlavorInline } from "@/lib/actions/humor-flavors";
import { DeleteFlavorButton } from "@/components/DeleteFlavorButton";

type Props = {
  flavor: {
    id: number;
    slug: string;
    description: string | null;
    modified_datetime_utc: string;
  };
};

export function FlavorHeaderCard({ flavor }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [slug, setSlug] = useState(flavor.slug);
  const [description, setDescription] = useState(flavor.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  function startEdit() {
    setSlug(flavor.slug);
    setDescription(flavor.description ?? "");
    setError(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setError(null);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveFlavorInline(flavor.id, slug, description || null);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        router.refresh();
      }
    });
  }

  return (
    <div className={`rounded-2xl border transition-colors ${
      isEditing ? "bg-zinc-900 border-violet-500/40" : "bg-zinc-900 border-zinc-800"
    }`}>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3 px-7 py-4 border-b border-zinc-800">
        <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          {isEditing ? <span className="text-violet-400">Editing</span> : "Humor Flavor"}
        </p>

        {/* Actions — same position always */}
        <div className="flex items-center gap-2">
          <DeleteFlavorButton id={flavor.id} slug={flavor.slug} />
          {isEditing ? (
            <>
              <button
                onClick={cancelEdit}
                disabled={isSaving}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-3 py-1.5 disabled:opacity-50 transition"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-violet-600 border border-zinc-700 hover:border-violet-500 rounded-lg px-3 py-1.5 transition"
            >
              <PencilIcon />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-7 py-5 space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. dry-wit"
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-mono text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional description"
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition resize-none"
              />
            </div>
            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-zinc-100 font-mono tracking-tight">
              {flavor.slug}
            </h1>
            {flavor.description ? (
              <p className="text-sm text-zinc-400 leading-relaxed">{flavor.description}</p>
            ) : (
              <p className="text-sm italic text-zinc-700">No description</p>
            )}
            <p className="text-xs text-zinc-600">
              Last modified: {new Date(flavor.modified_datetime_utc).toLocaleString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}
