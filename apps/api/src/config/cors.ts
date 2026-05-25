function splitOrigins(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function assertValidOrigin(origin: string) {
  try {
    const url = new URL(origin);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new Error(`Invalid CORS origin: ${origin}`);
  }
}

export function parseCorsOrigins(webUrl: string, extraOrigins?: string) {
  const combined = [...splitOrigins(webUrl), ...(extraOrigins ? splitOrigins(extraOrigins) : [])];
  const unique = [...new Set(combined)];

  if (unique.length === 0) {
    throw new Error("At least one CORS origin is required.");
  }

  unique.forEach(assertValidOrigin);
  return unique;
}

export function isAllowedCorsOrigin(origin: string | undefined, allowedOrigins: string[]) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
}
