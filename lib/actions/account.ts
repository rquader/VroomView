"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Account lifecycle actions. Same two-layer model as every write: friendly
 * checks here, the law in Postgres (own-row RLS + the column-scoped UPDATE
 * grant for handles; the auth.uid() guard inside delete_account() for
 * deletion — see the account_identity_and_deletion migration).
 */

export type AccountState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "saved"; username: string };

export async function updateUsernameAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const requested = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(requested)) {
    return {
      status: "error",
      message: "Handles are 3–24 characters of a–z, 0–9, or underscore.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Sign in first." };

  // .select() reports the rows RLS let us touch; 23505 = handle collision
  const { data, error } = await supabase
    .from("profiles")
    .update({ username: requested })
    .eq("id", user.id)
    .select("username")
    .maybeSingle();
  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "That handle is taken — pick another."
          : "The change didn't save — try again.",
    };
  }
  if (!data)
    return { status: "error", message: "The change didn't save — try again." };

  // handles render on every surface (masthead, cards, notes) — refresh all
  revalidatePath("/", "layout");
  return { status: "saved", username: data.username };
}

export async function deleteAccountAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const confirmation = String(formData.get("confirm") ?? "")
    .trim()
    .toLowerCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Sign in first." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile)
    return { status: "error", message: "Deletion didn't go through — try again." };

  // typed confirmation — deliberate friction before an irreversible act
  if (confirmation !== profile.username.toLowerCase()) {
    return {
      status: "error",
      message: "Type your handle exactly to confirm the deletion.",
    };
  }

  // the definer function deletes ONLY the caller's auth row; the FK graph
  // takes the profile, concepts, notes, and votes with it
  const { error } = await supabase.rpc("delete_account");
  if (error)
    return { status: "error", message: "Deletion didn't go through — try again." };

  // server-side sessions are already gone (cascade) — clear this device's
  // cookies so the browser doesn't hold dead tokens
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/");
}
