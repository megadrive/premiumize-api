export function obfuscateString(s: string): string {
  // first 2 characters and last 2 are shown, rest are * characters
  return `${s.slice(0, 2)}...${s.slice(-2)}`;
}
