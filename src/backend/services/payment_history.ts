import { PaymentHistory } from "../types/type";
import { create, update, getById, hasSuccessfulPaymentByUserId, getByUserId, countByUserId } from "../models/payment_history";

export async function createPaymentHistory(paymentHistory: PaymentHistory) {
  return await create(paymentHistory);
}

export async function updatePaymentHistory(paymentHistory: PaymentHistory) {
  return await update(paymentHistory);
}

export async function getPaymentHistoryById(id: string) {
  return await getById(id);
}

export async function checkUserHasSuccessfulPayment(user_id: string) {
  return await hasSuccessfulPaymentByUserId(user_id);
}

export async function getPaymentHistoryByUserId(user_id: string, page: number, limit: number) {
  const records = await getByUserId(user_id, page, limit);
  const total = await countByUserId(user_id);
  
  return {
    records,
    pagination: {
      current_page: page,
      per_page: limit,
      total_items: total,
      total_pages: Math.ceil(total / limit)
    }
  };
}
