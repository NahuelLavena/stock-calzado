import { createHmac, timingSafeEqual } from "crypto";
import type { OfflineAuthSession } from "@/lib/db";

const COOKIE_NAME = "sc_offline_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.OFFLINE_SESSION_SECRET;
  if (!secret) throw new Error("OFFLINE_SESSION_SECRET not configured");
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("hex");
}

export function setOfflineSessionCookie(session: OfflineAuthSession) {
  const payload = btoa(JSON.stringify(session));
  const signature = sign(payload);
  const data = `${payload}.${signature}`;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(data)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getOfflineSessionFromCookie(cookieHeader: string | null): OfflineAuthSession | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return null;

  try {
    const encoded = cookie.split("=").slice(1).join("=");
    const data = decodeURIComponent(encoded);
    const lastDot = data.lastIndexOf(".");
    if (lastDot === -1) return null;

    const payload = data.slice(0, lastDot);
    const receivedSig = data.slice(lastDot + 1);
    const expectedSig = sign(payload);

    // Timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(receivedSig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const session = JSON.parse(atob(payload)) as OfflineAuthSession;

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
