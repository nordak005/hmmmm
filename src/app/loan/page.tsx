"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Banknote, CalendarDays, CheckCircle2, ChevronRight, Clock, ShieldCheck, TrendingUp, XCircle, Zap, Loader2
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_TRUST_SCORE, getMaxLoan } from "@/lib/mock-data";

export default function LoanPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { user, loading: authLoading, isGuest } = useAuth();

  const [amount, setAmount] = useState(1000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<"idle" | "approved" | "rejected">("idle");
  const [apiResult, setApiResult] = useState<any>(null);
  
  const [currentScore, setCurrentScore] = useState(0);
  const [maxEligible, setMaxEligible] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch score logic
  useEffect(() => {
    if (authLoading) return;

    async function fetchData() {
      if (!isSupabaseConfigured || (!user && isGuest)) {
        setCurrentScore(MOCK_TRUST_SCORE.score);
        setMaxEligible(MOCK_TRUST_SCORE.max_loan);
        setLoading(false);
        return;
      }

      if (user) {
        const { data, error } = await supabase.from('trust_scores').select('score').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
        if (data && data.length > 0) {
          const score = data[0].score;
          setCurrentScore(score);
          setMaxEligible(getMaxLoan(score));
        } else {
          // New/fallback if not generated
          setCurrentScore(500);
          setMaxEligible(500);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [user, authLoading, isGuest]);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".header-anim", { opacity: 0, y: -40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out" });
      gsap.fromTo(".card-anim", { opacity: 0, y: 50, rotationY: 15, scale: 0.9 }, { opacity: 1, y: 0, rotationY: 0, scale: 1, duration: 1.1, stagger: 0.2, delay: 0.1, ease: "back.out(1.4)" });
    }, pageRef);
    return () => ctx.revert();
  }, [loading]);

  const simulateApproval = async () => {
    setIsSimulating(true);
    setResult("idle");
    setStage(1);

    // Visual loading stages
    const stages = [
      { delay: 600, stage: 2 },
      { delay: 1200, stage: 3 },
      { delay: 1800, stage: 4 },
    ];
    stages.forEach(({ delay, stage: s }) => setTimeout(() => setStage(s), delay));

    // Call actual API
    try {
        const body = {
            user_id: user?.id || (isSupabaseConfigured ? undefined : "00000000-0000-0000-0000-000000000001"),
            amount: amount,
            current_score: currentScore
        };

        const res = await fetch("/api/loan/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        
        setTimeout(() => {
            setIsSimulating(false);
            setStage(0);
            
            if (res.ok && data.approved) {
               setResult("approved");
               setApiResult(data);
            } else {
               setResult("rejected");
               setApiResult(data);
            }
            // Result animation
            setTimeout(() => {
                gsap.fromTo(".result-card", { opacity: 0, scale: 0.85, y: 40, rotationX: 20 }, { opacity: 1, scale: 1, y: 0, rotationX: 0, duration: 0.8, ease: "back.out(1.8)" });
            }, 50);
        }, 2200);

    } catch (err) {
        setIsSimulating(false);
        setStage(0);
        setResult("rejected");
    }
  };

  const stageLabels = ["", "Verifying Identity...", "Running Fraud Checks...", "Analyzing Risk Profile...", "Computing Approval..."];
  
  const fee = amount * 0.05;
  const total = amount + fee;
  const daily = total / 14;

  if (!isMounted || loading || authLoading) {
      return <div className="container py-20 text-center animate-pulse text-muted-foreground">Initializing Loan Engine...</div>;
  }

  return (
    <div ref={pageRef} className="container mx-auto px-4 py-8 max-w-4xl min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="header-anim text-center mb-10 mt-6">
        <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20 px-3 py-1">
          <Zap className="w-3.5 h-3.5 mr-1" /> Instant Approval Engine
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Daily-Pay Advances
        </h1>
        <p className="text-muted-foreground md:text-lg max-w-xl mx-auto">
          Need cash before platforms clear your earnings? Get an instant advance based on your Trust Score.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Loan Configurator */}
        <Card className="card-anim md:col-span-12 lg:col-span-7 bg-card/60 border-border/40 backdrop-blur shadow-xl relative overflow-hidden">
          <CardHeader className="pb-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Request Advance</CardTitle>
                <CardDescription className="mt-1">Select the amount you need to borrow</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Eligible Limit</span>
                <div className="text-2xl font-bold text-primary">₹{maxEligible.toLocaleString()}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center py-6 bg-background/50 rounded-2xl border border-border/30 shadow-inner">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Selected Amount</span>
              <div className="text-5xl md:text-6xl font-bold tabular-nums text-foreground">
                <span className="text-muted-foreground/50 text-3xl md:text-4xl">₹</span>
                {amount.toLocaleString()}
              </div>
            </div>

            <div className="space-y-4 px-2">
              <Slider
                max={Math.max(5000, maxEligible)}
                min={500}
                step={500}
                value={amount as any}
                onValueChange={(vals: any) => setAmount(Array.isArray(vals) ? vals[0] : vals)}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>₹500</span>
                <span>₹{Math.max(5000, maxEligible).toLocaleString()}</span>
              </div>
            </div>

            {/* Compute Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/50 border border-border/20 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Platform Fee (5%)</span>
                <span className="font-semibold text-lg text-yellow-500">₹{fee.toFixed(2)}</span>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border/20 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Total Repayment</span>
                <span className="font-semibold text-lg">₹{total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Auto-deducted daily over 14 days</span>
                <span className="font-bold text-primary">₹{daily.toFixed(2)} / day</span>
            </div>

          </CardContent>
          <CardFooter className="pt-2">
            <Button
              size="lg"
              className="w-full text-base font-semibold h-14 rounded-xl glow-card relative overflow-hidden"
              onClick={simulateApproval}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{stageLabels[stage]}</span>
                </div>
              ) : (
                <>Submit Request <ChevronRight className="w-5 h-5 ml-1" /></>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Dynamic Results Area */}
        <div className="card-anim md:col-span-12 lg:col-span-5 flex flex-col justify-center">
          {result === "idle" && !isSimulating && (
            <div className="hidden lg:flex flex-col items-center justify-center text-center p-8 text-muted-foreground/40 opacity-70">
              <Banknote className="w-24 h-24 mb-6 stroke-1" />
              <p className="max-w-[200px] text-sm leading-relaxed">Adjust your loan amount and submit your application to compute approval.</p>
            </div>
          )}

          {isSimulating && (
            <div className="h-[300px] flex flex-col items-center justify-center space-y-8">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                {(stage === 1 || stage === 2) && <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary" />}
                {(stage === 3 || stage === 4) && <TrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />}
              </div>
              <div className="text-center font-medium min-h-[40px] text-primary">{stageLabels[stage]}</div>
            </div>
          )}

          {result === "approved" && (
            <Card className="result-card bg-green-500/5 border-green-500/20 shadow-[0_0_50px_-12px_rgba(0,229,153,0.15)] overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-green-400 to-green-500" />
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 text-green-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Loan Approved!</h3>
                <p className="text-muted-foreground text-sm mb-6">Based on your Trust Score of {currentScore}, you are approved for this advance.</p>
                <div className="space-y-3 p-4 bg-background/50 rounded-xl border border-border/40 text-sm mb-6 text-left">
                  <div className="flex justify-between items-center"><span className="text-muted-foreground tracking-wide">LOAN ID</span><span className="font-mono text-zinc-300">{apiResult?.loan_id}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground tracking-wide">STATUS</span><span className="text-green-400 font-medium">Funds Dispatched</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground tracking-wide">DURATION</span><span className="text-zinc-300">14 Days Default</span></div>
                </div>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-12 rounded-xl">
                  Accept & Receive Funds
                </Button>
              </CardContent>
            </Card>
          )}

          {result === "rejected" && (
            <Card className="result-card bg-red-500/5 border-red-500/20">
              <div className="h-2 w-full bg-gradient-to-r from-red-400 to-red-500" />
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
                  <XCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Amount Exceeds Limit</h3>
                <p className="text-muted-foreground text-sm mb-6">Your current Trust Score ({currentScore}) qualifies you for maximum bounds up to <strong className="text-foreground">₹{maxEligible.toLocaleString()}</strong>.</p>
                <div className="p-4 rounded-xl border border-dashed border-red-400/30 bg-red-500/5 text-sm mb-6">
                  <p className="text-red-400 mb-1 font-medium">{apiResult?.reason || "Credit limit restriction"}</p>
                </div>
                <Button variant="outline" className="w-full h-12 rounded-xl border-border/50" onClick={() => { setAmount(maxEligible); setResult("idle"); }}>
                  Adjust to ₹{maxEligible.toLocaleString()} & Retry
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
