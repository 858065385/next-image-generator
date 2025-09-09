import { NextRequest, NextResponse } from "next/server";
import { genUniSeq, getIsoTimestr } from "@/backend/utils";
import { saveUser } from "@/backend/service/user";
import { User } from "@/backend/type/type";
import { createCreditUsage } from "@/backend/service/credit_usage";
import { getCreditUsageByUserId } from "@/backend/service/credit_usage";

export async function POST(request: NextRequest) {
  try {
    const { user, account } = await request.json();
    
    if (!user || !account) {
      return NextResponse.json({ error: "Missing user or account data" }, { status: 400 });
    }

    const dbUser: User = {
      uuid: genUniSeq(),
      email: user.email,
      nickname: user.name || "",
      avatar_url: user.image || "",
      signin_type: account.type,
      signin_provider: account.provider,
      signin_openid: account.providerAccountId,
      created_at: getIsoTimestr(),
      signin_ip: "",
    };

    console.log('Attempting to save user:', { email: user.email, uuid: dbUser.uuid });

    // 保存用户，添加重试逻辑
    let retries = 3;
    let saveSuccess = false;
    let lastError;

    while (retries > 0 && !saveSuccess) {
      try {
        await saveUser(dbUser);
        saveSuccess = true;
        console.log('User saved successfully');
      } catch (error) {
        lastError = error;
        console.error(`Failed to save user (${retries} retries left):`, error);
        retries--;
        if (retries > 0) {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!saveSuccess) {
      console.error('All retries failed for user registration');
      throw lastError || new Error('Failed to save user after retries');
    }

    // 创建积分记录
    try {
      const creditUsage = await getCreditUsageByUserId(dbUser.uuid);
      if (!creditUsage) {
        console.log('Creating credit usage for user:', dbUser.uuid);
        await createCreditUsage({
          user_id: dbUser.uuid,
          user_subscriptions_id: -1,
          is_subscription_active: false,
          used_count: 0,
          period_remain_count: 20,
          period_start: new Date(),
          period_end: new Date(
            new Date().setMonth(new Date().getMonth() + 1)
          ),
          created_at: new Date(),
        });
        console.log('Credit usage created successfully');
      }
    } catch (creditError) {
      console.error('Failed to create credit usage:', creditError);
      // 不要因为积分创建失败而阻止注册
    }

    return NextResponse.json({ success: true, userId: dbUser.uuid });
  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}