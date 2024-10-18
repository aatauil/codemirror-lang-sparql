# CodeMirror SPARQL Language Support

<span><a href="https://www.npmjs.com/package/codemirror-lang-sparql" title="NPM version badge"><img src="https://img.shields.io/npm/v/codemirror-lang-sparql?color=blue" alt="NPM version badge" /></a></span>

A CodeMirror extension that provides SPARQL syntax highlighting and language support.

## Usage

```ts
import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { sparql } from 'codemirror-lang-sparql';

const doc = `
 SELECT * WHERE { ?s ?p ?o }
`

new EditorView({
  state: EditorState.create({
    doc,
    extensions: [
      basicSetup,
      sparql(),
    ],
  }),
  parent: document.querySelector('#editor'),
});
```

## Developing the Grammar

To develop and test the SPARQL grammar, you can use the [Lezer Playground](https://lezer-playground.vercel.app/). The Lezer Playground is an online tool that allows you to write and test Lezer grammars interactively. Here's how you can use it:

1. **Access the Playground**: Open the [Lezer Playground](https://lezer-playground.vercel.app/) in your web browser.

2. **Load the Grammar**: Copy the contents of your `lezer-grammar.txt` file and paste it into the grammar editor section of the playground.

3. **Load JavaScript Code**: Copy the contents of your `javascript-stuff.txt` file and paste it into the javascript-stuff section of the playground.

4. **Test with Input**: Copy the contents of your `demo-text.txt` file and paste it into the demo-text section of the playground.

5. **Inspect the Parse Tree**: As you type, the playground will automatically generate a parse tree for your input. You can inspect this tree to ensure that your grammar is correctly parsing the input.

6. **Build the grammar**: Once you are satisfied with the changes to the grammar, you can copy the grammar and paste it in the `src/syntax.grammar` of this repository. Run `npm run build` to build the grammar. 
Note: if it fails to build run `npm run build-debug` this will include terms in the output to help debugging.

7. **Write a Test Case**: After making changes to the grammar, write a test case to ensure the new grammar rules work as expected. Add your test case to the appropriate test file in the repository.

8. **Run Tests**: Execute `npm run test` to run all test cases and verify that everything is functioning correctly. Ensure all tests pass before finalizing your changes.

## SPARQL Grammar Definition

The SPARQL grammar used in this CodeMirror extension is developed based on the official SPARQL 1.1 grammar definition provided by the W3C. You can find the detailed grammar specification in the [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/#sparqlGrammar) document. This specification serves as the foundation for parsing and understanding SPARQL queries, ensuring that the language support provided by this extension aligns with the standards set by the W3C.
