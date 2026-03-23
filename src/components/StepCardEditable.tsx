"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateHumorFlavorStep,
  deleteHumorFlavorStep,
  reorderHumorFlavorStep,
} from "@/lib/actions/humor-flavor-steps";
import type {
  StepTypeLookup,
  ModelLookup,
  InputTypeLookup,
  OutputTypeLookup,
} from "@/components/AddStepForm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StepRow = {
  id: number;
  order_by: number;
  description: string | null;
  llm_temperature: number | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  humor_flavor_step_type_id: number;
  llm_model_id: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  humor_flavor_step_types: { slug: string; description: string } | null;
  llm_models: {
    name: string;
    provider_model_id: string;
    llm_providers: { name: string } | null;
  } | null;
  llm_input_types: { slug: string; description: string } | null;
  llm_output_types: { slug: string; description: string } | null;
};

type Props = {
  step: StepRow;
  flavorId: number;
  isFirst: boolean;
  isLast: boolean;
  stepTypes: StepTypeLookup[];
  models: ModelLookup[];
  inputTypes: InputTypeLookup[];
  outputTypes: OutputTypeLookup[];
};

// ─── Component ────────────────────────────────────────────────────────────────

export function StepCardEditable({
  step,
  flavorId,
  isFirst,
  isLast,
  stepTypes,
  models,
  inputTypes,
  outputTypes,
}: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isReordering, startReorderTransition] = useTransition();

  const [form, setForm] = useState({
    description: step.description ?? "",
    llm_temperature: step.llm_temperature?.toString() ?? "",
    llm_system_prompt: step.llm_system_prompt ?? "",
    llm_user_prompt: step.llm_user_prompt ?? "",
    humor_flavor_step_type_id: step.humor_flavor_step_type_id,
    llm_model_id: step.llm_model_id,
    llm_input_type_id: step.llm_input_type_id,
    llm_output_type_id: step.llm_output_type_id,
  });

  function startEdit() {
    setForm({
      description: step.description ?? "",
      llm_temperature: step.llm_temperature?.toString() ?? "",
      llm_system_prompt: step.llm_system_prompt ?? "",
      llm_user_prompt: step.llm_user_prompt ?? "",
      humor_flavor_step_type_id: step.humor_flavor_step_type_id,
      llm_model_id: step.llm_model_id,
      llm_input_type_id: step.llm_input_type_id,
      llm_output_type_id: step.llm_output_type_id,
    });
    setSaveError(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setSaveError(null);
  }

  function handleSave() {
    setSaveError(null);
    startSaveTransition(async () => {
      const result = await updateHumorFlavorStep(step.id, {
        description: form.description.trim() || null,
        llm_temperature: form.llm_temperature !== "" ? Number(form.llm_temperature) : null,
        llm_system_prompt: form.llm_system_prompt.trim() || null,
        llm_user_prompt: form.llm_user_prompt.trim() || null,
        humor_flavor_step_type_id: form.humor_flavor_step_type_id,
        llm_model_id: form.llm_model_id,
        llm_input_type_id: form.llm_input_type_id,
        llm_output_type_id: form.llm_output_type_id,
      });
      if (result.error) {
        setSaveError(result.error);
      } else {
        setIsEditing(false);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete step #${step.order_by}? This cannot be undone.`)) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteHumorFlavorStep(step.id);
      if (result.error) setDeleteError(result.error);
      else router.refresh();
    });
  }

  function handleReorder(direction: "up" | "down") {
    startReorderTransition(async () => {
      await reorderHumorFlavorStep(step.id, direction, flavorId);
      router.refresh();
    });
  }

  const stepType = step.humor_flavor_step_types;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-colors ${
      isEditing ? "bg-zinc-900 border-violet-500/40" : "bg-zinc-900 border-zinc-800"
    }`}>
      <div className="flex">
        {/* ── Reorder column ── */}
        <div className="flex flex-col items-center justify-between gap-1 px-3 py-4 border-r border-zinc-800 bg-zinc-950/40">
          <button
            onClick={() => handleReorder("up")}
            disabled={isFirst || isReordering}
            title="Move up"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-violet-600 disabled:opacity-20 disabled:cursor-not-allowed transition"
          >
            <ChevronUpIcon />
          </button>
          <span className="text-xs font-bold text-zinc-500 tabular-nums select-none">
            {step.order_by}
          </span>
          <button
            onClick={() => handleReorder("down")}
            disabled={isLast || isReordering}
            title="Move down"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-violet-600 disabled:opacity-20 disabled:cursor-not-allowed transition"
          >
            <ChevronDownIcon />
          </button>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* ── Top bar: identifier + actions (consistent position) ── */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-zinc-800">
            {/* Left: description + type pill (read) or "Editing" label */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {isEditing ? (
                <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">
                  Editing
                </span>
              ) : (
                <>
                  {step.description && (
                    <span className="text-sm font-semibold text-zinc-100 truncate">
                      {step.description}
                    </span>
                  )}
                  {stepType && <Pill variant="zinc">{stepType.slug}</Pill>}
                  {!step.description && !stepType && (
                    <span className="text-sm italic text-zinc-600">Untitled step</span>
                  )}
                </>
              )}
            </div>

            {/* Right: trash + Edit OR Save + Cancel — always same position */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <TrashButton
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                label={isDeleting ? "Deleting…" : undefined}
              />
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
          {isEditing
            ? <EditBody
                form={form}
                setForm={setForm}
                stepTypes={stepTypes}
                models={models}
                inputTypes={inputTypes}
                outputTypes={outputTypes}
                saveError={saveError}
                deleteError={deleteError}
              />
            : <ReadBody step={step} />
          }
        </div>
      </div>
    </div>
  );
}

// ─── Read body ────────────────────────────────────────────────────────────────

function ReadBody({ step }: { step: StepRow }) {
  const model = step.llm_models;
  const provider = model?.llm_providers;
  const inputType = step.llm_input_types;
  const outputType = step.llm_output_types;

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="flex flex-wrap items-start gap-6">
        <div className="space-y-0.5">
          <MetaLabel>Model</MetaLabel>
          <p className="text-zinc-200 text-sm font-medium">{model?.name ?? "—"}</p>
          {model?.provider_model_id && (
            <p className="text-zinc-500 text-xs font-mono">{model.provider_model_id}</p>
          )}
          {provider?.name && (
            <p className="text-zinc-600 text-xs">{provider.name}</p>
          )}
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          {inputType && (
            <div>
              <MetaLabel>Input</MetaLabel>
              <Pill variant="blue">{inputType.slug}</Pill>
            </div>
          )}
          {inputType && outputType && (
            <span className="text-zinc-600 text-sm mb-0.5">→</span>
          )}
          {outputType && (
            <div>
              <MetaLabel>Output</MetaLabel>
              <Pill variant="emerald">{outputType.slug}</Pill>
            </div>
          )}
          {step.llm_temperature !== null && (
            <div>
              <MetaLabel>Temp</MetaLabel>
              <Pill variant="amber">{step.llm_temperature}</Pill>
            </div>
          )}
        </div>
      </div>

      {step.llm_system_prompt && (
        <PromptPanel label="System Prompt" content={step.llm_system_prompt} />
      )}
      {step.llm_user_prompt && (
        <PromptPanel label="User Prompt" content={step.llm_user_prompt} />
      )}
    </div>
  );
}

// ─── Edit body ────────────────────────────────────────────────────────────────

type FormState = {
  description: string;
  llm_temperature: string;
  llm_system_prompt: string;
  llm_user_prompt: string;
  humor_flavor_step_type_id: number;
  llm_model_id: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
};

function EditBody({
  form,
  setForm,
  stepTypes,
  models,
  inputTypes,
  outputTypes,
  saveError,
  deleteError,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  stepTypes: StepTypeLookup[];
  models: ModelLookup[];
  inputTypes: InputTypeLookup[];
  outputTypes: OutputTypeLookup[];
  saveError: string | null;
  deleteError: string | null;
}) {
  const fkFields = ["humor_flavor_step_type_id", "llm_model_id", "llm_input_type_id", "llm_output_type_id"];

  function field(name: keyof FormState) {
    return {
      value: String(form[name]),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const val = fkFields.includes(name) ? Number(e.target.value) : e.target.value;
        setForm((prev) => ({ ...prev, [name]: val }));
      },
    };
  }

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Step Type" required>
          <select {...field("humor_flavor_step_type_id")} className={selectClass}>
            {stepTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.slug}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Model" required>
          <select {...field("llm_model_id")} className={selectClass}>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}{m.providerName ? ` (${m.providerName})` : ""}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Input Type" required>
          <select {...field("llm_input_type_id")} className={selectClass}>
            {inputTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.slug}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Output Type" required>
          <select {...field("llm_output_type_id")} className={selectClass}>
            {outputTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.slug}</option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Description">
          <input type="text" placeholder="Step description" {...field("description")} className={inputClass} />
        </FormField>
        <FormField label="Temperature">
          <input type="number" placeholder="0.0–2.0" step="0.1" min="0" max="2" {...field("llm_temperature")} className={inputClass} />
        </FormField>
      </div>

      <FormField label="System Prompt">
        <textarea rows={5} placeholder="System prompt…" {...field("llm_system_prompt")} className={`${inputClass} font-mono resize-y`} />
      </FormField>

      <FormField label="User Prompt">
        <textarea rows={5} placeholder="User prompt…" {...field("llm_user_prompt")} className={`${inputClass} font-mono resize-y`} />
      </FormField>

      {(saveError || deleteError) && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {saveError ?? deleteError}
        </p>
      )}
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

export function TrashButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label ?? "Delete"}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
    >
      <TrashIcon />
    </button>
  );
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-1">
      {children}
    </p>
  );
}

type PillVariant = "zinc" | "violet" | "blue" | "emerald" | "amber";
const pillStyles: Record<PillVariant, string> = {
  zinc:    "bg-zinc-800 text-zinc-300 border-zinc-700",
  violet:  "bg-violet-500/15 text-violet-400 border-violet-500/20",
  blue:    "bg-blue-500/15 text-blue-400 border-blue-500/20",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  amber:   "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

function Pill({ children, variant = "zinc" }: { children: React.ReactNode; variant?: PillVariant }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${pillStyles[variant]}`}>
      {children}
    </span>
  );
}

function PromptPanel({ label, content }: { label: string; content: string }) {
  return (
    <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      <pre className="px-4 py-3 text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
        {content}
      </pre>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
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

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

const inputClass = "w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition";
const selectClass = "w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition";
