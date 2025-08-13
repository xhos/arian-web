"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    username: ""
  });

  const handlePasskeyLogin = async () => {
    try {
      // mock passkey authentication - in real app would call WebAuthn API
      console.log("Passkey login attempt");
      alert("Passkey login functionality would be implemented here");
    } catch (error) {
      console.error("Passkey login failed:", error);
      alert("Passkey authentication failed");
    }
  };

  const handlePasskeyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // mock passkey registration - in real app would call WebAuthn API
      console.log("Passkey registration attempt:", formData);
      alert("Passkey registration functionality would be implemented here");
    } catch (error) {
      console.error("Passkey registration failed:", error);
      alert("Passkey registration failed");
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

        {/* login form */}
        {mode === "login" ? (
          <div className="space-y-4">
            <Button
              onClick={handlePasskeyLogin}
              className="w-full"
              size="lg"
            >
              login w/ passkey
            </Button>
          </div>
        ) : (
          /* register form */
          <form onSubmit={handlePasskeyRegister} className="space-y-4">
            
            <div>
              <Label htmlFor="username">
                username
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
                placeholder="your username"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              size="lg"
            >
              sign up w/ passkey
            </Button>

          </form>
        )}

    </>
  );
}