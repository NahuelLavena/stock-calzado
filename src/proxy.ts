import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";
import { getOfflineSessionFromCookie } from "@/lib/offline-auth";

export async function proxy(request: Request) {
  const url = new URL(request.url);

  const supabaseResponse = await updateSession(request as Parameters<typeof updateSession>[0]);

  let user = null;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Supabase unavailable (offline) — try offline session
  }

  const isAuthPage =
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/register");

  if (!user && !isAuthPage) {
    const cookieHeader = request.headers.get("cookie");
    const offlineSession = getOfflineSessionFromCookie(cookieHeader);

    if (!offlineSession) {
      return Response.redirect(new URL("/login", url.origin));
    }
  }

  if (user && isAuthPage) {
    return Response.redirect(new URL("/dashboard", url.origin));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sw\\.js|offline|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
