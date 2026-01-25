# SPARQL 1.2 Grammar Implementation Plan

## Overview

Update the CodeMirror 6 SPARQL parser from SPARQL 1.1 to SPARQL 1.2 compliance. The grammar must pass all W3C SPARQL 1.2 test suites (334 tests in `rdf-tests/sparql/sparql12/`).

## Key SPARQL 1.2 Features to Implement

### 1. Reified Triples (RDF-star)
```sparql
<< :s :p :o >>                    # Basic reified triple
<< :s :p :o ~ :reifierId >>       # With named reifier
<< :s :p :o ~ _:b1 >>             # With blank node reifier
```

### 2. Triple Terms (Quoted Triples)
```sparql
<<( :s :p :o )>>                  # Triple term (value)
<<( ?s ?p ?o )>>                  # Triple term with variables
BIND(<<(?s ?p ?o)>> AS ?t)        # In expressions
```

### 3. Annotation Blocks
```sparql
?s ?p ?o {| :source :wiki |} .                    # Anonymous annotation
?s ?p ?o ~ :r1 {| :source :wiki |} .              # Named reifier + annotation
?s ?p ?o ~ :r1 {| :a :b |} ~ :r2 {| :c :d |} .   # Multiple annotations
```

### 4. Language Direction Support
```sparql
"text"@en--ltr                    # Left-to-right direction
"text"@ar--rtl                    # Right-to-left direction
LANGDIR(?v)                       # Get language direction
hasLANG(?v), hasLANGDIR(?v)       # Type checks
STRLANGDIR(?s, ?lang, ?dir)       # Create directional literal
```

### 5. VERSION Declaration
```sparql
VERSION "1.2"
PREFIX : <http://example/>
SELECT * { ?s ?p ?o }
```

### 6. Codepoint Escapes
```sparql
\u0041\u0053\u004B {}             # = ASK {}
```

### 7. New Built-in Functions
- `TRIPLE(s, p, o)` - construct triple term
- `SUBJECT(t)`, `PREDICATE(t)`, `OBJECT(t)` - extract components
- `isTRIPLE(t)` - type check
- `hasLANG(lit)`, `hasLANGDIR(lit)` - language checks
- `LANGDIR(lit)`, `STRLANGDIR(s, lang, dir)` - direction functions

---

## Implementation Phases

### Phase 1: Token Layer Updates
**Files:** `src/syntax.grammar` (tokens section, lines 642-808)

#### 1.1 New Multi-character Tokens
Add to `@tokens` section:
```
"<<" ">>" "<<(" ")>>" "{|" "|}" "~"
```

#### 1.2 Language Direction Token
Replace `Langtag` (line 683-685) with `LANG_DIR`:
```
LANG_DIR {
  '@' $[a-zA-Z]+ ('-' $[a-zA-Z0-9]+)* ('--' $[a-zA-Z]+)?
}
```

#### 1.3 Token Precedence
Add precedence rules to avoid conflicts:
```
@precedence {
  "<<(", "<<", "<"
}
@precedence {
  ")>>", ">>", ">"
}
```

#### 1.4 Codepoint Escape Support
Extend `Echar` (line 751-753) to include Unicode escapes:
```
Echar {
  '\\' ($[tbnrf\"\'\\] | 'u' Hex Hex Hex Hex | 'U' Hex Hex Hex Hex Hex Hex Hex Hex)
}
```

**Note:** Codepoint escapes outside strings (like `\u0041\u0053\u004B {}`) will be handled via a pre-processor approach:
- Add a `preprocessCodepointEscapes(input)` function that expands `\uXXXX` and `\UXXXXXXXX` sequences before parsing
- This keeps the grammar clean while supporting the full SPARQL 1.2 spec
- The pre-processor will be called automatically by the language configuration

---

### Phase 2: Triple Terms
**Files:** `src/syntax.grammar` (grammar rules section)

#### 2.1 New Rules
Add after `GraphTerm` (around line 424):
```
TripleTerm {
  '<<(' ttSubject Verb ttObject ')>>'
}

ttSubject {
  Var | Iri | RDFLiteral | NumericLiteral | BooleanLiteral | BlankNode | TripleTerm
}

ttObject {
  Var | Iri | RDFLiteral | NumericLiteral | BooleanLiteral | BlankNode | TripleTerm
}

TripleTermData {
  '<<(' ttDataSubject ( Iri | A_predicate ) ttDataObject ')>>'
}

ttDataSubject {
  Iri
}

ttDataObject {
  Iri | RDFLiteral | NumericLiteral | BooleanLiteral | TripleTermData
}
```

#### 2.2 Modify VarOrTerm (line 415-417)
```
VarOrTerm {
  Var | GraphTerm | TripleTerm
}
```

#### 2.3 Modify DataBlockValue (line 255-257)
```
DataBlockValue {
  Iri | RDFLiteral | NumericLiteral | BooleanLiteral | UNDEF | TripleTermData
}
```

---

### Phase 3: Reified Triples
**Files:** `src/syntax.grammar`

