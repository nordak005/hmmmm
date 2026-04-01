"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ShieldAlert, Users, IndianRupee, PieChart as PieChartIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_BORROWERS, MOCK_PORTFOLIO_DATA, MOCK_PORTFOLIO_STATS } from "@/lib/mock-data";

export default function AdminPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  
  const [borrowers, setBorrowers] = useState<any[]>(MOCK_BORROWERS);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch real data for admin dashboard
  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        // Fetch users, scores, loans
        const { data: scores } = await supabase.from('trust_scores').select('*, user_id');
        const { data: loans } = await supabase.from('micro_loans').select('*').eq('status', 'ACTIVE');

        if (scores && loans) {
          // Simplistic mapping for demo purposes
          const mappedBorrowers = scores.map(s => {
            const userLoan = loans.find(l => l.user_id === s.user_id);
            const loanAmount = userLoan ? userLoan.principal_amount : 0;
            return {
              id: s.id,
              name: s.user_id.slice(0, 8), // Real app would join with users table metadata
              score: s.score,
              loan: loanAmount,
              platforms: s.platforms_connected || 1,
              status: s.score > 750 ? "Healthy" : s.score > 600 ? "At Risk" : "Suspended",
              trend: s.score > 700 ? "up" : "down"
            };
          });
          
          if (mappedBorrowers.length > 0) {
            setBorrowers(mappedBorrowers);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(".admin-header", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });

      gsap.fromTo(".stat-card", { opacity: 0, y: 25, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, delay: 0.15, ease: "back.out(1.4)"
      });

      gsap.fromTo(".chart-card", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: "power2.out"
      });

      gsap.fromTo(".table-card", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.5, delay: 0.55, ease: "power2.out"
      });

      gsap.fromTo(".table-row-anim", { opacity: 0, x: -15 }, {
        opacity: 1, x: 0, duration: 0.35, stagger: 0.06, delay: 0.7, ease: "power2.out"
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading]);

  if (!isMounted || loading) {
     return <div className="container py-20 text-center animate-pulse text-muted-foreground">Loading admin metrics...</div>;
  }

  return (
    <div ref={pageRef} className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="admin-header mb-10 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lender Risk Portfolio</h1>
          <p className="text-muted-foreground mt-1.5">AI-Native Default Prediction & Analytics</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-4 px-4 py-2.5 border border-border/40 rounded-xl bg-card/40 text-sm font-medium">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {MOCK_PORTFOLIO_STATS.healthyPct}%
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span> {MOCK_PORTFOLIO_STATS.atRiskPct}%
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span> {MOCK_PORTFOLIO_STATS.defaultPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { title: "Active Micro-Loans", value: MOCK_PORTFOLIO_STATS.totalActiveLoans, change: "+14.2%", up: true, icon: <IndianRupee className="w-5 h-5 text-primary" /> },
          { title: "Avg. Trust Score", value: MOCK_PORTFOLIO_STATS.avgTrustScore, change: "+5.1%", up: true, icon: <Users className="w-5 h-5 text-blue-500" /> },
          { title: "Default Rate", value: MOCK_PORTFOLIO_STATS.defaultRate, change: "-2.4%", up: false, icon: <ShieldAlert className="w-5 h-5 text-red-400" /> },
          { title: "Net Yield", value: MOCK_PORTFOLIO_STATS.netYield, change: "+1.2%", up: true, icon: <PieChartIcon className="w-5 h-5 text-green-500" /> },
        ].map((stat, i) => (
          <Card key={i} className="stat-card border-border/30 bg-card/60 hover:border-border/60 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.title}</span>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.up ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className={stat.up ? "text-green-400" : "text-red-400"}>{stat.change}</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart */}
        <Card className="chart-card border-border/30 bg-card/60 h-[420px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Repayment Performance</CardTitle>
            <CardDescription>Active loans vs defaults — event-driven pipeline</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PORTFOLIO_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDefaults" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#27272a', borderRadius: '12px', fontSize: '13px' }} />
                <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                <Area type="monotone" dataKey="defaults" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDefaults)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Borrower Table */}
        <Card className="table-card border-border/30 bg-card/60 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base">Top Borrowers & Alerts</CardTitle>
                <CardDescription>Real-time risk classification</CardDescription>
              </div>
              <Badge className="bg-red-500/10 text-red-400 border-none text-xs">2 New Alerts</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs">Borrower</TableHead>
                  <TableHead className="text-xs">Score</TableHead>
                  <TableHead className="text-xs">Loan</TableHead>
                  <TableHead className="text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowers.map((b) => (
                  <TableRow key={b.id} className="table-row-anim border-border/15 hover:bg-card/60">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {b.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{b.name}</div>
                          <div className="text-[11px] text-muted-foreground">{b.platforms} platforms</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("font-bold text-sm", b.score >= 800 ? "text-primary" : b.score > 650 ? "text-yellow-400" : "text-red-400")}>
                          {b.score}
                        </span>
                        {b.trend === "up" ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">₹{b.loan.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={cn("text-[10px] font-medium",
                        b.status === "Healthy" ? "text-green-400 border-green-400/20" :
                        b.status === "At Risk" ? "text-yellow-400 border-yellow-400/20" :
                        "text-red-400 border-red-400/20"
                      )}>
                        {b.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
