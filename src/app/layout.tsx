import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "TrustFlow — Gig Worker Trust Score Credit Engine",
  description: "Dynamic Credit Intelligence System that connects to multiple work platforms to generate a real-time Trust Score and instantly approve Daily-Pay micro-loans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark font-sans", inter.variable)}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="pt-20 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
