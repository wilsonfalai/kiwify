export type AsaasEnvironment = "local-fake" | "sandbox" | "production";

export interface PaymentsEnv {
  environment: AsaasEnvironment;
  baseUrl: string;
  apiKey?: string;
}

type PaymentsEnvironmentSource = Partial<
  Record<"ASAAS_ENVIRONMENT" | "ASAAS_BASE_URL" | "ASAAS_API_KEY", string | undefined>
>;

const DEFAULT_BASE_URLS: Record<AsaasEnvironment, string> = {
  "local-fake": "https://api-sandbox.asaas.com/v3",
  sandbox: "https://api-sandbox.asaas.com/v3",
  production: "https://api.asaas.com/v3"
};

export function parsePaymentsEnv(env: PaymentsEnvironmentSource = process.env): PaymentsEnv {
  const environment = env.ASAAS_ENVIRONMENT ?? "local-fake";

  if (!["local-fake", "sandbox", "production"].includes(environment)) {
    throw new Error("ASAAS_ENVIRONMENT must be local-fake, sandbox, or production.");
  }

  const typedEnvironment = environment as AsaasEnvironment;
  const baseUrl = env.ASAAS_BASE_URL?.trim() || DEFAULT_BASE_URLS[typedEnvironment];
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error("ASAAS_BASE_URL must be a valid URL.");
  }

  if (typedEnvironment !== "local-fake" && parsedUrl.protocol !== "https:") {
    throw new Error("ASAAS_BASE_URL must use HTTPS outside local-fake mode.");
  }

  const apiKey = env.ASAAS_API_KEY?.trim() || undefined;

  if (typedEnvironment !== "local-fake" && !apiKey) {
    throw new Error("ASAAS_API_KEY is required outside local-fake mode.");
  }

  return {
    environment: typedEnvironment,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey
  };
}
