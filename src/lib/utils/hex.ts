import { randomBytes } from "crypto";

export function generateRandomHex(length: number = 5): string {
  // Generate exactly the number of bytes we need
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}
