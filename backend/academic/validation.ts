import { requireText, requireNonNegativeOrder } from '../../shared/validation/academic';

export function validateAcademicBase(input: { id?: string; name: string; active?: boolean; sortOrder: number }) {
  if (input.id !== undefined) requireText(input.id, 'id');
  requireText(input.name, 'name');
  requireNonNegativeOrder(input.sortOrder);
  return { ...input, name: input.name.trim(), active: input.active ?? true };
}
