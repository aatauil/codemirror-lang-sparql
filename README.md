# CodeMirror SPARQL Language Support [alpha]

<span><a href="https://www.npmjs.com/package/@replit/codemirror-lang-solidity" title="NPM version badge"><img src="https://img.shields.io/npm/v/codemirror-lang-sparql?color=blue" alt="NPM version badge" /></a></span>

A CodeMirror extension that provides SPARQL syntax highlighting and language support.

## Note
This parser is not yet ready to be used. A lot still needs to happen, do not use in production.

### Usage

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
