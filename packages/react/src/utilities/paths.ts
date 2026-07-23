export function getPropertyValue(model: unknown, propertyPath: string): unknown {
  return propertyPath.split('.').filter(Boolean).reduce<unknown>((value, segment) => {
    if (value === null || value === undefined || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[segment];
  }, model);
}

export function setPropertyValue<TModel extends Record<string, unknown>>(
  model: TModel,
  propertyPath: string,
  value: unknown
): TModel {
  const segments = propertyPath.split('.').filter(Boolean);
  if (segments.length === 0) return model;

  const clone = Array.isArray(model) ? [...model] : { ...model };
  let source: unknown = model;
  let target: Record<string, unknown> | unknown[] = clone as Record<string, unknown>;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      (target as Record<string, unknown>)[segment] = value;
      return;
    }
    const sourceValue = source && typeof source === 'object'
      ? (source as Record<string, unknown>)[segment]
      : undefined;
    const next = Array.isArray(sourceValue)
      ? [...sourceValue]
      : sourceValue && typeof sourceValue === 'object'
        ? { ...(sourceValue as Record<string, unknown>) }
        : /^\d+$/u.test(segments[index + 1] ?? '') ? [] : {};
    (target as Record<string, unknown>)[segment] = next;
    target = next as Record<string, unknown>;
    source = sourceValue;
  });

  return clone as TModel;
}

export function fieldId(propertyPath: string): string {
  return `validation-field-${propertyPath.replace(/[^a-z0-9_-]+/giu, '-')}`;
}
