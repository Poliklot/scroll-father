# Scroll Father

[🇷🇺 Документация на русском](https://github.com/Poliklot/scroll-father/blob/master/README.md)

Scroll Father is a tiny TypeScript toolkit for everyday scroll UI: smooth anchors, scrollspy, reveal effects, progress
bars, scroll direction tracking, and infinite loading. It does not replace native scrolling with heavy magic; it gives you
small DOM primitives with cleanup, accessibility-friendly defaults, and a zero-dependency core.

## Features

- **Anchor scroll:** smooth anchors with fixed-header offset, hash modes, delegated listener, and focus management.
- **ScrollSpy:** active section, active nav links, `aria-current`, and `data-active-section`.
- **Reveal on scroll:** AOS-like state engine without animation presets or dependencies.
- **Scroll progress:** CSS variable and callback for reading progress bars or scroll containers.
- **Infinite loading:** sentinel-based loading with `IntersectionObserver`, states, retry, abort, and prefill.
- **Legacy helpers:** debounce scroll, scroll state, direction tracking, and simple infinite scroll.
- **TypeScript:** option and callback types are exported from the package.
- **Cleanup-first:** initializers return cleanup functions or a safe no-op in SSR.

## Installation

```bash
npm i scroll-father
```

CDN/IIFE:

```html
<script src="https://cdn.jsdelivr.net/npm/scroll-father/ScrollFather.min.js"></script>
```

## Quick Start

```ts
import {
	initAnchorScroll,
	initScrollSpy,
	initRevealOnScroll,
	initScrollProgress,
	initInfiniteLoader,
} from 'scroll-father';
```

Most functions return `cleanup()` — call it when the behavior is no longer needed.

## Anchor Scroll

Fixes the usual anchor pain: fixed headers, hash handling, focus, and dynamic links.

```ts
const cleanupAnchors = initAnchorScroll({
	offset: () => document.querySelector('.header')?.clientHeight ?? 0,
	behavior: 'smooth',
	updateHash: 'replace', // 'keep' | 'clear' | 'replace' | 'push' | false
	focusTarget: true,
	delegated: true,
});
```

The old API remains as a compatible alias:

```ts
import { smootherAllAnchorLinks } from 'scroll-father';

const cleanup = smootherAllAnchorLinks({ offset: 80, clearHash: false });
```

## ScrollSpy

Highlights the active navigation link and section.

```ts
const cleanupSpy = initScrollSpy({
	sections: 'section[id]',
	navLinks: '.docs-nav a[href^="#"]',
	offset: 96,
	activeClass: 'is-active',
	sectionActiveClass: 'is-current-section',
	attribute: 'data-active-section',
	ariaCurrent: 'location',
	onChange: ({ activeId, direction }) => {
		console.log(activeId, direction);
	},
});
```

## Reveal On Scroll

The library only sets state, classes, and CSS variables. Keep the actual animation in CSS.

```ts
const cleanupReveal = initRevealOnScroll({
	elements: '[data-reveal]',
	visibleClass: 'is-visible',
	attribute: 'data-reveal-state',
	once: true,
	stagger: 80,
});
```

```css
[data-reveal] {
	opacity: 0;
	transform: translateY(24px);
	transition:
		opacity 0.45s ease,
		transform 0.45s ease;
	transition-delay: var(--reveal-delay, 0ms);
}

[data-reveal-state='visible'] {
	opacity: 1;
	transform: translateY(0);
}
```

## Scroll Progress

Writes `0..1` progress into a CSS variable and callback.

```ts
const cleanupProgress = initScrollProgress({
	cssVariable: '--reading-progress',
	attribute: 'data-reading-progress',
	onChange: ({ progress }) => {
		console.log(Math.round(progress * 100));
	},
});
```

```css
.progress-bar {
	transform: scaleX(var(--reading-progress, 0));
	transform-origin: left;
}
```

## Infinite Loader

A sentinel-based loader for lists, catalogs, and feeds.

```ts
const cleanupLoader = initInfiniteLoader({
	sentinel: '#load-more-sentinel',
	rootMargin: '400px 0px',
	prefill: true,
	loadMore: async ({ page, signal, done }) => {
		const response = await fetch(`/api/items?page=${page}`, { signal });
		const items = await response.json();

		renderItems(items);

		if (items.length === 0) {
			done();
		}
	},
	onStateChange: ({ state }) => {
		document.body.dataset.loaderState = state;
	},
	onError: ({ error, retry }) => {
		console.error(error);
		showRetryButton(retry);
	},
});
```

## Legacy Helpers

### Scroll State

```ts
const cleanupScrollState = trackScrollState({
	attribute: 'data-scrolled',
	element: document.body,
	onScrollStart: () => console.log('Scroll started'),
	onScrollReset: () => console.log('Scroll reset'),
});
```

### Scroll Direction

```ts
const cleanupDirection = initScrollDirectionTracking(false, 6);
```

Sets `data-scroll-direction="up|down"` on `body`.

### Debounce Scroll

```ts
const cleanupDebounce = debounceScroll(() => {
	console.log('scroll settled');
}, 200);
```

### Simple Infinite Scroll

```ts
const cleanupInfiniteScroll = initInfiniteScroll(fetchMoreData, {
	threshold: 300,
	onError: error => console.error(error),
});
```

### Intersection Section

```ts
const cleanupObserver = initIntersectionSection(
	document.querySelector('#hero')!,
	() => console.log('visible'),
	() => console.log('hidden'),
);
```

## API

- `initAnchorScroll(options?)`
- `initScrollSpy(options?)`
- `initRevealOnScroll(options?)`
- `initScrollProgress(options?)`
- `initInfiniteLoader(options)`
- `smootherAllAnchorLinks(options?)`
- `trackScrollState(options?)`
- `initScrollDirectionTracking(trackUserEventsOnly?, thresholdPx?)`
- `debounceScroll(callback, delay?)`
- `initInfiniteScroll(loadMoreCallback, options?)`
- `initIntersectionSection(section, onStart, onEnd, options?)`

## License

MIT — see [LICENSE](https://github.com/Poliklot/scroll-father/blob/master/LICENSE).
