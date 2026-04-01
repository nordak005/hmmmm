import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { user_id, platform_name } = await req.json();

    if (!platform_name) {
      return NextResponse.json({ error: "Platform name required" }, { status: 400 });
    }

    if (!user_id && isSupabaseConfigured) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 });
    }

    // Determine mock icon/earnings based on platform name
    let icon = "💼";
    let mockEarnings = Math.floor(Math.random() * 20000) + 1000;
    const nameLower = platform_name.toLowerCase();
    
    if (nameLower.includes("uber")) icon = "🚗";
    else if (nameLower.includes("upwork")) icon = "💻";
    else if (nameLower.includes("swiggy") || nameLower.includes("zomato")) icon = "🍔";
    else if (nameLower.includes("fiverr")) icon = "🎨";

    let insertedData = null;

    if (isSupabaseConfigured && user_id && user_id.length === 36) {
      const { data, error } = await supabase.from('connected_platforms').insert([{
        user_id: user_id,
        platform_name: platform_name,
        platform_icon: icon,
        earnings: mockEarnings,
        status: "synced"
      }]).select();

      if (error) {
        return NextResponse.json({ error: "Failed to connect platform" }, { status: 500 });
      }
      insertedData = data ? data[0] : null;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully connected to ${platform_name}`,
      platform: insertedData || {
        platform_name,
        platform_icon: icon,
        earnings: mockEarnings,
        status: "synced"
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
