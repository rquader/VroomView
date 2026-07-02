import type { Profile } from "@/types";

/**
 * EXAMPLE data-access service (a "repository").
 *
 * THE RULE: components/pages never import a Supabase client directly — they call
 * functions like this. Callers depend on the SIGNATURE, not on where the data
 * comes from. Today the body would use Supabase; tomorrow it could call a
 * Django/Spring API or an AI service and nothing that imports this changes.
 *
 * Wire up the real query after you create the `profiles` table + regenerate the
 * Database types (see lib/supabase/README.md):
 *
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = await createClient();
 *   const { data } = await supabase
 *     .from("profiles")
 *     .select("id, username, display_name, avatar_url, bio, created_at")
 *     .eq("username", username)
 *     .single();
 *   return data ? mapRowToProfile(data) : null;
 */
export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  console.warn(
    `[stub] profilesService.getProfileByUsername("${username}") — no data source wired yet.`,
  );
  return null;
}
