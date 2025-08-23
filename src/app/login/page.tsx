"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setIsLoggedIn(true);
          setTimeout(() => router.push("/"), 2000);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "register") {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, displayName: name }),
        });
        if (!response.ok) throw new Error((await response.json()).error || "Registration failed");
      }

      const result = await authClient.signIn.email({ email, password });
      if (result.error) throw new Error("Invalid email or password");

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
  };

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-sm tui-muted">checking session...</div>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-lg mb-2">arian // authentication</h1>
          <p className="text-sm tui-muted mb-4">you&apos;ve successfully logged in</p>
          <p className="text-xs font-mono text-green-600">redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="mb-6">
          <h1 className="text-lg mb-2">arian // authentication</h1>
          <p className="text-sm tui-muted">
            {mode === "login"
              ? "login to access your financial data"
              : "create an account to start tracking"}
          </p>
        </header>

        <div className="mb-6 flex gap-1">
          <Button
            onClick={() => switchMode("login")}
            variant={mode === "login" ? "default" : "ghost"}
            size="sm"
          >
            login
          </Button>
          <Button
            onClick={() => switchMode("register")}
            variant={mode === "register" ? "default" : "ghost"}
            size="sm"
          >
            sign up
          </Button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === "register" && (
            <div>
              <Label htmlFor="name">name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your display name"
                disabled={isLoading}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "login" ? "your password" : "create a password"}
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
            {isLoading ? (mode === "login" ? "logging in..." : "creating account...") : mode}
          </Button>
        </form>

        {error && <div className="mt-4 p-3 text-sm font-mono text-red-600 tui-border">{error}</div>}
      </div>
    </div>
  );
}
