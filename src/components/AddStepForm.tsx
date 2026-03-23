"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createHumorFlavorStep } from "@/lib/actions/humor-flavor-steps";

// ─── Lookup types (exported so the page can use them) ─────────────────────────

export type StepTypeLookup = { id: number; slug: string; description: string };
export type ModelLookup = {
  id: number;
  name: string;
  provider_model_id: string;
  providerName: string | null;
};
export type InputTypeLookup = { id: number; slug: string; description: string };
export type OutputTypeLookup = { id: number; slug: string; description: string };

type Props = {
  flavorId: number;
  stepTypes: StepTypeLookup[];
  models: ModelLookup[];
  inputTypes: InputTypeLookup[];
  outputTypes: OutputTypeLookup[];
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AddStepForm({
  flavorId,
  stepTypes,
  models,
  inputTypes,
  outputTypes,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createHumorFlavorStep(flavorId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl border border-dashed border-zinc-700 hover:border-violet-500/50 hover:bg-violet-500/5 text-zinc-500 hover:text-violet-400 text-sm font-medium py-4 transition flex items-center justify-center gap-2"
      >
        <span className="text-lg leading-none">+</span>
        Add Step
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-700 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <span className="text-sm font-semibold text-zinc-200">New Step</span>
        <button
          onClick={() => { setIsOpen(false); setError(null); }}
          className="text-zinc-500 hover:text-zinc-300 transition text-xs"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        {/* Required selects — 2 col grid */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Step Type" required>
            <select name="humor_flavor_step_type_id" required className={selectClass}>
              <option value="">Select…</option>
              {stepTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.slug}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Model" required>
            <select name="llm_model_id" required className={selectClass}>
              <option value="">Select…</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}{m.providerName ? ` (${m.providerName})` : ""}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Input Type" required>
            <select name="llm_input_type_id" required className={selectClass}>
              <option value="">Select…</option>
              {inputTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.slug}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Output Type" required>
            <select name="llm_output_type_id" required className={selectClass}>
              <option value="">Select…</option>
              {outputTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.slug}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Optional fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Description">
            <input
              type="text"
              name="description"
              placeholder="Optional"
              className={inputClass}
            />
          </FormField>

          <FormField label="Temperature">
            <input
              type="number"
              name="llm_temperature"
              placeholder="0.0–2.0"
              step="0.1"
              min="0"
              max="2"
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField label="System Prompt">
          <textarea
            name="llm_system_prompt"
            rows={4}
            placeholder="Optional system prompt…"
            className={`${inputClass} font-mono resize-y`}
          />
        </FormField>

        <FormField label="User Prompt">
          <textarea
            name="llm_user_prompt"
            rows={4}
            placeholder="Optional user prompt…"
            className={`${inputClass} font-mono resize-y`}
          />
        </FormField>

        {error && (
          <p className="text-red-400 text-sm rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 transition"
          >
            {isPending ? "Adding…" : "Add Step"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition";

const selectClass =
  "w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition";
