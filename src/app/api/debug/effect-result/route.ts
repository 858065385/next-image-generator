import { NextRequest, NextResponse } from "next/server";
import { createEffectResult } from "@/backend/services/effect_result";
import { genEffectResultId } from "@/backend/utils/genId";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, prompt, effect_name, credit } = body;

    if (!user_id || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log('Creating effect result:', { user_id, prompt, effect_name, credit });

    const resultId = genEffectResultId();
    const effectResult = {
      result_id: resultId,
      user_id: user_id,
      original_id: `test-${Date.now()}`,
      effect_id: 0,
      effect_name: effect_name || 'test-effect',
      prompt: prompt,
      url: "",
      status: "completed",
      original_url: "",
      storage_type: "S3",
      running_time: 5,
      credit: credit || 1,
      request_params: JSON.stringify(body),
      created_at: new Date()
    };

    const result = await createEffectResult(effectResult);
    
    if (result) {
      return NextResponse.json({ 
        success: true, 
        result: result,
        message: "Effect result created successfully" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to create effect result" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating effect result:', error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}