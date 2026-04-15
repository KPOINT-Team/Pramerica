const TOKEN_SERVICE_URL =
  import.meta.env.VITE_TOKEN_SERVICE_URL || "http://localhost:3000";
const SESSION_KEY = "vkyc_auth";

export async function login(clientId, clientSecret) {
  const res = await fetch(`${TOKEN_SERVICE_URL}/api/token/proxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, clientSecret }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Login failed");
  }

  const { token, expiresAt } = await res.json();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, expiresAt, userId: clientId }));
  return { token, expiresAt };
}

export function getUserId() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw).userId || null;
  } catch {
    return null;
  }
}

export function getToken() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const { token, expiresAt } = JSON.parse(raw);
    if (Date.now() >= expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return token;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function isAuthenticated() {
  return getToken() !== null;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function getLiveToken(model, config) {
  const jwt = getToken();
  if (!jwt) throw new Error("Not authenticated");

  const body = { model };
  if (config) body.config = config;

  const res = await fetch(`${TOKEN_SERVICE_URL}/api/token/live`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    logout();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to get live token");
  }

  return await res.json();
}

export async function proxyGenerate(body) {
  const jwt = getToken();
  if (!jwt) throw new Error("Not authenticated");

  const res = await fetch(`${TOKEN_SERVICE_URL}/api/proxy/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    logout();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Proxy call failed");
  }

  return await res.json();
}
