/**
 * Custom error types for the Premiumize API client.
 *
 * - `PremiumizeError` represents an error returned by the Premiumize API itself
 *   (e.g. response payload with `status: "error"` or validation failures).
 * - `ApiRequestError` represents request/transport level failures (network,
 *   timeouts, non-2xx responses, underlying axios errors, etc.).
 *
 * Both errors preserve the original payloads so callers can inspect details.
 */

export class PremiumizeError extends Error {
  public readonly raw?: any;
  public readonly code?: number | string;
  public readonly status?: string;

  /**
   * Create a PremiumizeError.
   * @param message - Human-readable message.
   * @param raw - Raw API response or any extra information returned by the API.
   */
  constructor(message: string, raw?: any) {
    super(message);
    this.name = "PremiumizeError";
    this.raw = raw;

    if (raw && typeof raw === "object") {
      // Common fields that Premiumize responses sometimes include
      if ("code" in raw) this.code = raw.code;
      if ("status" in raw) this.status = raw.status;
    }

    // Fix prototype chain for instanceof checks when transpiled to ES5
    Object.setPrototypeOf(this, PremiumizeError.prototype);
  }
}

export class ApiRequestError extends Error {
  public readonly original?: any;
  public readonly isAxiosError: boolean;
  public readonly httpStatus?: number;
  public readonly responseData?: any;

  /**
   * Create an ApiRequestError.
   * @param message - Human-readable message.
   * @param original - The original error (for example an AxiosError) if available.
   */
  constructor(message: string, original?: any) {
    super(message);
    this.name = "ApiRequestError";
    this.original = original;

    // Many consumers will want to know if this was an axios error without importing axios.
    this.isAxiosError = !!(original && original.isAxiosError);

    // If original contains HTTP response info, surface it for convenience.
    if (original && typeof original === "object") {
      const resp = original.response ?? original;
      if (resp && typeof resp === "object") {
        if (typeof resp.status === "number") this.httpStatus = resp.status;
        if ("data" in resp) this.responseData = resp.data;
      }
    }

    // Fix prototype chain for instanceof checks when transpiled to ES5
    Object.setPrototypeOf(this, ApiRequestError.prototype);
  }
}
