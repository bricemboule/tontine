export const ACCESS_KEY = "tos_access_token";
export const REFRESH_KEY = "tos_refresh_token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(access, refresh) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearStoredTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function tokenExpiresSoon(token, marginSec = 120) {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return payload.exp - Date.now() / 1000 < marginSec;
}

function isJsonBody(body) {
  return body !== undefined &&
    body !== null &&
    typeof body !== "string" &&
    !(body instanceof FormData);
}

async function readError(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const err = await res.json().catch(() => null);
    return err?.detail || err?.message || res.statusText;
  }
  const text = await res.text().catch(() => "");
  return text || res.statusText;
}

export async function apiFetch(path, options = {}) {
  const jsonBody = isJsonBody(options.body);
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(jsonBody ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: jsonBody ? JSON.stringify(options.body) : options.body,
  });
  if (!res.ok) {
    throw new Error((await readError(res)) || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function apiDownload(path, token, options = {}) {
  const jsonBody = isJsonBody(options.body);
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(jsonBody ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: jsonBody ? JSON.stringify(options.body) : options.body,
  });
  if (!res.ok) {
    throw new Error((await readError(res)) || `Erreur ${res.status}`);
  }
  return res;
}
