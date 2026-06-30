import { findItems, findItemById } from "../repositories/item";
import type { Item } from "@warframe/shared";

export async function listItems(search?: string): Promise<Item[]> {
  return findItems(search);
}

export async function getItem(id: string): Promise<Item | null> {
  return findItemById(id);
}
