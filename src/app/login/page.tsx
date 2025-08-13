"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mock authentication - in real app would call api
    console.log(`${mode} attempt:`, formData);
    alert(`${mode} functionality would be implemented here`);
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
            register
          </Button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
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
              placeholder="user@example.com"
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
              placeholder="••••••••"
            />
          </div>

          {mode === "register" && (
            <div>
              <Label htmlFor="confirmPassword">
                confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-6"
            size="lg"
          >
            {mode === "login" ? "login" : "create account"}
          </Button>

        </form>

    </>
  );
}