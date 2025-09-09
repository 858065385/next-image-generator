import { User } from "../type/type";
import { insertUser, getByEmail, searchUsersByKeyword, getAllUsersWithPagination } from "../models/user";
import { getByUuidAndEmail } from "../models/user";

export async function saveUser(user: User) {
  try {
    const existUser = await getByEmail(user.email);
    if (!existUser) {
      await insertUser(user);
    } else {
      user.id = existUser.id;
      user.uuid = existUser.uuid;
      user.created_at = existUser.created_at;
    }
    console.log("save user success: ", user.email);
  } catch (e) {
    console.log("save user failed: ", e);
    throw e;
  }
}

export async function getUserByUuidAndEmail(uuid: string, email: string) {
  return await getByUuidAndEmail(uuid, email);
}

export async function getUserByEmail(email: string) {
  return await getByEmail(email);
}

export async function searchUsers(keyword: string, page: number = 1, limit: number = 20) {
  return await searchUsersByKeyword(keyword, page, limit);
}

export async function getAllUsers(page: number = 1, limit: number = 20) {
  return await getAllUsersWithPagination(page, limit);
}
