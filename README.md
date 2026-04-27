# Scroll Father

- [🇬🇧 English documentation](https://github.com/Poliklot/scroll-father/blob/master/docs/en/README.md)

Scroll Father — лёгкий TypeScript toolkit для повседневного scroll UI: плавные якоря, scrollspy, reveal-анимации,
progress bar, определение направления скролла и бесконечная загрузка. Библиотека не заменяет нативный скролл тяжёлой
магией, а даёт аккуратные DOM-примитивы с cleanup, accessibility-настройками и zero-dependency core.

## Возможности

- **Anchor scroll:** плавные якоря с fixed-header offset, hash-режимами, delegated listener и focus для accessibility.
- **ScrollSpy:** активная секция, подсветка меню, `aria-current` и `data-active-section`.
- **Reveal on scroll:** AOS-подобный state engine без CSS-пресетов и зависимостей.
- **Scroll progress:** CSS variable и callback для progress bar чтения или scroll-контейнера.
- **Infinite loading:** sentinel-based загрузка через `IntersectionObserver`, состояния, retry, abort и prefill.
- **Legacy helpers:** debounce scroll, scroll state, direction tracking и простая infinite scroll функция.
- **TypeScript:** типы экспортируются из пакета.
- **Cleanup-first:** инициализаторы возвращают функцию очистки или безопасно no-op в SSR.

## Установка

```bash
npm i scroll-father
```

CDN/IIFE:

```html
<script src="https://cdn.jsdelivr.net/npm/scroll-father/ScrollFather.min.js"></script>
```

## Демо

Локальная витрина показывает реальные сценарии Scroll Father: якоря, scrollspy, reveal, progress bar, direction tracking и
infinite loader на одной странице.

```bash
npm run demos
```

## Быстрый старт

```ts
import {
	initAnchorScroll,
	initScrollSpy,
	initRevealOnScroll,
	initScrollProgress,
	initInfiniteLoader,
} from 'scroll-father';
```

Большинство функций возвращают `cleanup()` — вызовите его, когда поведение больше не нужно.

## Anchor Scroll

Решает типичную боль якорей: fixed header, hash, focus, динамические ссылки.

```ts
const cleanupAnchors = initAnchorScroll({
	offset: () => document.querySelector('.header')?.clientHeight ?? 0,
	behavior: 'smooth',
	updateHash: 'replace', // 'keep' | 'clear' | 'replace' | 'push' | false
	focusTarget: true,
	delegated: true,
});
```

Совместимый alias старого API тоже остаётся:

```ts
import { smootherAllAnchorLinks } from 'scroll-father';

const cleanup = smootherAllAnchorLinks({ offset: 80, clearHash: false });
```

Можно установить статичный offset:

```ts
let offset = 0;
if (window.innerWidth >= breakpoints['2xl']) offset = 96;
else offset = 60;

smootherAllAnchorLinks({ offset });
```

Можно вычислять offset перед каждым новым скроллом:

```ts
const setOffsetBeforeScroll = () => {
	if (document.body.getAttribute('data-scroll-direction') === 'up') {
		return window.innerWidth >= breakpoints['2xl'] ? 96 : 60;
	}

	return 0;
};

smootherAllAnchorLinks({ setOffsetBeforeScroll });
```

## ScrollSpy

Подсвечивает активный пункт меню и секцию.

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

Библиотека только ставит state, классы и CSS variables. Анимацию удобно держать в CSS.

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

Пишет прогресс `0..1` в CSS variable и callback.

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

Новый sentinel-based loader для списков, каталогов и лент.

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
	onScrollStart: () => console.log('Скролл начался'),
	onScrollReset: () => console.log('Скролл сброшен'),
});
```

### Scroll Direction

```ts
const cleanupDirection = initScrollDirectionTracking(false, 6);
```

Ставит `data-scroll-direction="up|down"` на `body`.

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

## Лицензия

MIT — см. [LICENSE](https://github.com/Poliklot/scroll-father/blob/master/LICENSE).
