import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distUrl = pathToFileURL(path.join(rootDir, 'dist/index.js')).href;
const browserGlobals = [
	'window',
	'document',
	'location',
	'history',
	'IntersectionObserver',
	'requestAnimationFrame',
	'cancelAnimationFrame',
];
const previousDescriptors = new Map(
	browserGlobals.map(globalName => [globalName, Object.getOwnPropertyDescriptor(globalThis, globalName)]),
);

browserGlobals.forEach(globalName => {
	Reflect.deleteProperty(globalThis, globalName);
});

try {
	const distModule = await import(`${distUrl}?ssr=${Date.now()}`);
	const cleanupFns = [
		distModule.debounceScroll(() => {}),
		distModule.initAnchorScroll(),
		distModule.initInfiniteLoader({ sentinel: null, loadMore: () => {} }),
		distModule.initInfiniteScroll(() => {}),
		distModule.initIntersectionSection(null, () => {}, () => {}),
		distModule.initRevealOnScroll(),
		distModule.initScrollDirectionTracking(),
		distModule.initScrollProgress(),
		distModule.initScrollSpy(),
		distModule.smootherAllAnchorLinks(),
		distModule.trackScrollState(),
	];

	cleanupFns.forEach(cleanup => {
		assert.equal(typeof cleanup, 'function', 'SSR-safe initializer should return a cleanup function');
		assert.doesNotThrow(cleanup, 'SSR cleanup should be safe to call');
	});

	console.log('SSR tests passed without browser globals');
} finally {
	browserGlobals.forEach(globalName => {
		const descriptor = previousDescriptors.get(globalName);

		Reflect.deleteProperty(globalThis, globalName);

		if (descriptor) {
			Object.defineProperty(globalThis, globalName, descriptor);
		}
	});
}
