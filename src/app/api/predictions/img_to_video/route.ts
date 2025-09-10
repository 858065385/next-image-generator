import { NextResponse } from "next/server";
import { checkCreditUsageByUserId, reducePeriodRemainCountByUserId } from "@/backend/services/credit_usage";
import Replicate from "replicate";
import { ResponseCodeEnum } from "@/backend/types/enum/response_code_enum";
import { createEffectResult } from "@/backend/services/effect_result";
import { genEffectResultId } from "@/backend/utils/genId";
import { getUserByUuidAndEmail, getUserByEmail } from "@/backend/services/user";


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
  const { prompt, image_url, user_id, user_email, credit } = requestBody;
  
  // Default values for Kling v2.1
  const model = "kwaivgi/kling-v2.1";
  const version = "f045f3203a6faeb8a1b47dd4069fa397a8c83c41b418967f5ba095c57322ccb9";
  const effect_link_name = "kling-v12";

  if (!model && !version) {
    return NextResponse.json({ detail: "Either model or version must be specified" }, { status: 400 });
  }
// check user
  let user;
  // 首先尝试通过UUID和email查找
  user = await getUserByUuidAndEmail(user_id, user_email);
  
  // 如果找不到，尝试只通过email查找（处理前端发送email作为user_id的情况）
  if (!user && user_id === user_email) {
    user = await getUserByEmail(user_email);
  }
  
  if (!user) {
    return Response.json({ 
      code: -1,
      error: "Please login first" 
    }, { status: ResponseCodeEnum.UNAUTHORIZED });
  }

  const result = await checkCreditUsageByUserId(user.uuid, credit);
  if (result !== 1) {
    // this situation generally does not exist because a credit_usage is created when the user is created
    if (result === -1) {
      return Response.json({ detail: "try again" }, { status: ResponseCodeEnum.CREDIT_NOT_INITED });
    }
    if (result === -2) {
      return Response.json({ detail: "You are not subscribed or your credit is not enough, please purchase credits or subscribe." }, { status: ResponseCodeEnum.NONE_SUBSCRIBED });
    }
    if (result === -3) {
      return Response.json({ detail: "Your current monthly credit usage is exceeded" }, { status: ResponseCodeEnum.FORBIDDEN });
    }
  }

  // 创建replicate 请求参数
  const options = {
    version: version,
    model: model,
    input: {
      prompt: prompt,
      input_image: image_url,
    },
    webhook: WEBHOOK_HOST ? `${WEBHOOK_HOST}/api/webhook/replicate` : "",
    webhook_events_filter: WEBHOOK_HOST ? ["start", "completed"] : [],
  };

  // 发送replicate请求
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

  // 创建effect_result初始信息
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
    storage_type: "R2",
    running_time: -1,
    credit: credit,
    request_params: JSON.stringify(options),
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


