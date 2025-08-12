"use client";

import { useState } from "react";

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
            ? "sign in to access your financial data" 
            : "create an account to start tracking"
          }
        </p>
      </header>

        {/* mode toggle */}
        <div className="mb-6 flex gap-1">
          <button
            onClick={() => setMode("login")}
            className={`text-sm px-3 py-1 transition-colors ${
              mode === "login" 
                ? "tui-accent bg-accent/10 border border-accent/30" 
                : "tui-muted hover:text-foreground"
            }`}
          >
            login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`text-sm px-3 py-1 transition-colors ${
              mode === "register" 
                ? "tui-accent bg-accent/10 border border-accent/30" 
                : "tui-muted hover:text-foreground"
            }`}
          >
            register
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label htmlFor="email" className="block text-xs tui-muted mb-1 uppercase tracking-wider">
              email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full tui-input"
              required
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs tui-muted mb-1 uppercase tracking-wider">
              password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full tui-input"
              required
              placeholder="••••••••"
            />
          </div>

          {mode === "register" && (
            <div>
              <label htmlFor="confirmPassword" className="block text-xs tui-muted mb-1 uppercase tracking-wider">
                confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="w-full tui-input"
                required
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full tui-button py-3 mt-6"
          >
            {mode === "login" ? "sign in" : "create account"}
          </button>

        </form>

    </>
  );
}