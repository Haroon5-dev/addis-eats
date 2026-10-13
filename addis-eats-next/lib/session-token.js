export const SESSION_COOKIE = "addis-eats-session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function secretBytes() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters.");
  }
  return new TextEncoder().encode(value);
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signatureFor(payload) {
  const key = await crypto.subtle.importKey("raw", secretBytes(), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
}

export async function createSessionToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({
    sub: user.id, email: user.email, role: user.role, iat: now, exp: now + SESSION_TTL_SECONDS,
  })));
  return `${payload}.${await signatureFor(payload)}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  try {
    const expected = await signatureFor(payload);
    const expectedBytes = new TextEncoder().encode(expected);
    const actualBytes = new TextEncoder().encode(signature);
    if (expectedBytes.length !== actualBytes.length) return null;
    let difference = 0;
    for (let i = 0; i < expectedBytes.length; i += 1) difference |= expectedBytes[i] ^ actualBytes[i];
    if (difference !== 0) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    const now = Math.floor(Date.now() / 1000);
    if (!data.sub || !data.email || !["customer", "staff", "kitchen"].includes(data.role) || !data.exp || data.exp <= now) return null;
    return { userId: data.sub, email: data.email, role: data.role, expiresAt: data.exp };
  } catch {
    return null;
  }
}

