import fs from "node:fs";

let cachedHandbook: string | null = null;

export function loadHandbook(): string {
  if (cachedHandbook) {
    return cachedHandbook;
  }

  const handbookPath = process.env.ESI_HANDBOOK_PATH;

  if (!handbookPath) {
    throw new Error("ESI_HANDBOOK_PATH is not configured");
  }

  cachedHandbook = fs.readFileSync(handbookPath, "utf8");

  return cachedHandbook;
}
