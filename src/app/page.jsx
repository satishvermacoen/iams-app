// src/app/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUserRole, roleToDashboardPath } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const role = getUserRole();
    if (token && role) {
      router.replace(roleToDashboardPath(role));
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-sm font-bold">
            IA
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">
              IAMS
            </p>
            <p className="text-xs text-muted-foreground">
              Integrated Academic Management System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
          <Button onClick={() => router.push("/signup")}>
            Sign Up
          </Button>
          <Button
  variant="outline"
  onClick={() => router.push("/admissions/apply")}
>
  Apply for Admission
</Button>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              One platform for admissions, attendance, exams, and more.
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              IAMS centralizes academic workflows for educational institutions — 
              from student admissions and course registrations to attendance tracking 
              and examination management, with role-based dashboards for students, 
              faculty, and administrators.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push("/login")}>
                Login to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/signup")}
              >
                Get Started (Sign Up)
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Student Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>• View courses & attendance</p>
                <p>• Track exam schedules</p>
                <p>• Monitor performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Faculty Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>• Mark attendance</p>
                <p>• Manage exams & marks</p>
                <p>• View course enrolments</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Admin & Management
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>• Handle admissions & applications</p>
                <p>• Monitor institution-wide analytics</p>
                <p>• Manage roles, programs, courses, and more</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick role shortcuts */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card
            className="cursor-pointer hover:border-primary/60 transition"
            onClick={() => router.push("/login")}
          >
            <CardHeader>
              <CardTitle className="text-sm">Student Login</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>Access your academic dashboard, attendance and exam schedules.</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary/60 transition"
            onClick={() => router.push("/login")}
          >
            <CardHeader>
              <CardTitle className="text-sm">Faculty Login</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>Manage classes, attendance, and assessment records.</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary/60 transition"
            onClick={() => router.push("/login")}
          >
            <CardHeader>
              <CardTitle className="text-sm">Admin Login</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>Oversee admissions, departments, and analytics.</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
