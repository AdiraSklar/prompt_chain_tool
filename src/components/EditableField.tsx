"use client";

import { useState, useTransition, useRef } from "react";

type Props = {
  value: string | number | null;
  onSave: (newValue: string) => Promise<{ error: string | null }>;
  type?: "text" | "textarea" | "number";
  placeholder?: string;
  emptyLabel?: string;
  displayClassName?: string;
};

export function EditableField({
  value,
  onSave,
  type = "text",
  placeholder,
  emptyLabel = "—",
  displayClassName = "text-sm text-zinc-200",
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  function startEdit() {
    setEditValue(String(value ?? ""));
    setError(null);
    setIsEditing(true);
    // Focus after render
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function cancel() {
    setIsEditing(false);
    setError(null);
  }

  function save() {
    startTransition(async () => {
      const result = await onSave(editValue);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        setError(null);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") cancel();
    if (e.key === "Enter" && type !== "textarea") save();
  }

  if (isEditing) {
    return (
      <div className="space-y-2 w-full">
        {type === "textarea" ? (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={6}
            placeholder={placeholder}
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 font-mono resize-y leading-relaxed"
          />
        ) : (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            step={type === "number" ? "0.1" : undefined}
            min={type === "number" ? "0" : undefined}
            max={type === "number" ? "2" : undefined}
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40"
          />
        )}
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={isPending}
            className="text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-3 py-1.5 disabled:opacity-50 transition"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={cancel}
            disabled={isPending}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-1.5 min-w-0">
      <span className={`${displayClassName} min-w-0`}>
        {value !== null && value !== ""
          ? String(value)
          : <span className="italic text-zinc-600">{emptyLabel}</span>
        }
      </span>
      <button
        onClick={startEdit}
        title="Edit"
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-zinc-500 hover:text-zinc-300"
      >
        <PencilIcon />
      </button>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}