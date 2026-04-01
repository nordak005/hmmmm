"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, Menu, X, LogOut, User, Ghost } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/loan", label: "Loans" },
  { href: "/admin", label: "Lenders" },
  { href: "/architecture", label: "Architecture" },
];

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isGuest, loading, signOut } = useAuth();

  const isLoggedIn = !!user;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setProfileOpen(false);
    if (profileOpen) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [profileOpen]);

  const handleSignOut = async () => {
    await signOut();
    setProfileOpen(false);
    router.push("/login");
  };

  // Hide login/signup buttons on login page
  const isLoginPage = pathname === "/login";

  return (
    <nav ref={navRef} className="fixed top-0 w-full z-50 border-b border-border/20" style={{ backgroundColor: "hsla(240, 10%, 3.9%, 0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight">
            Trust<span className="text-primary">Flow</span>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {isLoggedIn ? (
                /* Logged-in user dropdown */
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                      {initials}
                    </div>
                    <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                      {displayName}
                    </span>
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 top-12 w-56 rounded-xl border border-border/40 bg-card shadow-xl p-2 space-y-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2 border-b border-border/30 mb-1">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                      >
                        <User className="w-4 h-4 text-muted-foreground" /> Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : isGuest ? (
                /* Guest mode indicator */
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                    <Ghost className="w-3.5 h-3.5" /> Guest Mode
                  </div>
                  <Link href="/login" className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-lg h-9 px-4 text-sm font-semibold")}>
                    Sign In
                  </Link>
                </div>
              ) : !isLoginPage ? (
                /* Not logged in */
                <>
                  <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex text-sm rounded-lg")}>
                    Login
                  </Link>
                  <Link href="/login" className={cn(buttonVariants({ variant: "default" }), "text-sm rounded-lg h-9 px-4 font-semibold")}>
                    Get Started →
                  </Link>
                </>
              ) : null}
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/20 p-4 space-y-1" style={{ backgroundColor: "hsla(240, 10%, 3.9%, 0.95)" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              {link.label}
            </Link>
          ))}
          {!isLoggedIn && !isGuest && (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary bg-primary/10"
            >
              Login / Sign Up
            </Link>
          )}
          {isLoggedIn && (
            <button
              onClick={() => { handleSignOut(); setMobileOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
