import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const readFile = relativePath => fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
const readJson = relativePath => JSON.parse(readFile(relativePath));

const rootPkg = readJson('package.json');
const publishPkg = readJson('package/package.json');

assert.equal(rootPkg.version, publishPkg.version, 'root and publish package versions should match');
assert.equal(publishPkg.main, 'index.js', 'publish package main should point to index.js');
assert.equal(publishPkg.types, 'index.d.ts', 'publish package types should point to index.d.ts');
assert.equal(publishPkg.exports['.'].import, './index.js', 'publish package root export should point to index.js');
assert.equal(publishPkg.jsdelivr, './ScrollFather.min.js', 'jsDelivr entry should point to the IIFE bundle');
assert.equal(publishPkg.unpkg, './ScrollFather.min.js', 'unpkg entry should point to the IIFE bundle');

const expectedExports = [
	'debounceScroll',
	'initAnchorScroll',
	'initInfiniteLoader',
	'initInfiniteScroll',
	'initIntersectionSection',
	'initRevealOnScroll',
	'initScrollDirectionTracking',
	'initScrollProgress',
	'initScrollSpy',
	'smootherAllAnchorLinks',
	'trackScrollState',
];
const distModule = await import(pathToFileURL(path.join(rootDir, 'dist/index.js')).href);

assert.deepEqual(Object.keys(distModule).sort(), expectedExports.sort(), 'dist/index.js should expose the public API');

expectedExports.forEach(exportName => {
	assert.equal(typeof distModule[exportName], 'function', `${exportName} should be a function`);
});

const createListenerBag = () => {
	const listeners = new Map();

	return {
		add: (eventType, handler) => {
			if (!listeners.has(eventType)) {
				listeners.set(eventType, new Set());
			}

			listeners.get(eventType).add(handler);
		},
		remove: (eventType, handler) => {
			listeners.get(eventType)?.delete(handler);
		},
		count: eventType => listeners.get(eventType)?.size ?? 0,
	};
};
const windowListeners = createListenerBag();
const documentListeners = createListenerBag();

const createElement = id => {
	const attributes = new Map();
	const classes = new Set();
	const styleValues = new Map();

	const element = {
		id,
		scrollTop: 0,
		scrollHeight: 1200,
		clientHeight: 600,
		style: {
			setProperty: (name, value) => styleValues.set(name, value),
		},
		classList: {
			add: className => classes.add(className),
			remove: className => classes.delete(className),
			toggle: (className, force) => {
				if (force) {
					classes.add(className);
				} else {
					classes.delete(className);
				}
			},
		},
		dataset: {},
		setAttribute: (name, value) => attributes.set(name, value),
		removeAttribute: name => attributes.delete(name),
		hasAttribute: name => attributes.has(name),
		getAttribute: name => attributes.get(name) ?? null,
		focus: () => {},
		contains: () => true,
		querySelectorAll: () => [],
		querySelector: () => null,
		addEventListener: () => {},
		removeEventListener: () => {},
		getBoundingClientRect: () => ({ top: 0, bottom: 10 }),
		scrollTo: ({ top }) => {
			element.scrollTop = top;
		},
	};

	return element;
};

const documentElement = createElement('html');
const body = createElement('body');

body.scrollHeight = 1200;
documentElement.scrollHeight = 1200;

globalThis.window = {
	addEventListener: windowListeners.add,
	removeEventListener: windowListeners.remove,
	setTimeout,
	clearTimeout,
	requestAnimationFrame: callback => {
		callback();
		return 1;
	},
	cancelAnimationFrame: () => {},
	pageYOffset: 0,
	scrollY: 0,
	innerHeight: 600,
	scrollTo: () => {},
	matchMedia: () => ({ matches: false }),
};
globalThis.requestAnimationFrame = globalThis.window.requestAnimationFrame;
globalThis.cancelAnimationFrame = globalThis.window.cancelAnimationFrame;
globalThis.document = {
	body,
	documentElement,
	addEventListener: documentListeners.add,
	removeEventListener: documentListeners.remove,
	querySelectorAll: () => [],
	querySelector: () => null,
	getElementById: () => null,
};
globalThis.location = {
	origin: 'https://example.com',
	pathname: '/',
	hash: '',
	href: 'https://example.com/',
};
globalThis.history = {
	pushState: () => {},
	replaceState: () => {},
};
globalThis.IntersectionObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
};

const section = createElement('intro');
section.id = 'intro';
const navLink = createElement('intro-link');
navLink.setAttribute('href', '#intro');
const sentinel = createElement('sentinel');

const cleanupFns = [
	distModule.debounceScroll(() => {}),
	distModule.initAnchorScroll({ delegated: false, scrollOnLoad: false }),
	distModule.initInfiniteLoader({ sentinel, loadMore: () => {} }),
	distModule.initInfiniteScroll(() => {}),
	distModule.initIntersectionSection(section, () => {}, () => {}),
	distModule.initRevealOnScroll({ elements: [section] }),
	distModule.initScrollDirectionTracking(),
	distModule.initScrollProgress(),
	distModule.initScrollSpy({ sections: [section], navLinks: [navLink] }),
	distModule.smootherAllAnchorLinks(),
	distModule.trackScrollState(),
];

cleanupFns.forEach(cleanup => {
	assert.equal(typeof cleanup, 'function', 'initializer should return a cleanup function');
});
assert.ok(windowListeners.count('scroll') >= 5, 'scroll initializers should register window listeners');

cleanupFns.forEach(cleanup => cleanup());
assert.equal(windowListeners.count('scroll'), 0, 'cleanup functions should remove window scroll listeners');

const bundledTypes = readFile('dist/index.d.ts');
[
	'AnchorScrollOptions',
	'Cleanup',
	'InfiniteLoaderOptions',
	'InfiniteScrollOptions',
	'IntersectionOptions',
	'RevealOnScrollOptions',
	'ScrollProgressOptions',
	'ScrollSpyOptions',
	'ScrollTrackerOptions',
	'SmoothScrollOptions',
	'declare function initAnchorScroll',
	'declare function initInfiniteLoader',
	'declare function initScrollProgress',
	'declare function initScrollSpy',
].forEach(expectedText => {
	assert.ok(bundledTypes.includes(expectedText), `dist/index.d.ts should include ${expectedText}`);
});

['README.md', 'docs/en/README.md', 'package/README.md'].forEach(relativePath => {
	const content = readFile(relativePath);

	assert.doesNotMatch(content, /smoothScrollToElement/, `${relativePath} should not mention removed API names`);
	assert.doesNotMatch(
		content,
		/npm\/scroll-father\/dist\/ScrollFather\.min\.js/,
		`${relativePath} should use the published CDN path`,
	);
});

assert.equal(readFile('README.md'), readFile('package/README.md'), 'package README should mirror root README');

console.log(`Smoke tests passed for scroll-father@${rootPkg.version}`);
