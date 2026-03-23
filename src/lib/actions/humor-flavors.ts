"use server";

import { redirect } from "next/navigation";
import { requireMatrixAdmin } from "@/lib/auth/requireMatrixAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FlavorActionState = {
  error: string | null;
};

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createHumorFlavor(
  _prev: FlavorActionState,
  formData: FormData
): Promise<FlavorActionState> {
  await requireMatrixAdmin();

  const slug = formData.get("slug")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() || null;

  if (!slug) return { error: "Slug is required." };

  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("humor_flavors")
    .insert({ slug, description })
    .select("id")
    .single() as { data: { id: number } | null; error: { code: string; message: string } | null };

  if (error) {
    if (error.code === "23505") return { error: "A flavor with that slug already exists." };
    return { error: error.message };
  }

  redirect(`/humor-flavors/${data!.id}`);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateHumorFlavor(
  _prev: FlavorActionState,
  formData: FormData
): Promise<FlavorActionState> {
  await requireMatrixAdmin();

  const id = Number(formData.get("id"));
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() || null;

  if (!id) return { error: "Missing flavor ID." };
  if (!slug) return { error: "Slug is required." };

  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("humor_flavors")
    .update({ slug, description, modified_datetime_utc: new Date().toISOString() })
    .eq("id", id) as { error: { code: string; message: string } | null };

  if (error) {
    if (error.code === "23505") return { error: "A flavor with that slug already exists." };
    return { error: error.message };
  }

  redirect(`/humor-flavors/${id}`);
}

// ─── Inline update (no redirect — for use with router.refresh()) ──────────────

export async function saveFlavorInline(
  id: number,
  slug: string,
  description: string | null
): Promise<FlavorActionState> {
  await requireMatrixAdmin();

  if (!slug.trim()) return { error: "Slug is required." };

  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("humor_flavors")
    .update({
      slug: slug.trim(),
      description: description || null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id) as { error: { code: string; message: string } | null };

  if (error) {
    if (error.code === "23505") return { error: "A flavor with that slug already exists." };
    return { error: error.message };
  }

  return { error: null };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteHumorFlavor(
  id: number
): Promise<FlavorActionState> {
  await requireMatrixAdmin();

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("humor_flavors")
    .delete()
    .eq("id", id);

  if (error) {
    // FK violation — flavor has attached steps
    if (error.code === "23503") {
      return { error: "Cannot delete: this flavor has existing steps. Remove all steps first." };
    }
    return { error: error.message };
  }

  redirect("/humor-flavors");
}