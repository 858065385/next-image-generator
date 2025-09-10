import { ResponseCodeEnum } from "@/backend/types/enum/response_code_enum";
import { getUserByUuidAndEmail, getUserByEmail } from "@/backend/services/user";
import { checkCreditUsageByUserId } from "@/backend/services/credit_usage";


export async function generateCheck(user_id: string, user_email: string, credit: string) {
  console.log('generateCheck called with:', { user_id, user_email, credit });
  
  if (user_id === undefined || user_email === undefined) {
    return Response.json({ error: "Please login first" }, { status: ResponseCodeEnum.UNAUTHORIZED });
  }

  let user;
  // 首先尝试通过UUID和email查找
  try {
    user = await getUserByUuidAndEmail(user_id, user_email);
    console.log('getUserByUuidAndEmail result:', user);
  } catch (error) {
    console.error('Database error in getUserByUuidAndEmail:', error);
    return Response.json({ 
      code: -1,
      error: "Database connection error. Please try again." 
    }, { status: 500 });
  }
  
  // 如果找不到，尝试只通过email查找（处理前端发送email作为user_id的情况）
  if (!user && user_id === user_email) {
    try {
      console.log('Trying getUserByEmail...');
      user = await getUserByEmail(user_email);
      console.log('getUserByEmail result:', user);
    } catch (error) {
      console.error('Database error in getUserByEmail:', error);
      return Response.json({ 
        code: -1,
        error: "Database connection error. Please try again." 
      }, { status: 500 });
    }
  }
  
  if (!user) {
    console.log('User not found');
    return Response.json({ 
      code: -1,
      error: "User not found. Please register first." 
    }, { status: ResponseCodeEnum.UNAUTHORIZED });
  }

  console.log('User found, checking credits...');
  
  try {
    const result = await checkCreditUsageByUserId(user.uuid, parseInt(credit));
    console.log('Credit check result:', result);
    
    if (result !== 1) {
      // this situation generally does not exist because a credit_usage is created when the user is created
      if (result === -1) {
        return Response.json({ 
          code: -4,
          detail: "Credit not initialized. Please try again." 
        }, { status: ResponseCodeEnum.CREDIT_NOT_INITED });
      }
      if (result === -2) {
        return Response.json({ 
          code: -3,
          detail: "You are not subscribed or your credit is not enough, please purchase credits or subscribe." 
        }, { status: ResponseCodeEnum.NONE_SUBSCRIBED });
      }
      if (result === -3) {
        return Response.json({ 
          code: -4,
          detail: "Your current monthly credit usage is exceeded" 
        }, { status: ResponseCodeEnum.FORBIDDEN });
      }   
    }
  } catch (error) {
    console.error('Credit check error:', error);
    return Response.json({ 
      code: -4,
      error: "Credit check failed. Please try again." 
    }, { status: 500 });
  }
  
  console.log('Generate check passed');
  return 1;
}