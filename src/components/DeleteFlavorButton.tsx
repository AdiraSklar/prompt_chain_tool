"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteHumorFlavor } from "@/lib/actions/humor-flavors";

type Props = {
  id: number;
  slug: string;
};

export function DeleteFlavorButton({ id, slug }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm(`Delete "${slug}"?\n\nThis will permanently delete the flavor and all its steps. This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deleteHumorFlavor(id);
      if (!result.error) {
        router.push("/humor-flavors");
      }
      // If there's an error (e.g. FK violation), the action itself doesn't
      // currently surface it here — TODO: lift error state if needed
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title="Delete flavor"
      className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
    >
      <TrashIcon />
    </button>
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
