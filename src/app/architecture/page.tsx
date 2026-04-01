"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Database, Server, ServerCrash, Cpu, ArrowRight, Activity, Globe, Code2, MoveRight, Layers, Workflow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const stages = [
  {
    id: 1,
    title: "The Monolith Era",
    tagline: "Slow, Rigid, Single-Point-of-Failure",
    description: "Legacy banking apps relied on massive monolithic structures. Updating a single component meant redeploying the entire system. Salary-only logic lived in one giant database — excluding millions of gig workers from the financial system.",
    color: "from-red-500/20 to-red-500/5",
    border: "border-red-500/30",
    activeBg: "bg-red-500/8",
    iconColor: "text-red-400",
    accentColor: "#ef4444",
    icon: <ServerCrash className="w-6 h-6" />,
  },
  {
    id: 2,
    title: "Microservices",
    tagline: "Decoupled but Complex to Manage",
    description: "Breaking the monolith into independent services allowed scaling of Auth, Scoring, and Loan systems independently. However, data silos between services made real-time multi-platform aggregation computationally expensive and error-prone.",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
    activeBg: "bg-blue-500/8",
    iconColor: "text-blue-400",
    accentColor: "#3b82f6",
    icon: <Server className="w-6 h-6" />,
  },
  {
    id: 3,
    title: "Event-Driven Architecture",
    tagline: "Kafka + Supabase Real-Time Sync",
    description: "Instead of polling REST APIs, TrustFlow listens to real-time work completion webhooks from Uber, Upwork, and Swiggy. Event streams via Supabase PostgreSQL enable instant data flow — no more stale data, no more batch processing delays.",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
    activeBg: "bg-purple-500/8",
    iconColor: "text-purple-400",
    accentColor: "#a855f7",
    icon: <Globe className="w-6 h-6" />,
  },
  {
    id: 4,
    title: "AI-Native Trust Engine",
    tagline: "The Final Evolution — TrustFlow",
    description: "The production architecture: modular Next.js 14 frontend with edge deployment, serverless FastAPI scoring hooks, real-time Supabase database, and a continuous ML model computing 300–1000 Trust Scores from live gig platform data streams.",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
    activeBg: "bg-primary/8",
    iconColor: "text-primary",
    accentColor: "#00e599",
    icon: <Cpu className="w-6 h-6" />,
  },
];