#### 3.1 New Rules
```
ReifiedTriple {
  '<<' rtSubject Verb rtObject Reifier? '>>'
}

rtSubject {
  Var | Iri | RDFLiteral | NumericLiteral | BooleanLiteral | BlankNode | ReifiedTriple | TripleTerm
}

rtObject {
  Var | Iri | RDFLiteral | NumericLiteral | BooleanLiteral | BlankNode | ReifiedTriple | TripleTerm
}

Reifier {
  '~' VarOrReifierId?
}

VarOrReifierId {
  Var | Iri | BlankNode
}

ReifiedTripleBlock {
  ReifiedTriple PropertyList
}

ReifiedTripleBlockPath {
  ReifiedTriple PropertyListPath
}
```

#### 3.2 Modify GraphNode (line 407-409)
```
GraphNode {
  VarOrTerm | TriplesNode | ReifiedTriple
}
```

#### 3.3 Modify GraphNodePath (line 411-413)
```
GraphNodePath {
  VarOrTerm | TriplesNodePath | ReifiedTriple
}
```

#### 3.4 Modify TriplesSameSubject (line 295-297)
```
TriplesSameSubject {
  VarOrTerm PropertyListNotEmpty | TriplesNode PropertyList | ReifiedTripleBlock
}
```

#### 3.5 Modify TriplesSameSubjectPath (line 319-321)
```
TriplesSameSubjectPath {
  VarOrTerm PropertyListPathNotEmpty | TriplesNodePath PropertyListPath | ReifiedTripleBlockPath
}
```

---

### Phase 4: Annotations
**Files:** `src/syntax.grammar`

#### 4.1 New Rules
```
Annotation {
  ( Reifier | AnnotationBlock )*
}

AnnotationBlock {
  '{|' PropertyListNotEmpty '|}'
}

AnnotationPath {
  ( Reifier | AnnotationBlockPath )*
}

AnnotationBlockPath {
  '{|' PropertyListPathNotEmpty '|}'
}
```

#### 4.2 Modify Object (line 315-317)
```
Object {
  GraphNode Annotation
}
```

#### 4.3 Modify ObjectPath (line 343-345)
```
ObjectPath {
  GraphNodePath AnnotationPath
}
```

---

### Phase 5: Expression Triple Terms
**Files:** `src/syntax.grammar`

#### 5.1 New Rules
```
ExprTripleTerm {
  '<<(' exprTTSubject Verb exprTTObject ')>>'
}

exprTTSubject {
  Iri | Var
}

exprTTObject {
  Iri | RDFLiteral | NumericLiteral | BooleanLiteral | Var | ExprTripleTerm
}
```

#### 5.2 Modify PrimaryExpression (line 483-493)
```
PrimaryExpression {
  BrackettedExpression | BuiltInCall | IriOrFunction |
  RDFLiteral | NumericLiteral | BooleanLiteral | Var | ExprTripleTerm
}
```

---

### Phase 6: VERSION Declaration
**Files:** `src/syntax.grammar`

#### 6.1 New Rules
```
VersionDecl {
  VERSION String
}
```

#### 6.2 Modify Prologue (line 11-13)
```
Prologue {
  VersionDecl? ( BaseDecl | PrefixDecl )*
}
```

---

### Phase 7: New Built-in Functions
**Files:** `src/syntax.grammar`

#### 7.1 Add to BuiltInCall (line 499-555)
```
| LANGDIR '(' Expression ')'
| hasLANG '(' Expression ')'
| hasLANGDIR '(' Expression ')'
| isTRIPLE '(' Expression ')'
| TRIPLE '(' Expression ',' Expression ',' Expression ')'
| SUBJECT '(' Expression ')'
| PREDICATE '(' Expression ')'
| OBJECT '(' Expression ')'
| STRLANGDIR '(' Expression ',' Expression ',' Expression ')'
```

---

### Phase 8: Keyword Registration
**Files:** `src/syntax.grammar`

#### 8.1 Update @external specialize (line 810-818)
Add new keywords:
```
VERSION, LANGDIR, hasLANG, hasLANGDIR, isTRIPLE, TRIPLE, SUBJECT, PREDICATE, OBJECT, STRLANGDIR
```

Note: `hasLANG` etc. need case-insensitive handling - they may need special treatment since they contain lowercase characters in the spec.

---

### Phase 9: Syntax Highlighting
**Files:** `src/index.ts`

#### 9.1 Update styleTags
```typescript
styleTags({
  // Existing...

  // New SPARQL 1.2
  "VERSION LANGDIR TRIPLE SUBJECT PREDICATE OBJECT STRLANGDIR": t.keyword,
  "hasLANG hasLANGDIR isTRIPLE": t.keyword,
  "ReifiedTriple/...": t.special,
  "TripleTerm/...": t.atom,
  "AnnotationBlock/...": t.meta,
  "Reifier/~": t.operator,
})
```

#### 9.2 Update foldNodeProp
```typescript
foldNodeProp.add({
  // Existing...
  AnnotationBlock: foldInside,
})
```

