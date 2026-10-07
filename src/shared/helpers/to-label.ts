export const toLabel = (value: unknown, index: number): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    const label = String(value).trim();
    if (label !== '') {
      return label;
    }
  }
  return `Row ${index + 1}`;
};
