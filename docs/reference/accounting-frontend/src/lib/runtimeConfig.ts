type RuntimeConfigKey = "apiBaseUrl" | "wsBaseUrl" | "supabaseUrl" | "supabaseAnonKey";

type RuntimeConfig = {
  apiBaseUrl: string;
  wsBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<RuntimeConfig>;
  }
}

function readConfigValue(key: RuntimeConfigKey, envKey: string): string {
  const runtimeValue = window.__APP_CONFIG__?.[key];
  if (typeof runtimeValue === "string" && runtimeValue.trim()) {
    return runtimeValue.trim();
  }

  const envValue = (import.meta.env[envKey] as string | undefined)?.trim();
  if (envValue) {
    return envValue;
  }

  throw new Error(
    `Missing required frontend runtime config: ${key}. ` +
      `Provide window.__APP_CONFIG__.${key} or ${envKey}.`,
  );
}

function readOptionalConfigValue(key: RuntimeConfigKey, envKey: string): string {
  try {
    return readConfigValue(key, envKey);
  } catch {
    return "";
  }
}

export const runtimeConfig: RuntimeConfig = {
  // apiBaseUrl is optional — falls back to "" which means relative URLs.
  // In local dev, set VITE_API_BASE_URL=http://localhost:8000/api or rely on
  // the Vite proxy (/api → http://localhost:8000).
  apiBaseUrl: readOptionalConfigValue("apiBaseUrl", "VITE_API_BASE_URL"),
  // wsBaseUrl: direct WebSocket URL to the event-processor service.
  // e.g. wss://event-processor-staging.up.railway.app
  // Falls back to deriving from apiBaseUrl if not set.
  wsBaseUrl: readOptionalConfigValue("wsBaseUrl", "VITE_WS_BASE_URL"),
  supabaseUrl: readConfigValue("supabaseUrl", "VITE_SUPABASE_URL"),
  supabaseAnonKey: readConfigValue("supabaseAnonKey", "VITE_SUPABASE_ANON_KEY"),
};