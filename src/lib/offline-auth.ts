import type { OfflineAuthSession } from "@/lib/db";

const COOKIE_NAME = "sc_offline_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setOfflineSessionCookie(session: OfflineAuthSession) {
  const data = btoa(JSON.stringify(session));
  document.cookie = `${COOKIE_NAME}=${data}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getOfflineSessionFromCookie(cookieHeader: string | null): OfflineAuthSession | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return null;

  try {
    const data = cookie.split("=").slice(1).join("=");
    const session = JSON.parse(atob(data)) as OfflineAuthSession;

    if (!session.id || !session.empresaId || !session.email) return null;

    return session;
  } catch {
    return null;
  }
}

export function clearOfflineSessionCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function clearOfflineSessionCookieServer() {
  return `${COOKIE_NAME}=; path=/; max-age=0`;
}
