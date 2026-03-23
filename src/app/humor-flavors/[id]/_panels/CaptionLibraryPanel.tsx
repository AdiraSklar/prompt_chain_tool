import { createSupabaseServerClient } from "@/lib/supabase/server";
import Image from "next/image";

type CaptionRow = {
  id: string;
  content: string | null;
  is_public: boolean;
  is_featured: boolean;
  like_count: number;
  created_datetime_utc: string;
  images: {
    url: string | null;
    image_description: string | null;
  } | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

type Props = { flavorId: number };

export async function CaptionLibraryPanel({ flavorId }: Props) {
  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("captions")
    .select(`
      id,
      content,
      is_public,
      is_featured,
      like_count,
      created_datetime_utc,
      images ( url, image_description ),
      profiles!profile_id ( first_name, last_name )
    `)
    .eq("humor_flavor_id", flavorId)
    .order("created_datetime_utc", { ascending: false })
    .limit(100) as { data: CaptionRow[] | null; error: { message: string } | null };

  const captions = data ?? [];

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto w-full">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-bold text-zinc-100">Caption Library</h2>
        <span className="rounded-full bg-violet-500/15 text-violet-400 text-xs font-semibold px-2.5 py-0.5 border border-violet-500/20">
          {captions.length}
        </span>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-6">
          Failed to load captions: {error.message}
        </p>
      )}

      {captions.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-16 flex flex-col items-center justify-center text-center">
          <p className="text-zinc-500 text-sm font-medium">No captions yet</p>
          <p className="text-zinc-700 text-xs mt-1">
            Generated captions for this flavor will appear here.
          </p>
        </div>
      )}

      {captions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {captions.map((caption) => (
            <CaptionCard key={caption.id} caption={caption} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Caption card ─────────────────────────────────────────────────────────────

function CaptionCard({ caption }: { caption: CaptionRow }) {
  const imageUrl = caption.images?.url ?? null;
  const generatedBy = formatName(caption.profiles);

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-zinc-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={caption.images?.image_description ?? "Caption image"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-zinc-700 text-xs italic">No image</span>
          </div>
        )}

        {/* Featured badge */}
        {caption.is_featured && (
          <div className="absolute top-2 left-2">
            <span className="rounded-full bg-amber-500/90 text-black text-xs font-bold px-2 py-0.5">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Caption text */}
      <div className="px-4 py-3 flex-1">
        {caption.content ? (
          <p className="text-sm text-zinc-200 leading-relaxed">{caption.content}</p>
        ) : (
          <p className="text-sm italic text-zinc-600">No caption text</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          {/* Like count */}
          <span className="flex items-center gap-1">
            <LikeIcon count={caption.like_count} />
            {caption.like_count}
          </span>
          {/* Visibility */}
          <span className={caption.is_public ? "text-emerald-600" : "text-zinc-700"}>
            {caption.is_public ? "Public" : "Private"}
          </span>
        </div>
        <div className="text-xs text-zinc-700 text-right">
          {generatedBy && <p>{generatedBy}</p>}
          <p>{new Date(caption.created_datetime_utc).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatName(profile: { first_name: string | null; last_name: string | null } | null) {
  if (!profile) return null;
  const parts = [profile.first_name, profile.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

function LikeIcon({ count }: { count: number }) {
  if (count < 0) {
    return (
      <svg className="w-3 h-3 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 21c-.55 0-1-.45-1-1v-8H3.56C2.07 12 1.25 10.27 2.18 9.12l5.5-7A1 1 0 018.5 1.7H19a1 1 0 011 1v9a1 1 0 01-1 1h-2.84L12 20.44c-.19.36-.56.56-.97.56H9zM19 11V4h-1v7h1z" />
      </svg>
    );
  }
  if (count === 0) {
    return (
      <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}