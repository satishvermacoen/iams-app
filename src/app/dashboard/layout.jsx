// src/app/dashboard/layout.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getToken, clearAuth, roleToDashboardPath } from "@/lib/auth-client";

const navItems = [
  { href: "/dashboard/student", label: "Student" },
  { href: "/dashboard/student/my-timetable", label: "Timetable" },
  { href: "/dashboard/student/my-timetable", label: "Timetable" },
  { href: "/dashboard/student/results", label: "Results" },
  { href: "/dashboard/faculty", label: "Faculty" },
  { href: "/dashboard/admin", label: "Admin" },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = getToken();
        if (!token) {
          clearAuth();
          router.replace("/login");
          return;
        }

        // Validate token via /api/me
        const res = await fetch("/api/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          clearAuth();
          router.replace("/login");
          return;
        }

        const data = await res.json();
        const role = data?.user?.role;
        setUserRole(role);

        // Optional: force user to stay in correct dashboard section
        const expectedPath = roleToDashboardPath(role);
        if (!pathname.startsWith("/dashboard")) {
          router.replace(expectedPath);
        }

        setAuthChecked(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        clearAuth();
        router.replace("/login");
      }
    }

    checkAuth();
  }, [pathname, router]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking authentication...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight">IAMS</h2>
          <p className="text-xs text-muted-foreground">
            Academic Management
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            // Optionally hide nav items not relevant to role:
            if (userRole === "STUDENT" && item.href !== "/dashboard/student") {
              return null;
            }
            if (userRole === "FACULTY" && item.href !== "/dashboard/faculty") {
              return null;
            }
            // ADMIN / SUPER_ADMIN can see all
            return (
              <Button
                key={item.href}
                asChild
                variant={active ? "default" : "ghost"}
                className={cn("w-full justify-start", active && "font-semibold")}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            );
          })}
        </nav>

        <div className="mt-6 border-t pt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{userRole || "User"}</span>
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              clearAuth();
              router.replace("/login");
            }}
          >
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