---

### Phase 10: Codepoint Escape Pre-processor
**Files:** `src/preprocess.ts` (new file), `src/index.ts`

#### 10.1 Create Pre-processor Function
```typescript
// src/preprocess.ts
export function preprocessCodepointEscapes(input: string): string {
  return input.replace(
    /\\u([0-9A-Fa-f]{4})|\\U([0-9A-Fa-f]{8})/g,
    (_, u4, u8) => {
      const codepoint = parseInt(u4 || u8, 16);
      return String.fromCodePoint(codepoint);
    }
  );
}
```

#### 10.2 Integrate with Language Configuration
Update `src/index.ts` to wrap the parser with preprocessing.

---

### Phase 11: Modify RDFLiteral
**Files:** `src/syntax.grammar`

#### 11.1 Update RDFLiteral (line 592-594)
Change `Langtag` to `LANG_DIR`:
```
RDFLiteral {
  String ( LANG_DIR | ( '^^' Iri ) )?
}
```

---

## Testing Strategy

### Test Harness Creation
Create `test/w3c-sparql12.js`:

```javascript
import { SparqlLanguage } from '../dist/index.js';
import { fileTests } from '@lezer/generator/test';
import * as fs from 'fs';
import * as path from 'path';

const testDir = 'rdf-tests/sparql/sparql12';

// Positive syntax tests - should parse without errors
const positiveDirs = [
  'syntax-triple-terms-positive',
  'codepoint-escapes',  // Exclude *-bad-* files
  'version',            // Exclude *-bad-* files
  'eval-triple-terms',
  'lang-basedir',
  'expression',
  'grouping',
  'rdf11',
  'syntax'
];

// Negative syntax tests - should produce parse errors
const negativeDirs = [
  'syntax-triple-terms-negative'
];

function hasErrors(tree) {
  let found = false;
  tree.iterate({ enter: (node) => { if (node.type.isError) found = true; }});
  return found;
}

// Test positive cases
for (const dir of positiveDirs) {
  const files = fs.readdirSync(path.join(testDir, dir))
    .filter(f => f.endsWith('.rq') && !f.includes('-bad'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(testDir, dir, file), 'utf8');
    const tree = SparqlLanguage.parser.parse(content);
    if (hasErrors(tree)) {
      console.error(`FAIL (positive): ${dir}/${file}`);
    }
  }
}

// Test negative cases
for (const dir of negativeDirs) {
  const files = fs.readdirSync(path.join(testDir, dir))
    .filter(f => f.endsWith('.rq'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(testDir, dir, file), 'utf8');
    const tree = SparqlLanguage.parser.parse(content);
    // Note: Lezer parsers are error-tolerant, so we check for error nodes
    if (!hasErrors(tree)) {
      console.warn(`WARN (negative): ${dir}/${file} - parsed without errors`);
    }
  }
}
```

### Testing Milestones

| Milestone | Test Category | Count | Validation |
|-----------|---------------|-------|------------|
| M1 | basic-tripleterm-*.rq | ~20 | Triple terms parse correctly |
| M2 | basic-reifier-*.rq | ~15 | Reified triples work |
| M3 | annotation-*.rq | ~35 | Annotation blocks work |
| M4 | nested-*.rq | ~10 | Nested structures work |
| M5 | expr-*.rq | ~10 | Expression triple terms work |
| M6 | codepoint-esc-*.rq | 8 | Unicode escapes work |
| M7 | version-*.rq | 6 | VERSION declaration works |
| M8 | lang-basedir/*.rq | ~12 | Language direction works |
| M9 | syntax-triple-terms-negative | 67 | Invalid syntax rejected |

---

## Risk Mitigation

### High Risk: Token Ambiguity (`<<` vs `<`)
- **Mitigation:** Use explicit `@precedence` rules; test edge cases like `<<:iri>>`

### High Risk: Grammar Conflicts
- **Mitigation:** Use Lezer playground for iterative testing before committing

### Medium Risk: Codepoint Escapes Outside Strings
- **Mitigation:** Use pre-processor approach (Phase 10) to expand escapes before parsing

### Medium Risk: Backwards Compatibility
- **Mitigation:** Run SPARQL 1.0/1.1 test suites after each phase

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/syntax.grammar` | ~150-200 lines of additions/modifications |
| `src/preprocess.ts` | New file (~15 lines) - codepoint escape preprocessor |
| `src/index.ts` | ~20 lines for style tags + preprocessor integration |
| `test/w3c-sparql12.js` | New file (~80 lines) |
| `test/cases.txt` | Add SPARQL 1.2 test cases |
| `package.json` | Add test script for W3C tests |

---

## Verification

After implementation:

1. **Build:** `npm run build` - must complete without errors
2. **Unit tests:** `npm test` - existing tests must pass
3. **W3C tests:** `node test/w3c-sparql12.js` - all 334 SPARQL 1.2 tests
4. **Regression:** Run against SPARQL 1.0/1.1 test suites
5. **Manual:** Test in Lezer playground with complex queries from `compound-all.rq`
