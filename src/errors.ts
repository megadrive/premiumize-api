export class HTTPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HTTPError";
  }
}

export class PremiumizeError extends Error {
  internalError: any;

  constructor(message: string, error: unknown) {
    super(message);
    this.name = "PremiumizeError";
    this.internalError = error;
  }
}
