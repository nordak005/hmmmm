// Centralized mock data — used as fallback when Supabase is not configured
// or when the database tables are empty.

export const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

export const MOCK_TRUST_SCORE = {
  score: 855,
  label: "Excellent",
  earnings_weight: 0.35,
  ratings_weight: 0.25,
  completion_weight: 0.20,
  repayment_weight: 0.20,
  platforms_connected: 3,
  max_loan: 5000,
};

export const MOCK_SCORE_HISTORY = [
  { month: "Jan", score: 550 },
  { month: "Feb", score: 600 },
  { month: "Mar", score: 680 },
  { month: "Apr", score: 720 },
  { month: "May", score: 780 },
  { month: "Jun", score: 855 },
];

export const MOCK_PLATFORMS = [
  { id: "p1", platform_name: "Uber", platform_icon: "🚗", earnings: 12450, status: "synced" },
  { id: "p2", platform_name: "Upwork", platform_icon: "💻", earnings: 45000, status: "synced" },
  { id: "p3", platform_name: "Swiggy", platform_icon: "🍔", earnings: 8320, status: "synced" },
  { id: "p4", platform_name: "Zomato", platform_icon: "🍕", earnings: 5120, status: "synced" },
];

export const MOCK_EARNINGS = [
  { id: "e1", platform: "Uber", amount: 1250.50, time: "2 hours ago", status: "cleared", icon: "🚗" },
  { id: "e2", platform: "Upwork", amount: 4500.00, time: "1 day ago", status: "cleared", icon: "💻" },
  { id: "e3", platform: "Swiggy", amount: 452.20, time: "2 days ago", status: "cleared", icon: "🍔" },
  { id: "e4", platform: "Fiverr", amount: 2100.00, time: "3 days ago", status: "pending", icon: "🎨" },
  { id: "e5", platform: "Uber", amount: 890.00, time: "4 days ago", status: "cleared", icon: "🚗" },
  { id: "e6", platform: "Zomato", amount: 340.00, time: "5 days ago", status: "cleared", icon: "🍕" },
];

export const MOCK_LOANS = [
  { id: "l1", amount: 2000, fee: 100, total_repayment: 2100, daily_deduction: 150, trust_score: 820, status: "repaid", created_at: "2026-02-15" },
  { id: "l2", amount: 3000, fee: 150, total_repayment: 3150, daily_deduction: 225, trust_score: 840, status: "repaid", created_at: "2026-03-01" },
  { id: "l3", amount: 5000, fee: 250, total_repayment: 5250, daily_deduction: 375, trust_score: 855, status: "approved", created_at: "2026-03-28" },
];

const firstNames = ["Rahul", "Anjali", "Vikram", "Priya", "Rohan", "Sanjay", "Neha", "Amit", "Kavita", "Aditya", "Sneha", "Karan", "Pooja", "Raj", "Megha", "Arjun", "Tanya", "Akash", "Riya", "Mohit", "Sameer", "Deepak"];
const lastNames = ["Sharma", "Singh", "Kumar", "Patel", "Das", "Gupta", "Verma", "Reddy", "Joshi", "Bose", "Rao", "Nair", "Iyer", "Yadav", "Chauhan", "Mishra", "Chowdhury"];
const platformOptions = ["Uber", "Upwork", "Swiggy", "Zomato", "Fiverr", "Ola", "Blinkit", "Zepto", "UrbanCompany"];

export const MOCK_BORROWERS = Array.from({ length: 500 }).map((_, i) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  // Bell curve distribution favoring 600-800
  const randomFactor = (Math.random() + Math.random() + Math.random()) / 3;
  const score = Math.floor(randomFactor * 500) + 400; 
  
  const loan = score >= 850 ? 5000 : score >= 700 ? 2000 : score >= 500 ? 500 : 0;
  
  const numPlatforms = Math.floor(Math.random() * 3) + 1;
  const userPlatforms = [];
  for(let p=0; p<numPlatforms; p++) {
    userPlatforms.push(platformOptions[Math.floor(Math.random() * platformOptions.length)]);
  }
  const uniquePlatforms = Array.from(new Set(userPlatforms));
  
  const isHealthy = score > 750;
  const isSuspended = score < 600;
  
  return {
    id: `b${i+1}`,
    name: `${firstName} ${lastName}`,
    score: score,
    loan: loan,
    platforms: numPlatforms,
    platformNames: uniquePlatforms.join(", "),
    status: isHealthy ? "Healthy" : isSuspended ? "Suspended" : "At Risk",
    trend: score > 700 ? "up" : "down",
    email: `${firstName.toLocaleLowerCase()}.${lastName.toLocaleLowerCase()}${i}@example.com`
  };
});

export const MOCK_PORTFOLIO_DATA = [
  { month: "Jan", defaults: 20, active: 100 },
  { month: "Feb", defaults: 22, active: 120 },
  { month: "Mar", defaults: 15, active: 140 },
  { month: "Apr", defaults: 10, active: 180 },
  { month: "May", defaults: 8, active: 220 },
  { month: "Jun", defaults: 5, active: 300 },
];

export const MOCK_PORTFOLIO_STATS = {
  totalActiveLoans: "₹18.4M",
  avgTrustScore: 812,
  defaultRate: "3.2%",
  netYield: "18.5%",
  healthyPct: 92,
  atRiskPct: 5,
  defaultPct: 3,
};

// Helper: get score label
export function getScoreLabel(score: number): string {
  if (score >= 850) return "Excellent";
  if (score >= 750) return "Great";
  if (score >= 650) return "Good";
  if (score >= 500) return "Fair";
  return "Building";
}

// Helper: get max eligible loan
export function getMaxLoan(score: number): number {
  if (score >= 850) return 5000;
  if (score >= 700) return 2000;
  if (score >= 500) return 500;
  return 0;
}
