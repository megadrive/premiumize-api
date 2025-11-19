export function obfuscateString(s: string, percentToHide = 0.5): string {
  const hideLength = Math.floor(s.length * percentToHide);
  return `${s.slice(0, hideLength)}...${s.slice(-hideLength)}`;
}
