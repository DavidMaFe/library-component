let counter = 0;

/** Generates a document-unique id, e.g. `lc-dialog-heading-3`. */
export function uniqueId(prefix: string): string {
  return `${prefix}-${counter++}`;
}
