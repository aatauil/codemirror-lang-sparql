import { parser } from "./syntax.grammar"
import { LRLanguage, LanguageSupport, foldNodeProp, foldInside } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"

export const SparqlLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Comment: t.comment,
        // Query type and clause keywords
        "BASE PREFIX SELECT CONSTRUCT DESCRIBE ASK WHERE DISTINCT REDUCED FROM NAMED": t.keyword,
        // Graph pattern keywords
        "UNION OPTIONAL MINUS GRAPH SERVICE SILENT FILTER BIND AS VALUES UNDEF": t.keyword,
        // Solution modifier keywords
        "GROUP BY HAVING ORDER ASC DESC LIMIT OFFSET": t.keyword,
        // Update operation keywords
        "LOAD INTO TO CLEAR DROP CREATE ADD MOVE COPY INSERT DATA DELETE WITH DEFAULT ALL USING": t.keyword,
        // Built-in function keywords
        "STR LANG LANGMATCHES DATATYPE BOUND IRI URI BNODE RAND ABS CEIL FLOOR ROUND": t.keyword,
        "CONCAT STRLEN UCASE LCASE ENCODE_FOR_URI CONTAINS STRSTARTS STRENDS STRBEFORE STRAFTER": t.keyword,
        "YEAR MONTH DAY HOURS MINUTES SECONDS TIMEZONE TZ NOW UUID STRUUID": t.keyword,
        "MD5 SHA1 SHA256 SHA384 SHA512 COALESCE IF STRLANG STRDT SAMETERM": t.keyword,
        "ISIRI ISURI ISBLANK ISLITERAL ISNUMERIC EXISTS NOT IN SUBSTR REPLACE REGEX": t.keyword,
        // Aggregate function keywords
        "COUNT SUM MIN MAX AVG SAMPLE GROUP_CONCAT SEPARATOR": t.keyword,
        "Var ObjectListPath/..": t.variableName,
        String: t.string,
        Integer: t.integer,
        "Double Decimal": t.float,
        "{ }": t.brace,
        Langstag: t.annotation,
        "TRUE FALSE": t.bool,
        "VerbPath Namespace IriRef": t.namespace,
        "Iri": t.url,
        "RDFLiteral/Iri": t.typeName,
      }),
      foldNodeProp.add({ 
        GroupGraphPattern: foldInside,
        QuadData: foldInside,
        Prologue(tree) { return { from: tree.from + 7, to: tree.to - 0} }
      }),
    ]
  }),
})

export function sparql() {
  return new LanguageSupport(SparqlLanguage)
}