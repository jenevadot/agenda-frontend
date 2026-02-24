/**
 * Generate idempotency key for booking requests
 * Uses Web Crypto API for secure UUID generation
 */
export function generarClaveIdempotencia(): string {
  return crypto.randomUUID();
}
