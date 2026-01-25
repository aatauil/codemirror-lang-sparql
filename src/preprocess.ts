/**
 * Pre-processor for SPARQL 1.2 codepoint escapes outside of strings.
 * Expands \uXXXX and \UXXXXXXXX sequences to their Unicode characters.
 */
export function preprocessCodepointEscapes(input: string): string {
  return input.replace(
    /\\u([0-9A-Fa-f]{4})|\\U([0-9A-Fa-f]{8})/g,
    (_, u4, u8) => {
      const codepoint = parseInt(u4 || u8, 16);
      return String.fromCodePoint(codepoint);
    }
  );
}
