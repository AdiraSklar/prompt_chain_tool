"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type Props = {
  flavorId: number;
  flavorSlug: string;
};

type Status = "idle" | "uploading" | "generating" | "done" | "error";

const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/heic"];

export function GeneratePanel({ flavorId, flavorSlug }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setCaptions([]);
    setError(null);
    setStatus("idle");
  }

  async function handleGenerate() {
    if (!file) return;
    setError(null);
    setCaptions([]);

    try {
      // Step 1 — get presigned upload URL
      setStatus("uploading");
      const presignRes = await fetch("/api/pipeline/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { presignedUrl, cdnUrl } = await presignRes.json();

      // Step 2 — upload file directly to S3
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload image");

      // Step 3 — register image + generate captions via backend
      setStatus("generating");
      const generateRes = await fetch("/api/pipeline/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cdnUrl, humorFlavorId: flavorId, numCaptions: 4 }),
      });
      if (!generateRes.ok) {
        const body = await generateRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Generation failed");
      }
      const { captions: result } = await generateRes.json();
      setCaptions(result);
      setStatus("done");
    } catch (err) {
      setError((err as Error).message);
      setStatus("error");
    }
  }

  const isLoading = status === "uploading" || status === "generating";

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-zinc-100">Generate Captions</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Use the{" "}
          <span className="font-mono text-zinc-400">{flavorSlug}</span> flavor
          pipeline to generate captions for an image.
        </p>
      </div>

      {/* ── Image input ── */}
      <section className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-300">Image</h3>
          <p className="text-xs text-zinc-600 mt-0.5">
            Select an image to caption.
          </p>
        </div>

        <div
          className="m-4 rounded-xl border-2 border-dashed border-zinc-800 overflow-hidden cursor-pointer hover:border-zinc-600 transition"
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <div className="relative w-full aspect-video">
              <Image
                src={preview}
                alt="Selected image"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="px-6 py-10 flex flex-col items-center justify-center gap-3 text-center">
              <ImagePlaceholderIcon />
              <p className="text-sm text-zinc-500 font-medium">
                Click to select an image
              </p>
              <p className="text-xs text-zinc-700">
                JPEG · PNG · WebP · GIF · HEIC
              </p>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      </section>

      {/* ── Generate button ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={!file || isLoading}
          className={`rounded-xl text-sm font-semibold px-5 py-2.5 transition ${
            file && !isLoading
              ? "bg-violet-600 text-white hover:bg-violet-500 cursor-pointer"
              : "bg-violet-600/40 text-violet-400/60 cursor-not-allowed"
          }`}
        >
          {status === "uploading"
            ? "Uploading…"
            : status === "generating"
              ? "Generating…"
              : "Generate Captions"}
        </button>
        {!file && (
          <p className="text-xs text-zinc-700">Select an image above to continue.</p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* ── Results ── */}
      <section className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-300">Results</h3>
            <p className="text-xs text-zinc-600 mt-0.5">
              Generated captions are saved to the Caption Library automatically.
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {captions.length > 0 ? (
          <ul className="divide-y divide-zinc-800">
            {captions.map((caption, i) => (
              <li
                key={i}
                className="px-6 py-4 text-sm text-zinc-200 leading-relaxed"
              >
                {caption}
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 flex flex-col items-center justify-center gap-2 text-center">
            <SparkleIcon />
            <p className="text-sm text-zinc-600">No results yet</p>
            <p className="text-xs text-zinc-700 max-w-xs">
              After generation completes, results will display here and be saved
              to the Caption Library.
            </p>
          </div>
        )}
      </section>

      {/* ── Pipeline reference ── */}
      <section className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4">
          <h3 className="text-sm font-semibold text-zinc-300">Pipeline</h3>
          <p className="text-xs text-zinc-600 mt-0.5">
            This flavor&apos;s steps will run in order when generation is
            triggered. Configure steps in the{" "}
            <a href="?panel=steps" className="text-violet-400 hover:underline">
              Steps panel
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  if (status === "idle")
    return <span className="text-xs text-zinc-700 italic">Idle</span>;
  if (status === "uploading")
    return <span className="text-xs text-amber-400">Uploading…</span>;
  if (status === "generating")
    return <span className="text-xs text-violet-400">Generating…</span>;
  if (status === "done")
    return <span className="text-xs text-emerald-400">Done</span>;
  return <span className="text-xs text-red-400">Error</span>;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ImagePlaceholderIcon() {
  return (
    <svg
      className="w-10 h-10 text-zinc-700"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      className="w-8 h-8 text-zinc-700"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z" />
    </svg>
  );
}
