import { parser } from "./syntax.grammar"
import { LRLanguage, LanguageSupport } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"

export const SparqlLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Comment: t.comment,
        "BASE PREFIX SELECT CONSTRUCT DESCRIBE WHERE DISTINCT REDUCED STR LANG LANGMATCHES DATATYPE ASK BOUND IRI URI BNODE RAND ABS CEIL FLOOR ROUND CONCAT STRLEN UCASE LCASE ENCODE_FOR_URI CONTAINS STRSTARTS STRENDS STRBEFORE STRAFTER YEAR MONTH DAY HOURS MINUTES SECONDS TIMEZONE TZ NOW UUID STRUUID MD5 SHA1 SHA256 SHA384 SHA512 COALESCE IF STRLANG STRDT SAMETERM ISIRI ISURI ISBLANK ISLITERAL ISNUMERIC COUNT SUM MIN MAX AVG SAMPLE GROUP_CONCAT SEPARATOR SUBSTR REPLACE REGEX EXISTS NOT IN GROUP BY HAVING ORDER ASC DESC LIMIT OFFSET VALUES UNDEF UNION OPTIONAL MINUS GRAPH SERVICE SILENT FILTER BIND AS FROM NAMED LOAD INTO TO CLEAR DROP CREATE ADD MOVE COPY INSERT DATA DELETE WITH DEFAULT ALL USING": t.keyword,
        "Var ObjectListPath/..": t.variableName,
        String: t.string,
        Integer: t.integer,
        "Double Decimal": t.float,
        "{ }": t.brace,
        Langstag: t.annotation,
        "TRUE FALSE": t.bool
      })
    ]
  }),
})

export function sparql() {
  return new LanguageSupport(SparqlLanguage)
}