function StageDiagram({ stageId }: { stageId: number }) {
  if (stageId === 1) {
    return (
      <div className="flex flex-col items-center gap-3">
        <Database className="w-14 h-14 text-red-400 mb-2" />
        {["UI / API / Auth", "Scoring Engine", "DB Transactions"].map((label, i) => (
          <div key={i} className="w-full max-w-[200px] h-11 bg-red-500/15 border border-red-500/30 rounded-lg flex items-center justify-center text-sm font-medium text-red-200">
            {label}
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-3 text-center max-w-[220px]">
          Everything coupled in one deployable unit
        </p>
      </div>
    );
  }
  if (stageId === 2) {
    return (
      <div className="flex items-center gap-4">
        {[
          { label: "Auth", icon: <Code2 className="w-6 h-6 text-blue-400" />, color: "blue" },
          { label: "Score", icon: <Activity className="w-6 h-6 text-purple-400" />, color: "purple" },
          { label: "Loan", icon: <Database className="w-6 h-6 text-orange-400" />, color: "orange" },
        ].map((svc, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            {svc.icon}
            <div className={`w-20 h-20 bg-${svc.color}-500/15 border border-${svc.color}-500/30 rounded-xl flex items-center justify-center text-xs font-medium`}>
              {svc.label}<br />Service
            </div>
            {i < 2 && <MoveRight className="w-4 h-4 text-muted-foreground/50 absolute" style={{ display: "none" }} />}
          </div>
        ))}
      </div>
    );
  }
  if (stageId === 3) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex gap-3 flex-wrap justify-center">
          {["Uber", "Swiggy", "Upwork"].map((name, i) => (
            <div key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium border animate-pulse ${
              i === 0 ? "bg-purple-500/15 border-purple-500/30 text-purple-300" :
              i === 1 ? "bg-orange-500/15 border-orange-500/30 text-orange-300" :
              "bg-green-500/15 border-green-500/30 text-green-300"
            }`} style={{ animationDelay: `${i * 200}ms` }}>
              {name} Webhook
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Workflow className="w-4 h-4" />
          <div className="w-16 h-px bg-gradient-to-r from-purple-500/50 to-primary/50" />
          <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
          <div className="w-16 h-px bg-gradient-to-r from-primary/50 to-blue-500/50" />
          <Workflow className="w-4 h-4" />
        </div>
        <div className="p-4 bg-background/80 border border-purple-500/30 rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <Database className="w-8 h-8 text-purple-400" />
          <div>
            <div className="text-sm font-semibold">Event Bus</div>
            <div className="text-[11px] text-muted-foreground">Real-time stream processing</div>
          </div>
        </div>
      </div>
    );
  }
  // Stage 4
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
      <div className="p-4 bg-background/80 border border-border/50 rounded-xl text-center">
        <div className="text-sm font-bold mb-0.5">Next.js 14</div>
        <p className="text-[10px] text-muted-foreground">Edge + Vercel</p>
      </div>
      <div className="p-4 bg-background/80 border border-primary/30 rounded-xl text-center">
        <div className="text-sm font-bold text-primary mb-0.5">Trust AI</div>
        <p className="text-[10px] text-muted-foreground">FastAPI Hooks</p>
      </div>
      <div className="col-span-2 p-3 bg-background/80 border border-blue-500/20 rounded-xl flex items-center justify-between">
        <span className="text-sm font-semibold">Supabase PG</span>
        <div className="flex gap-1.5">
          <span className="text-[9px] bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded">RLS</span>
          <span className="text-[9px] bg-green-500/15 text-green-300 px-1.5 py-0.5 rounded">Realtime</span>
        </div>
      </div>
    </div>
  );
}

export default function ArchitecturePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".arch-title", { opacity: 0, y: -25 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
      gsap.fromTo(".arch-subtitle", { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.2 });

      gsap.fromTo(".stage-item", { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, duration: 0.4, stagger: 0.12, delay: 0.3, ease: "power2.out"
      });

      gsap.fromTo(".diagram-panel", { opacity: 0, scale: 0.95 }, {
        opacity: 1, scale: 1, duration: 0.6, delay: 0.5, ease: "power2.out"
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Animate diagram swap
  useEffect(() => {
    gsap.fromTo(".diagram-content", { opacity: 0, y: 15, scale: 0.95 }, {
      opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)"
    });
  }, [activeStage]);

  const currentStage = stages[activeStage];

  return (
    <div ref={pageRef} className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-16 mt-8">
        <h1 className="arch-title text-4xl md:text-5xl font-bold tracking-tight mb-4">
          The TrustFlow Architecture{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Evolution</span>
        </h1>
        <p className="arch-subtitle text-lg text-muted-foreground max-w-2xl mx-auto">
          From rigid legacy monoliths to dynamic, AI-powered credit scoring engines.
        </p>
      </div>

      {/* Timeline Progress */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {stages.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveStage(i)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              activeStage === i
                ? `${s.activeBg} ${s.iconColor} ${s.border} border`
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border",
              activeStage === i ? s.border : "border-muted-foreground/30"
            )}>
              {s.id}
            </span>
            <span className="hidden sm:inline">{s.title.replace("The ", "")}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start min-h-[480px]">
        {/* Left: Stage List */}
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              onClick={() => setActiveStage(index)}
              className={cn(
                "stage-item cursor-pointer group p-5 rounded-2xl border transition-all duration-300",
                activeStage === index
                  ? `${stage.activeBg} ${stage.border} shadow-lg`
                  : "bg-card/20 border-transparent hover:bg-card/40 hover:border-border/30"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                  activeStage === index
                    ? `${stage.activeBg} ${stage.border} ${stage.iconColor}`
                    : "bg-muted/30 border-border/30 text-muted-foreground"
                )}>
                  {stage.icon}
                </div>
                <div className="flex-1">
                  <h3 className={cn(
                    "text-lg font-semibold mb-0.5 transition-colors",
                    activeStage === index ? stage.iconColor : "text-foreground"
                  )}>
                    {stage.title}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{stage.tagline}</p>
                  {activeStage === index && (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-3 animate-in fade-in duration-300">
                      {stage.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Diagram */}
        <div className="diagram-panel sticky top-28">
          <div
            className={cn(
              "flex items-center justify-center p-10 rounded-3xl border-2 min-h-[420px] transition-all duration-500",
              currentStage.border
            )}
            style={{
              background: `radial-gradient(ellipse at center, ${currentStage.accentColor}08 0%, transparent 70%)`,
            }}
          >
            <div className="diagram-content">
              <StageDiagram stageId={currentStage.id} />
            </div>
          </div>

          {/* Stage indicator dots */}
          <div className="flex justify-center gap-2 mt-4">
            {stages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStage(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  activeStage === i ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div className="mt-16 text-center">
        <Button
          size="lg"
          variant="outline"
          className="rounded-xl border-border/50 hover:border-primary/40 h-12 px-8"
          onClick={() => setActiveStage((prev) => (prev + 1) % stages.length)}
        >
          Advance Evolution Stage <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
