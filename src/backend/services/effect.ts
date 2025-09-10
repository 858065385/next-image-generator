
import { Effect } from "../types/type";
import { listByType } from "../models/effect";
import { getById } from "../models/effect";

export async function listEffectByType(type: number): Promise<Effect[]> {
  return await listByType(type);
}

export async function getEffectById(id: number): Promise<Effect | null> {
  const effect = await getById(id);
  return effect;
}
