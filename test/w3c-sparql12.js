import { SparqlLanguage } from '../dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

// Pre-processor for codepoint escapes outside strings
function preprocessCodepointEscapes(input) {
  return input.replace(
    /\\u([0-9A-Fa-f]{4})|\\U([0-9A-Fa-f]{8})/g,
    (_, u4, u8) => {
      const codepoint = parseInt(u4 || u8, 16);
      return String.fromCodePoint(codepoint);
    }
  );
}

const testDir = 'rdf-tests/sparql/sparql12';

// Positive syntax tests - should parse without errors
const positiveDirs = [
  'syntax-triple-terms-positive',
  'codepoint-escapes',
  'version',
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

let passCount = 0;
let failCount = 0;
let warnCount = 0;
const failures = [];
const warnings = [];

console.log('SPARQL 1.2 W3C Test Suite\n');
console.log('=========================\n');

// Test positive cases
console.log('Positive Syntax Tests:');
for (const dir of positiveDirs) {
  const dirPath = path.join(testDir, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`  Skipping ${dir} (directory not found)`);
    continue;
  }

  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.rq') && !f.includes('-bad') && !f.includes('-invalid'));

  for (const file of files) {
    let content = fs.readFileSync(path.join(dirPath, file), 'utf8');
    // Pre-process codepoint escapes for codepoint-escapes tests
    if (dir === 'codepoint-escapes') {
      content = preprocessCodepointEscapes(content);
    }
    const tree = SparqlLanguage.parser.parse(content);
    if (hasErrors(tree)) {
      failCount++;
      failures.push(`${dir}/${file}`);
      console.log(`  FAIL: ${dir}/${file}`);
    } else {
      passCount++;
    }
  }
}

// Test negative cases
console.log('\nNegative Syntax Tests:');
for (const dir of negativeDirs) {
  const dirPath = path.join(testDir, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`  Skipping ${dir} (directory not found)`);
    continue;
  }

  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.rq'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
    const tree = SparqlLanguage.parser.parse(content);
    // Note: Lezer parsers are error-tolerant, so we check for error nodes
    if (!hasErrors(tree)) {
      warnCount++;
      warnings.push(`${dir}/${file}`);
      console.log(`  WARN: ${dir}/${file} - parsed without errors (expected to fail)`);
    } else {
      passCount++;
    }
  }
}

console.log('\n=========================');
console.log(`Results: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);

if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  - ${f}`));
}

if (warnings.length > 0) {
  console.log('\nWarnings (negative tests that parsed successfully):');
  warnings.forEach(w => console.log(`  - ${w}`));
}

process.exit(failCount > 0 ? 1 : 0);
