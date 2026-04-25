import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundlePath = path.join(rootDir, 'dist/ScrollFather.min.js');
const bundle = fs.readFileSync(bundlePath);
const limits = {
	minified: 15 * 1024,
	gzip: 5 * 1024,
};
const sizes = {
	minified: bundle.byteLength,
	gzip: gzipSync(bundle).byteLength,
};

assert.ok(sizes.minified <= limits.minified, `minified bundle should be <= ${formatBytes(limits.minified)}`);
assert.ok(sizes.gzip <= limits.gzip, `gzip bundle should be <= ${formatBytes(limits.gzip)}`);

console.log(
	`Bundle size check passed: ${formatBytes(sizes.minified)} minified, ${formatBytes(sizes.gzip)} gzip`,
);

function formatBytes(bytes) {
	return `${(bytes / 1024).toFixed(2)} KB`;
}
