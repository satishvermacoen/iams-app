// src/lib/auth-client.js

// Call login API and return { token, user }
export async function loginRequest({ email, password }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Failed to login");
  }

  return data; // { token, user }
}

// Call signup API and return { token, user }
export async function signupRequest({ email, password, fullName, roleName }) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName, roleName }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Failed to signup");
  }

  return data; // { token, user }
}

export function saveAuth(data) {
  if (typeof window === "undefined") return;
  const { token, user } = data;
  localStorage.setItem("token", token);
  localStorage.setItem("userRole", user?.role || "");
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getUserRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userRole");
}

// Map backend role names to dashboard paths
export function roleToDashboardPath(role) {
  if (!role) return "/login";

  if (role === "STUDENT") return "/dashboard/student";
  if (role === "FACULTY") return "/dashboard/faculty";
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "/dashboard/admin";

  // fallback
  return "/dashboard/student";
}
