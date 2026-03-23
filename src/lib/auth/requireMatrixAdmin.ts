import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import type { Profile } from "@/types/db";

export async function requireMatrixAdmin(): Promise<Profile> {
  const { user, profile } = await getUserProfile();

  if (!user || !profile) {
    redirect("/unauthorized");
  }

  if (!profile.is_superadmin && !profile.is_matrix_admin) {
    redirect("/unauthorized");
  }

  return profile;
}