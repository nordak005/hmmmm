"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck, Zap, Database, Globe, TrendingUp, Users, Sparkles, ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const platforms = [
  { name: "Uber", color: "bg-black", letter: "U" },
  { name: "Upwork", color: "bg-green-600", letter: "Up" },
  { name: "Swiggy", color: "bg-orange-500", letter: "S" },
  { name: "Fiverr", color: "bg-green-500", letter: "F" },
  { name: "Zomato", color: "bg-red-500", letter: "Z" },
];

const stats = [
  { value: "50K+", label: "Gig Workers Scored" },
  { value: "₹2.4Cr", label: "Micro-Loans Disbursed" },
  { value: "99.2%", label: "Repayment Rate" },
  { value: "<3s", label: "Avg. Approval Time" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const platformsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-badge", { opacity: 0, y: -20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
        .fromTo(".hero-title", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
        .fromTo(".hero-subtitle", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, "-=0.3")
        .fromTo(".hero-scroll-hint", { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.2");

      // Floating glow
      gsap.to(".hero-glow-1", { y: -20, x: 10, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".hero-glow-2", { y: 15, x: -15, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });

      // Stats counter animation
      gsap.fromTo(".stat-item", { opacity: 0, y: 40 }, {
        scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
        opacity: 1, y: 0, duration: 0.6, stagger: 0.1
      });

      // Platform logos slide
      gsap.fromTo(".platform-pill", { opacity: 0, x: -30 }, {
        scrollTrigger: { trigger: platformsRef.current, start: "top 85%" },
        opacity: 1, x: 0, duration: 0.4, stagger: 0.08
      });

      // Features
      gsap.fromTo(".feature-card", { opacity: 0, y: 50, scale: 0.95 }, {
        scrollTrigger: { trigger: featuresRef.current, start: "top 75%" },
        opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15
      });

      // Bottom CTA
      gsap.fromTo(".bottom-cta", { opacity: 0, y: 30 }, {
        scrollTrigger: { trigger: ctaRef.current, start: "top 85%" },
        opacity: 1, y: 0, duration: 0.7
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="flex flex-col overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-6">
        <div className="hero-glow-1 absolute top-1/4 left-1/2 -translate-x-1/2 w-[70vw] h-[50vh] bg-primary/15 blur-[180px] rounded-full pointer-events-none" />
        <div className="hero-glow-2 absolute top-1/3 right-0 w-[35vw] h-[35vh] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background))_70%)] pointer-events-none" />

        <div className="container mx-auto text-center relative z-10 max-w-5xl">
          <div className="hero-badge inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card/80 border border-border/60 text-sm font-medium mb-10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            The Fintech Architecture Evolution Challenge
          </div>

          <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-7 leading-[0.95]">
            Credit Scoring for<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">
              the Gig Economy
            </span>
          </h1>

          <p className="hero-subtitle text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Traditional salary-based models leave millions behind. TrustFlow aggregates real-time
            gig data into a dynamic <strong className="text-foreground">Trust Score</strong> — and approves micro-loans in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "hero-cta h-12 px-8 text-base font-semibold glow-card rounded-xl")}>
              Connect Platforms <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/architecture" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "hero-cta h-12 px-8 text-base rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5")}>
              View Architecture
            </Link>
          </div>

          <div className="hero-scroll-hint flex flex-col items-center gap-2 text-muted-foreground/50">
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section ref={statsRef} className="py-12 border-y border-border/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="stat-item text-center">
                <div className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Connected Platforms ── */}
      <section ref={platformsRef} className="py-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-8">Trusted by workers on</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {platforms.map((p, i) => (
              <div key={i} className="platform-pill flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card/60 border border-border/40 hover:border-primary/30 hover:bg-card transition-all cursor-default">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold", p.color)}>
                  {p.letter}
                </div>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section ref={featuresRef} className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm text-primary font-semibold uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">From Platform Silos to Instant Loans</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to financial inclusion for the gig workforce.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <Globe className="h-7 w-7" />,
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
                step: "01",
                title: "Connect Platforms",
                desc: "Link Uber, Upwork, Swiggy, and more. Our event-driven API gateway securely ingests your earnings, ratings, and completion history.",
              },
              {
                icon: <Activity className="h-7 w-7" />,
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
                step: "02",
                title: "AI Scores in Real-Time",
                desc: "Our ML engine continuously computes your Trust Score (300–1000) based on earnings stability, platform ratings, and repayment behavior.",
              },
              {
                icon: <Zap className="h-7 w-7" />,
                color: "text-yellow-400",
                bg: "bg-yellow-500/10 border-yellow-500/20",
                step: "03",
                title: "Instant Micro-Loans",
                desc: "Approved in under 3 seconds. Daily-Pay auto-deduction from your gig earnings ensures seamless, zero-friction repayment.",
              },
            ].map((f, i) => (
              <div key={i} className="feature-card group relative p-8 rounded-2xl bg-card/40 border border-border/40 hover:border-border/80 hover:bg-card/70 transition-all duration-300">
                <div className="absolute top-6 right-6 text-5xl font-black text-muted/10 select-none">{f.step}</div>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 border", f.bg, f.color)}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section ref={ctaRef} className="py-24">
        <div className="container mx-auto px-6">
          <div className="bottom-cta relative max-w-3xl mx-auto text-center p-12 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08),transparent_60%)] pointer-events-none" />
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-4 relative z-10" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">Ready to build your Trust Score?</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto relative z-10">
              Connect your gig platforms today and unlock credit access you thought was impossible.
            </p>
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-12 px-10 text-base font-semibold glow-card rounded-xl relative z-10")}>
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Zap className="w-4 h-4 text-primary" /> TrustFlow
          </div>
          <p>© 2026 TrustFlow. Built for The Fintech Architecture Evolution Challenge.</p>
          <div className="flex gap-6">
            <Link href="/architecture" className="hover:text-primary transition-colors">Architecture</Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
