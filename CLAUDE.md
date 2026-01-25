# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A CodeMirror 6 extension providing SPARQL syntax highlighting and language support. The grammar implements SPARQL 1.1 query language specification from the W3C.

## Build Commands

```bash
npm run build          # Generate parser from grammar and bundle with rollup
npm run build-debug    # Build with --names flag for debugging parse errors
npm test               # Run mocha tests
```

## Architecture

### Parser Generation Pipeline
1. `src/syntax.grammar` - Lezer grammar definition for SPARQL 1.1
2. `lezer-generator` transforms grammar into `src/parser.js` and `src/parser.terms.js`
3. `rollup` bundles everything into `dist/`

### Key Files
- `src/syntax.grammar` - Complete SPARQL 1.1 grammar in Lezer format
- `src/tokens.js` - Case-insensitive keyword matching (SPARQL keywords are case-insensitive except `a`)
- `src/index.ts` - Entry point, configures parser with syntax highlighting via `styleTags`

### Testing
Tests use Lezer's `fileTests` format in `test/cases.txt`. Each test case has:
```
# Test name

<SPARQL input>

==>

<Expected parse tree>
```

### Grammar Development Workflow
Use the [Lezer Playground](https://lezer-playground.vercel.app/) for interactive grammar testing:
1. Copy `test/lezer-playground/lezer-grammar.txt` to playground grammar editor
2. Copy `test/lezer-playground/javascript-stuff.txt` to JS section
3. Copy `test/lezer-playground/demo-text.txt` to test input
4. After changes work in playground, update `src/syntax.grammar` and run build
