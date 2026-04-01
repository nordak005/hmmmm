"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Link from "next/link";
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const { signIn, signUp, continueAsGuest, user, isGuest } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user || isGuest) router.push("/dashboard");
  }, [user, isGuest, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".login-logo", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 });
      gsap.fromTo(".login-card", { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.15, ease: "power2.out" });
      gsap.fromTo(".login-footer", { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.4 });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  // Animate mode switch
  useEffect(() => {
    gsap.fromTo(".form-fields", { opacity: 0, x: mode === "signup" ? 20 : -20 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" });
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "login") {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
      } else {
        router.push("/dashboard");
      }
    } else {
      if (!name.trim()) {
        setError("Please enter your name");
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, name);
      if (err) {
        setError(err);
      } else {
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setMode("login");
      }
    }
    setLoading(false);
  };

  const handleGuest = () => {
    continueAsGuest();
    router.push("/dashboard");
  };

  return (
    <div ref={pageRef} className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] bg-primary/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[30vw] h-[30vh] bg-blue-500/8 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="login-logo text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Trust<span className="text-primary">Flow</span>
            </span>
          </Link>
          <p className="text-muted-foreground text-sm">Gig Worker Trust Score Credit Engine</p>
        </div>

        {/* Auth Card */}
        <Card className="login-card border-border/40 bg-card/70 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Sign in to access your Trust Score dashboard"
                : "Start building your credit profile today"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-fields space-y-4">
                {/* Name (signup only) */}
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-background/80 border border-border/50 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all
                                   placeholder:text-muted-foreground/50"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-background/80 border border-border/50 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all
                                 placeholder:text-muted-foreground/50"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full h-11 pl-10 pr-11 rounded-xl bg-background/80 border border-border/50 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all
                                 placeholder:text-muted-foreground/50"
                      placeholder={mode === "signup" ? "Min. 6 characters" : "Enter your password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full h-11 rounded-xl font-semibold glow-card" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {mode === "login" ? "Signing in..." : "Creating account..."}</>
                ) : (
                  <>{mode === "login" ? "Sign In" : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>

              {/* Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Continue as Guest */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl border-border/50 hover:border-primary/30 hover:bg-primary/5"
                onClick={handleGuest}
              >
                Continue without login
              </Button>
            </form>

            {/* Switch Mode */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="login-footer text-center text-xs text-muted-foreground/50 mt-6">
          By continuing, you agree to TrustFlow&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
