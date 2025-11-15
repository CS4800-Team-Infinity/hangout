"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/router";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const fullRedirect = router.asPath.split("redirect=")[1];
  const redirectTo = fullRedirect
    ? decodeURIComponent(fullRedirect)
    : undefined;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("please fill in all fields");
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Get redirect URL from query parameters
        const redirectParam = router.query.redirect as string | undefined;

        console.log("Login successful, redirect param:", redirectParam); // Debug log

        if (redirectParam) {
          // Use window.location.href for full page reload
          // This ensures the page reloads with new user data and preserves state
          window.location.href = redirectParam;
        } else {
          // If no redirect param, check if there's a referrer (where user came from)
          const referrer = document.referrer;
          const currentOrigin = window.location.origin;

          // If referrer is from our site and not the login page itself
          if (
            referrer &&
            referrer.startsWith(currentOrigin) &&
            !referrer.includes("/login")
          ) {
            window.location.href = referrer;
          } else {
            window.location.href = "/";
          }
        }
        return;
      }

      setError(result.error || "login failed");
    } catch {
      setError("something went wrong. please try again.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold">welcome to hangout!</h1>
            <div className="text-center text-sm">
              don&apos;t have an account?{" "}
              <a
                href={`/signup${
                  router.query.redirect
                    ? `?redirect=${encodeURIComponent(
                        router.query.redirect as string
                      )}`
                    : ""
                }`}
                className="underline underline-offset-4 hover:text-zinc-300 transition-all duration-200"
              >
                sign up
              </a>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-white hover:cursor-pointer transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "logging in..." : "login"}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        by clicking continue, you agree to our{" "}
        <a href="/terms-of-service">terms of service</a> and{" "}
        <a href="/privacy-policy">privacy policy</a>.
      </div>
    </div>
  );
}
