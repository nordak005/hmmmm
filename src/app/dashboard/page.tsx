"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Activity, ShieldCheck, AlertTriangle, TrendingUp, DollarSign, Clock, CheckCircle2, Star, Zap, Wifi
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Import real auth & database tools
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Import mock data for fallback/demo
import { 
  MOCK_TRUST_SCORE, 
  MOCK_SCORE_HISTORY, 
  MOCK_PLATFORMS, 
  MOCK_EARNINGS,
  getScoreLabel
} from "@/lib/mock-data";

gsap.registerPlugin(ScrollTrigger);

export default function DashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { user, loading: authLoading } = useAuth();

  // State
  const [currentScore, setCurrentScore] = useState(0); // Animated value
  const [targetScore, setTargetScore] = useState(0);   // Actual value fetched
  const [scoreData, setScoreData] = useState(MOCK_SCORE_HISTORY);
  const [platforms, setPlatforms] = useState(MOCK_PLATFORMS);
  const [earningsStream, setEarningsStream] = useState(MOCK_EARNINGS);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Data Layer
  useEffect(() => {
    if (authLoading) return;

    async function fetchData() {
      // Fallback/Demo mode
      if (!isSupabaseConfigured || !user) {
        setTargetScore(MOCK_TRUST_SCORE.score);
        setScoreData(MOCK_SCORE_HISTORY);
        setPlatforms(MOCK_PLATFORMS);
        setEarningsStream(MOCK_EARNINGS);
        setLoading(false);
        return;
      }

      try {
        // Fetch Real Trust Score
        const { data: scoreDataResult, error: scoreErr } = await supabase
          .from('trust_scores')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (scoreDataResult && scoreDataResult.length > 0) {
          setTargetScore(scoreDataResult[0].score);
        } else {
          // New user -> calculate an initial score via hook
          const res = await fetch('/api/score/calculate', {
            method: 'POST',
            body: JSON.stringify({ user_id: user.id, latest_events: [] }),
            headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
            const data = await res.json();
            setTargetScore(data.trust_score || 500);
          } else {
            setTargetScore(500); // Base score
          }
        }

        // Fetch Real Platforms
        const { data: platformsResult } = await supabase
          .from('connected_platforms')
          .select('*')
          .eq('user_id', user.id);
        
        if (platformsResult && platformsResult.length > 0) {
          setPlatforms(platformsResult);
        } else {
          setPlatforms([]); // Emptry state
        }

        // In a real app, earnings would be fetched from an events/transactions table
        setEarningsStream(MOCK_EARNINGS);
        setScoreData(MOCK_SCORE_HISTORY); // Mock graph for now

      } catch (err) {
        console.error("Dashboard DB fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, authLoading]);

  // Handle GSAP animations when targetScore is available
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(".dash-header", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
      
      // Score counter animation
      const counter = { value: 0 };
      gsap.to(counter, {
        value: targetScore,
        duration: 2,
        ease: "power2.out",
        delay: 0.3,
        onUpdate: () => setCurrentScore(Math.round(counter.value)),
      });

      // Score ring animation
      gsap.fromTo(".score-ring", { strokeDashoffset: 283 }, {
        strokeDashoffset: 283 - (283 * (targetScore / 1000)),
        duration: 2, ease: "power2.out", delay: 0.3
      });

      // Cards stagger
      gsap.fromTo(".dash-card", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.2
      });

      // Metrics
      gsap.fromTo(".metric-card", { opacity: 0, scale: 0.9 }, {
        opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(1.7)", delay: 0.6
      });

      // Bottom section
      gsap.fromTo(".bottom-card", { opacity: 0, y: 30 }, {
        scrollTrigger: { trigger: ".bottom-section", start: "top 80%" },
        opacity: 1, y: 0, duration: 0.5, stagger: 0.15
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading, targetScore]);

  const handleAddPlatform = async () => {
    if (authLoading) return;
    const platformName = window.prompt("Enter a gig platform name to connect (e.g. Uber, Upwork, Swiggy, Fiverr):");
    if (!platformName) return;

    try {
      const res = await fetch("/api/platform/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: user?.id || (isSupabaseConfigured ? undefined : "00000000-0000-0000-0000-000000000001"), 
          platform_name: platformName 
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPlatforms(prev => [...prev, data.platform]);
        // Re-trigger visual pulse
        const addBtn = document.querySelector('.add-platform-btn');
        if (addBtn) gsap.fromTo(addBtn, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'back.out' });
      } else {
        alert("Failed to connect platform. Check credentials.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting platform.");
    }
  };

  const scoreLabel = getScoreLabel(currentScore);
  const scoreColor = currentScore >= 800 ? "text-primary" : currentScore >= 650 ? "text-yellow-400" : "text-orange-400";
  const eligibleLoan = currentScore >= 800 ? 5000 : currentScore >= 700 ? 2000 : currentScore >= 500 ? 500 : 0;

  if (!isMounted) return null;

  if (loading || authLoading) {
    return <div className="container mx-auto px-4 py-20 text-center animate-pulse text-muted-foreground">Loading Intelligence Dashboard...</div>;
  }

  return (
    <div ref={pageRef} className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="dash-header flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gig Worker Intelligence</h1>
          <p className="text-muted-foreground mt-1.5">Real-time Trust Score & Loan Eligibility</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 bg-primary/10 text-primary border-primary/20">
            <Wifi className="h-3 w-3 mr-1.5 animate-pulse" /> Live Sync
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5">
            {platforms.length} Platforms Connected
          </Badge>
        </div>
      </div>

      {/* Connected Platforms Strip */}
      <div className="dash-card flex gap-3 mb-8 overflow-x-auto pb-2">
        {platforms.map((p, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/60 border border-border/40 min-w-[180px] hover:border-primary/30 transition-colors">
            <span className="text-xl">{p.platform_icon}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold">{p.platform_name}</div>
              <div className="text-xs text-muted-foreground">₹{p.earnings.toLocaleString()}</div>
            </div>
            <div className={`w-2 h-2 rounded-full ${p.status === 'synced' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          </div>
        ))}
        {platforms.length === 0 && (
          <div className="flex items-center justify-center px-6 py-3 rounded-xl bg-card border border-border text-sm text-yellow-400 min-w-[180px]">
            No Platforms Connected
          </div>
        )}
        <div 
          onClick={handleAddPlatform}
          className="add-platform-btn flex items-center justify-center px-6 py-3 rounded-xl border border-dashed border-border/50 text-muted-foreground text-sm hover:border-primary/30 hover:text-primary transition-colors cursor-pointer min-w-[140px]"
        >
          + Add Platform
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Core Trust Score */}
        <Card className="dash-card md:col-span-1 border-border/40 bg-card/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Trust Score</CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Updated seconds ago
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" strokeDasharray="283" />
                <circle
                  cx="50" cy="50" r="45" fill="none" strokeWidth="6"
                  className="score-ring drop-shadow-[0_0_12px_rgba(0,229,153,0.6)]"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="283"
                  style={{ stroke: "hsl(var(--primary))" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-5xl font-bold glow-text tabular-nums">{currentScore}</span>
                <span className={`text-xs uppercase tracking-widest mt-1 font-semibold ${scoreColor}`}>{scoreLabel}</span>
              </div>
            </div>

            <div className="mt-6 w-full p-4 bg-primary/5 rounded-xl border border-primary/15 text-center">
              <span className="text-xs text-muted-foreground block mb-1">Eligible Micro-Loan</span>
              <span className="text-2xl font-bold">₹{eligibleLoan.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Score Trend */}
        <div className="md:col-span-2 grid grid-rows-[1fr_auto] gap-5">
          <Card className="dash-card border-border/40 bg-card/60">
            <CardHeader className="py-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Score Trajectory</CardTitle>
                <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/20">
                  <TrendingUp className="w-3 h-3 mr-1" /> +55 this month
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[200px] pb-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00e599" stopOpacity={0.25}/>
                      <stop offset="100%" stopColor="#00e599" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} domain={[300, 1000]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#27272a', borderRadius: '12px', fontSize: '13px' }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#00e599" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { title: "Earnings", value: "35%", icon: <DollarSign className="w-4 h-4 text-green-400" /> },
              { title: "Ratings", value: "25%", icon: <Star className="w-4 h-4 text-yellow-400" /> },
              { title: "Completion", value: "20%", icon: <CheckCircle2 className="w-4 h-4 text-blue-400" /> },
              { title: "Repayment", value: "20%", icon: <TrendingUp className="w-4 h-4 text-purple-400" /> },
            ].map((m, i) => (
              <Card key={i} className="metric-card bg-card/40 border-border/30 hover:border-border/60 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {m.icon}
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{m.title}</span>
                  </div>
                  <div className="text-xl font-bold">{m.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-section grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <Card className="bottom-card border-border/40 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-5 h-5 text-primary" /> Event Stream Pipeline
            </CardTitle>
            <CardDescription>Real-time webhook events from gig platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earningsStream.map((event, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border/20 bg-background/50 hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-lg border border-border/40 shrink-0">
                    {event.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{event.platform} Delivery</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" /> {event.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-green-400">+₹{event.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{event.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bottom-card border-border/40 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="w-5 h-5 text-blue-400" /> API System Health
            </CardTitle>
            <CardDescription>Microservices & ML Inference Nodes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Auth & Identity Sync", latency: "42ms", status: "Operational" },
              { name: "Uber Webhook Ingestion", latency: "12ms", status: "Operational" },
              { name: "Upwork Data Pipeline", latency: "89ms", status: "Sub-optimal", warning: true },
              { name: "Trust ML Inference Engine", latency: "156ms", status: "Operational" },
              { name: "Loan Origination Smart Contract", latency: "24ms", status: "Operational" },
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${node.warning ? 'bg-yellow-400' : 'bg-green-500'}`} />
                  <div>
                    <p className="font-medium text-sm">{node.name}</p>
                    <p className="text-xs text-muted-foreground">{node.latency}</p>
                  </div>
                </div>
                <Badge variant={node.warning ? "outline" : "default"} className={node.warning ? "text-yellow-400 border-yellow-400/20" : "bg-green-500/10 text-green-400"}>
                  {node.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
