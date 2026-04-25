import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const packageDir = path.join(rootDir, 'package');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scroll-father-pack-'));
const requiredFiles = [
	'LICENSE',
	'README.md',
	'ScrollFather.min.js',
	'ScrollFather.min.js.map',
	'index.d.ts',
	'index.js',
	'index.js.map',
	'package.json',
	'types/index.d.ts',
	'types/types.d.ts',
];

try {
	['package.json', 'README.md', 'LICENSE'].forEach(fileName => {
		fs.copyFileSync(path.join(packageDir, fileName), path.join(tempDir, fileName));
	});
	copyDirectory(distDir, tempDir);

	const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json'], {
		cwd: tempDir,
		encoding: 'utf-8',
	});
	const [packResult] = JSON.parse(packOutput);
	const packedFiles = new Set(packResult.files.map(file => file.path));

	requiredFiles.forEach(filePath => {
		assert.ok(packedFiles.has(filePath), `npm package should include ${filePath}`);
	});
	assert.equal(packedFiles.has('copiedItems.json'), false, 'npm package should not include release temp files');
	assert.equal(packedFiles.has('package-lock.json'), false, 'npm package should not include root lockfiles');

	console.log(`Package check passed: ${packResult.filename} (${packResult.files.length} files)`);
} finally {
	fs.rmSync(tempDir, { recursive: true, force: true });
}

function copyDirectory(sourceDir, targetDir) {
	fs.readdirSync(sourceDir, { withFileTypes: true }).forEach(entry => {
		const sourcePath = path.join(sourceDir, entry.name);
		const targetPath = path.join(targetDir, entry.name);

		if (entry.isDirectory()) {
			fs.mkdirSync(targetPath, { recursive: true });
			copyDirectory(sourcePath, targetPath);
			return;
		}

		fs.copyFileSync(sourcePath, targetPath);
	});
}
