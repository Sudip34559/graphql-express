import "dotenv/config";

export function getEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

// If you expect numbers (like PORT)
export function getEnvNumber(name: string): number {
  const value = getEnv(name);
  const num = Number(value);

  if (Number.isNaN(num)) {
    throw new Error(`Environment variable '${name}' must be a number`);
  }

  return num;
}
