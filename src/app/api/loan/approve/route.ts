import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { user_id, amount, current_score } = await req.json();

    if (!amount || !current_score) {
      return NextResponse.json({ error: "Missing required loan parameters" }, { status: 400 });
    }

    if (!user_id && isSupabaseConfigured) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 });
    }

    // Dynamic Credit Approval Logic
    let isApproved = false;
    let limit = 0;

    if (current_score >= 850) {
      limit = 5000;
      isApproved = amount <= limit;
    } else if (current_score >= 700) {
      limit = 2000;
      isApproved = amount <= limit;
    } else if (current_score >= 500) {
      limit = 500;
      isApproved = amount <= limit;
    }

    if (!isApproved) {
      return NextResponse.json({
        approved: false,
        reason: amount > limit ? "Amount exceeds pre-approved limit" : "Trust Score too low",
        max_eligible: limit
      });
    }

    // Success response
    const fee = amount * 0.05; // 5% platform fee
    const totalRepayment = amount + fee;
    const dailyDeduction = parseFloat((totalRepayment / 14).toFixed(2));

    let generatedLoanId = `LOAN-${Date.now()}`;
    
    // Store in proper schema
    if (isSupabaseConfigured && user_id && user_id.length === 36) { 
        const { data, error } = await supabase.from('micro_loans').insert([{
            user_id: user_id,
            amount: amount,
            fee: fee,
            total_repayment: totalRepayment,
            daily_deduction: dailyDeduction,
            trust_score: current_score,
            status: 'approved'
        }]).select();
        
        if (error) {
             console.error("Loan DB Error", error);
        } else if (data && data.length > 0) {
            generatedLoanId = data[0].id;
        }
    }
    
    return NextResponse.json({
        approved: true,
        loan_id: generatedLoanId,
        principal: amount,
        fee: fee,
        total_repayment: totalRepayment,
        daily_deduction: dailyDeduction,
        repayment_duration_days: 14,
        confidence_rating: current_score > 900 ? "95%" : current_score > 800 ? "85%" : "70%",
        status: "approved"
    });

  } catch (error) {
    return NextResponse.json({ error: "Loan processing failed" }, { status: 500 });
  }
}
