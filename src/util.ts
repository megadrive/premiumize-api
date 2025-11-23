export function obfuscateString(s: string, percentToHide = 0.25): string {
  const hideLength = Math.floor(s.length * percentToHide);
  return `${s.slice(0, hideLength)}...${s.slice(-hideLength)}`;
}
