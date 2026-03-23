"use client";

import { useActionState } from "react";
import type { FlavorActionState } from "@/lib/actions/humor-flavors";

type Props = {
  action: (prev: FlavorActionState, formData: FormData) => Promise<FlavorActionState>;
  defaultValues?: {
    id?: number;
    slug?: string;
    description?: string | null;
  };
  submitLabel: string;
};

const initialState: FlavorActionState = { error: null };

export function FlavorForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden ID for update */}
      {defaultValues?.id !== undefined && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {/* Slug */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
          Slug <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="slug"
          required
          defaultValue={defaultValues?.slug ?? ""}
          placeholder="e.g. dry-wit"
          className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 font-mono text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ""}
          placeholder="Optional description of this humor flavor"
          className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition resize-none"
        />
      </div>

      {/* Error */}
      {state.error && (
        <p className="text-red-400 text-sm rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5">
          {state.error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 transition"
      >
        {isPending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
