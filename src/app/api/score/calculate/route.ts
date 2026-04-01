import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { user_id, latest_events } = await req.json();

    if (!user_id && isSupabaseConfigured) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Base mock calculation
    const baseScore = 750;
    let increment = 0;

    if (latest_events) {
      latest_events.forEach((event: { type: string, amount?: number }) => {
         if(event.type === 'EARNING_CLEARED') increment += 2;
         if(event.type === 'REFUND_REQUESTED') increment -= 5;
         if(event.type === 'RATING_5_STAR') increment += 10;
      });
    }

    const newScore = Math.min(1000, Math.max(300, baseScore + increment));

    const metrics = {
      earnings_weight: 0.35,
      ratings_weight: 0.25,
      completion_weight: 0.20,
      repayment_weight: 0.20
    };

    // If real Supabase auth user_id is passed, insert to DB
    if (isSupabaseConfigured && user_id && user_id.length === 36) {
      // Upsert or insert logic depending on schema, we'll just insert a new latest record for history
      await supabase.from('trust_scores').insert([{
        user_id: user_id,
        score: newScore,
        earnings_weight: metrics.earnings_weight,
        ratings_weight: metrics.ratings_weight,
        completion_weight: metrics.completion_weight,
        repayment_weight: metrics.repayment_weight,
        platforms_connected: 1 
      }]);
    }

    return NextResponse.json({
        trust_score: newScore,
        metrics: metrics,
        calculated_at: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ error: "Score calculation failed" }, { status: 500 });
  }
}
