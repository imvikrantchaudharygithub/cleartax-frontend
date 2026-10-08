#!/usr/bin/env node
/**
 * One-shot codemod for the L3 redesign (spec 2026-10-05-l3-site-redesign, Page mapping row
 * "Shell-level restyle"). Exact string swaps only, on PUBLIC files only.
 *   node scripts/fv-restyle.mjs          # dry run: prints per-file counts
 *   node scripts/fv-restyle.mjs --apply  # writes
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = [
  'app/(site)',
  'app/components/blog',
  'app/components/calculators',
  'app/components/dashboard',
  'app/components/services',
  'app/components/team',
  'app/components/legal',
];

const PAIRS = [
  ['max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', 'fv-wrap'],
  ['max-w-6xl mx-auto px-4 sm:px-6 lg:px-8', 'fv-wrap'],
  ['max-w-4xl mx-auto px-4 sm:px-6 lg:px-8', 'fv-wrap max-w-[960px]'],
  ['bg-white rounded-2xl shadow-card', 'fv-card'],
  ['bg-white rounded-xl shadow-card', 'fv-card'],
  ['bg-white rounded-lg shadow-card', 'fv-card'],
  ['font-heading font-bold text-3xl text-primary', 'font-heading font-extrabold tracking-tight text-3xl text-fv-navy'],
  ['font-heading font-bold text-2xl text-primary', 'font-heading font-extrabold tracking-tight text-2xl text-fv-navy'],
  ['font-heading font-semibold text-2xl text-primary', 'font-heading font-bold text-2xl text-fv-navy'],
  ['font-heading font-semibold text-xl text-primary', 'font-heading font-bold text-xl text-fv-navy'],
  ["from '@/app/components/ui/Button'", "from '@/app/components/fv/Button'"],
  ["from '../ui/Button'", "from '../fv/Button'"],
  ['bg-gradient-to-b from-light-blue to-white', 'bg-white'],
  ['bg-gradient-to-br from-accent to-primary', 'bg-gradient-to-br from-fv-blue to-fv-blue-d'],
  ['text-accent hover:underline', 'font-semibold text-fv-blue-d hover:underline'],
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (path.endsWith('.tsx')) out.push(path);
  }
  return out;
}

const apply = process.argv.includes('--apply');
const files = ROOTS.flatMap((root) => walk(root));
const unsafe = files.filter((f) => /\(admin|\/admin\//.test(f));
if (unsafe.length) {
  console.error('Refusing to touch admin files:', unsafe);
  process.exit(1);
}

let total = 0;
for (const file of files) {
  let src = readFileSync(file, 'utf8');
  const hits = [];
  for (const [from, to] of PAIRS) {
    const n = src.split(from).length - 1;
    if (n > 0) {
      hits.push(`${n}× ${from}`);
      src = src.split(from).join(to);
      total += n;
    }
  }
  if (hits.length) {
    console.log(`${file}\n  ${hits.join('\n  ')}`);
    if (apply) writeFileSync(file, src);
  }
}
console.log(`\n${apply ? 'APPLIED' : 'DRY RUN'}: ${total} replacement(s) in ${files.length} scanned files`);
