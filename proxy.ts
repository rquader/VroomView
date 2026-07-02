import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js "proxy" runs before every matched request — this is the layer that was
// called "middleware" before Next 16. Here it keeps the Supabase session fresh;
// later it can also guard protected routes.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on all paths EXCEPT static assets/images (Supabase's recommended matcher).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
