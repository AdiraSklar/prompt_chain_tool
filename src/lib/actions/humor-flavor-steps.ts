"use server";

import { requireMatrixAdmin } from "@/lib/auth/requireMatrixAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionResult = { error: string | null };

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createHumorFlavorStep(
  flavorId: number,
  formData: FormData
): Promise<ActionResult> {
  await requireMatrixAdmin();

  const stepTypeId = Number(formData.get("humor_flavor_step_type_id"));
  const modelId = Number(formData.get("llm_model_id"));
  const inputTypeId = Number(formData.get("llm_input_type_id"));
  const outputTypeId = Number(formData.get("llm_output_type_id"));
  const description = formData.get("description")?.toString().trim() || null;
  const temperatureRaw = formData.get("llm_temperature")?.toString().trim();
  const systemPrompt = formData.get("llm_system_prompt")?.toString().trim() || null;
  const userPrompt = formData.get("llm_user_prompt")?.toString().trim() || null;

  if (!stepTypeId || !modelId || !inputTypeId || !outputTypeId) {
    return { error: "Step type, model, input type, and output type are all required." };
  }

  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Compute next order_by
  const { data: maxRow } = await db
    .from("humor_flavor_steps")
    .select("order_by")
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder: number = (maxRow?.order_by ?? 0) + 1;

  const { error } = await db.from("humor_flavor_steps").insert({
    humor_flavor_id: flavorId,
    order_by: nextOrder,
    humor_flavor_step_type_id: stepTypeId,
    llm_model_id: modelId,
    llm_input_type_id: inputTypeId,
    llm_output_type_id: outputTypeId,
    description,
    llm_temperature: temperatureRaw ? Number(temperatureRaw) : null,
    llm_system_prompt: systemPrompt,
    llm_user_prompt: userPrompt,
  });

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Update all editable fields at once ──────────────────────────────────────

export type StepUpdatePayload = {
  description: string | null;
  llm_temperature: number | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  humor_flavor_step_type_id: number;
  llm_model_id: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
};

export async function updateHumorFlavorStep(
  stepId: number,
  payload: StepUpdatePayload
): Promise<ActionResult> {
  await requireMatrixAdmin();

  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("humor_flavor_steps")
    .update({ ...payload, modified_datetime_utc: new Date().toISOString() })
    .eq("id", stepId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteHumorFlavorStep(stepId: number): Promise<ActionResult> {
  await requireMatrixAdmin();

  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db.from("humor_flavor_steps").delete().eq("id", stepId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Reorder (swap order_by with neighbor) ────────────────────────────────────

export async function reorderHumorFlavorStep(
  stepId: number,
  direction: "up" | "down",
  flavorId: number
): Promise<ActionResult> {
  await requireMatrixAdmin();

  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: steps, error: fetchError } = await db
    .from("humor_flavor_steps")
    .select("id, order_by")
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: true })
    .order("id", { ascending: true });

  if (fetchError) return { error: fetchError.message };

  const idx = (steps as { id: number; order_by: number }[]).findIndex(
    (s) => s.id === stepId
  );
  if (idx === -1) return { error: "Step not found." };

  const neighborIdx = direction === "up" ? idx - 1 : idx + 1;
  if (neighborIdx < 0 || neighborIdx >= steps.length) return { error: null }; // already at boundary

  const current = steps[idx] as { id: number; order_by: number };
  const neighbor = steps[neighborIdx] as { id: number; order_by: number };

  // Swap order_by values — two sequential updates (no transaction support in JS client)
  const { error: e1 } = await db
    .from("humor_flavor_steps")
    .update({ order_by: neighbor.order_by })
    .eq("id", current.id);
  if (e1) return { error: e1.message };

  const { error: e2 } = await db
    .from("humor_flavor_steps")
    .update({ order_by: current.order_by })
    .eq("id", neighbor.id);
  if (e2) return { error: e2.message };

  return { error: null };
}
