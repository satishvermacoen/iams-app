// src/app/admissions/apply/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

export default function ApplyForAdmissionPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const [applicantName, setApplicantName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [programId, setProgramId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoadingPrograms(true);
        const res = await fetch("/api/programs");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Failed to load programs");
        }
        setPrograms(data.items || []);
      } catch (err) {
        console.error("Programs fetch error:", err);
        setError("Unable to load programs, please try again later.");
      } finally {
        setLoadingPrograms(false);
      }
    }

    fetchPrograms();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantName,
          email,
          phone,
          programId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      setMessage("Your application has been submitted successfully.");
      setApplicantName("");
      setEmail("");
      setPhone("");
      setProgramId("");
    } catch (err) {
      console.error("Apply admission error:", err);
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      {/* Simple header shared style with home */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-sm font-bold">
            IA
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">IAMS</p>
            <p className="text-xs text-muted-foreground">
              Integrated Academic Management System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/")}>
            Home
          </Button>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Login
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Apply for Admission</CardTitle>
            <CardDescription>
              Fill in the details below to submit your admission application.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your mobile number"
                />
              </div>

              <div className="space-y-2">
                <Label>Program</Label>
                {loadingPrograms ? (
                  <p className="text-xs text-muted-foreground">
                    Loading programs...
                  </p>
                ) : programs.length === 0 ? (
                  <p className="text-xs text-red-500">
                    No programs configured. Please contact the institution.
                  </p>
                ) : (
                  <Select
                    value={programId}
                    onValueChange={setProgramId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name} ({p.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              {message && (
                <p className="text-sm text-emerald-600">
                  {message}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/")}
              >
                Back to Home
              </Button>
              <Button
                type="submit"
                disabled={submitting || !programId}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
