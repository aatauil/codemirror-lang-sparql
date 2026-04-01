import * as tokens from "./parser.terms.js"

/**
 * Case-insensitive keyword matcher for use as a Lezer @external specialize handler.
 *
 * SPARQL keywords are case-insensitive per the spec, with one exception: the
 * shorthand predicate 'a' (representing rdf:type) is case-sensitive and must
 * remain lowercase to avoid colliding with uppercase keyword matching.
 *
 * @param {string} value - The token text to look up
 * @param {Object} _stack - Lezer parse stack (required by the external specialize
 *   signature but not used here)
 * @returns {number} The term ID for the keyword, or -1 if not found
 */
export const caseInsensitive = (value, _stack) => {
  return tokens[value.toUpperCase()] || -1;
};