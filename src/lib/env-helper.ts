import { readFileSync } from "fs";
import { join } from "path";

let envLocalCache: Record<string, string> | null = null;

function parseEnvLocal(): Record<string, string> {
  if (envLocalCache !== null) {
    return envLocalCache;
  }

  envLocalCache = {};

  try {
    const envLocalPath = join(process.cwd(), ".env.local");
    const envLocalContent = readFileSync(envLocalPath, "utf8");

    const lines = envLocalContent.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      const equalIndex = trimmedLine.indexOf("=");
      if (equalIndex === -1) {
        continue;
      }

      const key = trimmedLine.slice(0, equalIndex).trim();
      const value = trimmedLine.slice(equalIndex + 1).trim();
      const unquotedValue = value.replace(/^["']|["']$/g, "");
      envLocalCache[key] = unquotedValue;
    }
  } catch {
    // .env.local file doesn't exist
  }

  return envLocalCache;
}

export function getEnv(key: string, defaultValue?: string): string | undefined {
  const envLocal = parseEnvLocal();
  if (envLocal[key] !== undefined && envLocal[key] !== "") {
    return envLocal[key];
  }

  if (process.env[key] !== undefined && process.env[key] !== "") {
    return process.env[key];
  }

  return defaultValue;
}

export function getRequiredEnv(key: string): string {
  const value = getEnv(key);

  if (value === undefined || value === "") {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value;
}
