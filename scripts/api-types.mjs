#!/usr/bin/env node
/**
 * Generates src/services/api/generated/schema.d.ts from the backend's
 * committed OpenAPI contract.
 *
 *   npm run api:types   -> (re)write the generated file
 *   npm run api:check   -> regenerate in memory and exit 1 if the checked-in
 *                          file differs (for CI / pre-release)
 *
 * Contract source: $API_CONTRACT if set (a path or an http(s) URL), otherwise
 * the sibling backend repo: ../backend/openapi/openapi.json.
 * The backend regenerates that file with `python scripts/export_openapi.py`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import openapiTS, { astToString } from 'openapi-typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/services/api/generated/schema.d.ts');
const check = process.argv.includes('--check');

const source = process.env.API_CONTRACT || resolve(ROOT, '../backend/openapi/openapi.json');
const isUrl = /^https?:\/\//.test(source);

if (!isUrl && !existsSync(source)) {
  console.error(
    `API contract not found at ${source}.\n` +
      'Clone the backend repo next to this one, or set API_CONTRACT to the path/URL of openapi.json.',
  );
  process.exit(2);
}

const HEADER =
  '/**\n' +
  ' * GENERATED FILE - DO NOT EDIT.\n' +
  ' * Source: backend openapi/openapi.json. Regenerate with `npm run api:types`.\n' +
  ' * Use the helpers in src/services/api/types.ts rather than importing this directly.\n' +
  ' */\n\n';

// Normalise line endings so the check is stable across Windows/macOS/Linux checkouts.
const normalise = (s) => s.replace(/\r\n/g, '\n');

const ast = await openapiTS(isUrl ? new URL(source) : pathToFileURL(source), {
  // Keep generated output stable and readable.
  alphabetize: true,
  // A field with a server-side default is OPTIONAL to send. The default (true)
  // would mark it required, forcing every request body to spell out defaults.
  defaultNonNullable: false,
});
const generated = normalise(HEADER + astToString(ast));

if (check) {
  const current = existsSync(OUT) ? normalise(readFileSync(OUT, 'utf8')) : '';
  if (current !== generated) {
    console.error(
      'src/services/api/generated/schema.d.ts is out of date with the backend contract.\n' +
        'Run `npm run api:types`, then `npm run typecheck`, and commit the result.',
    );
    process.exit(1);
  }
  console.log('API types are up to date with the contract.');
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, generated);
  console.log(`Wrote ${OUT} from ${source}`);
}
