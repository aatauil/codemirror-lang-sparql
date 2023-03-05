import * as tokens from "./parser.terms.js"

/**
 * Keywords are matched in a case-insensitive manner with the exception
 * of the keyword 'a' which, in line with Turtle and N3, is used in place
 * of the IRI rdf:type (in full, http://www.w3.org/1999/02/22-rdf-syntax-ns#type).
 */
export const caseInsensitive = (value, stack) => {
  return tokens[value.toUpperCase()] || -1;
};