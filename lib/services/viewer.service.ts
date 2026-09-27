import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

/**
 * Who is looking at the page? `getUser()` revalidates the session token with
 * Supabase's auth server (never trust the cookie alone — see 16 - Security),
 * then we attach the public profile. Null means "a guest", which is a normal,
 * fully-supported state everywhere in the app.
 */
export type Viewer = {
  id: string;
  username: string;
  displayName: string | null;
} | null;

// React's server cache is request-scoped: concurrent service reads share the
// verified identity without retaining a user across requests or sessions.
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", user.id)
    .maybeSingle();

  // A user without a profile shouldn't happen (the DB trigger creates one),
  // but degrade gracefully rather than crash the shell.
  if (!profile) return { id: user.id, username: "driver", displayName: null };

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
  };
});
