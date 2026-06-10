/**
 * Conditional className join helper.
 * Minimal shadcn-compatible version — no clsx / tailwind-merge dependencies.
 */
export function cn(
  ...classes: Array<string | number | undefined | null | false>
): string {
  return classes.filter(Boolean).join(' ');
}
