export function requireText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
}

export function requireNonNegativeOrder(value: number): number {
  if (!Number.isInteger(value) || value < 0) throw new Error('sortOrder must be a non-negative integer');
  return value;
}
