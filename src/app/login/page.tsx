"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const result = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        fetchOptions: {
          onSuccess: async (ctx) => {
            // Get JWT token from header
            const jwt = ctx.response.headers.get("set-auth-jwt");
            if (jwt) {
              console.log("JWT token received:", jwt);
            }
          }
        }
      });
      
      // After successful login, get the session to ensure token is available
      await authClient.getSession();
      
      setSuccess("Login successful! Redirecting...");
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        router.push("/");
      }, 1500);
      
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const result = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        fetchOptions: {
          onSuccess: async (ctx) => {
            // Get JWT token from header
            const jwt = ctx.response.headers.get("set-auth-jwt");
            if (jwt) {
              console.log("JWT token received after signup:", jwt);
            }
          }
        }
      });
      
      // After successful signup, get the session to ensure token is available
      await authClient.getSession();
      
      setSuccess("Account created successfully! Redirecting...");
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        router.push("/");
      }, 1500);
      
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* header */}
      <header className="mb-6">
        <h1 className="text-lg mb-2">arian // authentication</h1>
        <p className="text-sm tui-muted">
          {mode === "login" 
            ? "login to access your financial data" 
            : "create an account to start tracking"
          }
        </p>
      </header>

        {/* mode toggle */}
        <div className="mb-6 flex gap-1">
          <Button
            onClick={() => setMode("login")}
            variant={mode === "login" ? "accent" : "ghost"}
            size="sm"
          >
            login
          </Button>
          <Button
            onClick={() => setMode("register")}
            variant={mode === "register" ? "accent" : "ghost"}
            size="sm"
          >
            sign up
          </Button>
        </div>

        {/* error message */}
        {error && (
          <div className="mb-4 p-3 text-sm bg-red-50 text-red-700 rounded border">
            {error}
          </div>
        )}

        {/* success message */}
        {success && (
          <div className="mb-4 p-3 text-sm bg-green-50 text-green-700 rounded border">
            {success}
          </div>
        )}

        {/* login form */}
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">
                email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="your@email.com"
                disabled={isLoading || !!success}
              />
            </div>

            <div>
              <Label htmlFor="password">
                password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                placeholder="your password"
                disabled={isLoading || !!success}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              size="lg"
              disabled={isLoading || !!success}
            >
              {success ? "redirecting..." : isLoading ? "logging in..." : "login"}
            </Button>
          </form>
        ) : (
          /* register form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">
                name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder="your display name"
                disabled={isLoading || !!success}
              />
            </div>

            <div>
              <Label htmlFor="register-email">
                email
              </Label>
              <Input
                id="register-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="your@email.com"
                disabled={isLoading || !!success}
              />
            </div>

            <div>
              <Label htmlFor="register-password">
                password
              </Label>
              <Input
                id="register-password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                placeholder="create a password"
                disabled={isLoading || !!success}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              size="lg"
              disabled={isLoading || !!success}
            >
              {success ? "redirecting..." : isLoading ? "creating account..." : "sign up"}
            </Button>
          </form>
        )}

    </>
  );
}