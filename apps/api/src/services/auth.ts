import bcrypt from "bcryptjs";
import { findPlayerByUsername, insertPlayer } from "../repositories/player";
import { signToken } from "../lib/jwt";
import type { RegisterInput, LoginInput } from "@warframe/shared";

export type AuthResult = {
  id: string;
  username: string;
  platform: string;
  token: string;
};

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await findPlayerByUsername(input.username);
  if (existing) throw new Error("Username taken");

  const password_hash = await bcrypt.hash(input.password, 10);
  const id = await insertPlayer({
    username: input.username,
    password_hash,
    platform: input.platform,
    createdAt: new Date().toISOString(),
  });

  const token = await signToken({ sub: id, username: input.username });
  return { id, username: input.username, platform: input.platform, token };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const player = await findPlayerByUsername(input.username);
  if (!player) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(input.password, player.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const token = await signToken({ sub: player._id, username: player.username });
  return { id: player._id, username: player.username, platform: player.platform, token };
}
