import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/db";

type GetUserProfileResult =
  | { user: { id: string }; profile: Profile }
  | { user: null; profile: null };

export async function getUserProfile(): Promise<GetUserProfileResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { user: null, profile: null };
  }

  return { user, profile };
}