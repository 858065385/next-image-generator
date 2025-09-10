import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createEffectResult } from "@/backend/services/effect_result";
import { genEffectResultId } from "@/backend/utils/genId";
import { generateCheck } from "@/backend/services/generate-_check";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const WEBHOOK_HOST = process.env.REPLICATE_URL

export async function POST(request: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
    );
  }
 
  const requestBody = await request.json();
  const { prompt, user_id, user_email, credit } = requestBody;
  
  // Default values for Flux1.1 Pro
  const model = "black-forest-labs/flux-1.1-pro";
  const version = "80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c";
  const effect_link_name = "flux-1-pro";
  const width = 1024;
  const height = 1024;
  const output_format = "jpg";
  const aspect_ratio = "1:1";
  // check user
  const result = await generateCheck(user_id, user_email, credit);
  if (result !== 1) {
    // Return the actual response from generateCheck which includes proper error codes
    return result;
  }

  const options = {
    version: version,
    model: model,
    input: { prompt, width, height, output_format, aspect_ratio, },
    webhook: "",
    webhook_events_filter: [] as string[],
  };

  if (WEBHOOK_HOST) {
    options.webhook = `${WEBHOOK_HOST}/api/webhook/replicate`;
    options.webhook_events_filter = ["start", "completed"];
  }

  let prediction;
  try {
    prediction = await replicate.predictions.create(options as any);
  } catch (error) {
    console.error('Replicate API error:', error);
    return NextResponse.json({ 
      code: -5,
      error: "Failed to create prediction with Replicate API" 
    }, { status: 500 });
  }
  
  if (prediction?.error) {
    return NextResponse.json({ 
      code: -5,
      detail: prediction.error 
    }, { status: 500 });
  }

  const resultId = genEffectResultId();
  createEffectResult({
    result_id: resultId,
    user_id: user_id,
    original_id: prediction.id,
    effect_id: 0,
    effect_name: effect_link_name,
    prompt: prompt,
    url: "",
    status: "pending",
    original_url: "",
    storage_type: "S3",
    running_time: -1,
    credit: credit,
    request_params: JSON.stringify(requestBody),
    created_at: new Date()
  }).catch(error => {
    console.error("Failed to create effect result:", error);
  });

  return NextResponse.json({ 
    code: 0,
    id: prediction.id,
    ...prediction 
  }, { status: 201 });
}
