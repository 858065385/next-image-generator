import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createEffectResult } from "@/backend/service/effect_result";
import { genEffectResultId } from "@/backend/utils/genId";
import { generateCheck } from "@/backend/service/generate-_check";

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
  const { model, prompt, width, height, output_format, aspect_ratio, user_id, user_email, effect_link_name, version, credit } = requestBody;
  // check user
  const result = await generateCheck(user_id, user_email, credit);
  if (result !== 1) {
    return NextResponse.json({ detail: "Failed to create effect result" }, { status: 500 });
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

  const prediction = await replicate.predictions.create(options as any);
  if (prediction?.error) {
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
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

  return NextResponse.json(prediction, { status: 201 });
}
