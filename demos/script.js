import {
	initAnchorScroll,
	initInfiniteLoader,
	initRevealOnScroll,
	initScrollDirectionTracking,
	initScrollProgress,
	initScrollSpy,
	trackScrollState,
} from '../dist/index.js';

const header = document.querySelector('[data-site-header]');
const loaderState = document.querySelector('[data-loader-state]');
const feed = document.querySelector('[data-feed]');
const sentinel = document.querySelector('[data-feed-sentinel]');
const cleanups = [];
const getHeaderOffset = () => Math.round((header?.getBoundingClientRect().height ?? 0) + 24);

cleanups.push(
	initAnchorScroll({
		selector: 'a[href^="#"]',
		offset: getHeaderOffset,
		updateHash: 'replace',
		focusTarget: true,
	}),
	initScrollSpy({
		sections: 'main section[id]',
		navLinks: '.site-nav a[href^="#"]',
		offset: getHeaderOffset,
		activeClass: 'is-active',
		attributeElement: document.body,
		attribute: 'data-active-section',
		ariaCurrent: 'location',
	}),
	initRevealOnScroll({
		elements: '[data-reveal]',
		visibleClass: 'is-visible',
		hiddenClass: 'is-hidden',
		attribute: 'data-reveal-state',
		stagger: 75,
	}),
	initScrollProgress({
		element: document.documentElement,
		cssVariable: '--page-progress',
		attribute: false,
	}),
	initScrollDirectionTracking(false, 8),
	trackScrollState({ element: document.body }),
);

const feedItems = [
	{
		title: 'Docs page с липкой навигацией',
		text: 'Anchor Scroll и ScrollSpy держат меню синхронизированным с секциями, даже если header меняет высоту.',
		api: 'initAnchorScroll + initScrollSpy',
	},
	{
		title: 'Landing с мягким reveal',
		text: 'Reveal управляет состоянием, а вся выразительность остается в CSS: проще поддерживать и брендировать.',
		api: 'initRevealOnScroll',
	},
	{
		title: 'Longread с прогрессом чтения',
		text: 'Scroll Progress пишет значение в CSS variable, поэтому UI можно собрать без лишнего JavaScript.',
		api: 'initScrollProgress',
	},
	{
		title: 'Каталог с догрузкой товаров',
		text: 'Infinite Loader работает через sentinel и передает AbortSignal для отмены запроса при cleanup.',
		api: 'initInfiniteLoader',
	},
	{
		title: 'Шапка, которая не мешает читать',
		text: 'Direction tracking ставит data-scroll-direction на body, а CSS решает, когда прятать или показывать header.',
		api: 'initScrollDirectionTracking',
	},
	{
		title: 'Совместимость со старым API',
		text: 'Legacy helpers оставлены для плавной миграции: можно обновить пакет без переписывания проекта за ночь.',
		api: 'smootherAllAnchorLinks',
	},
	{
		title: 'SSR-safe импорт в приложении',
		text: 'Инициализаторы возвращают noop без browser globals, поэтому пакет не ломает серверный рендер.',
		api: 'cleanup-first API',
	},
	{
		title: 'Динамический fixed-header offset',
		text: 'Offset может быть функцией: высота header, admin bar, cookie banner или любое runtime-условие.',
		api: 'OffsetValue',
	},
	{
		title: 'Навигация с accessibility по умолчанию',
		text: 'Hash handling, focus target и aria-current помогают не забывать о клавиатуре и screen readers.',
		api: 'focusTarget + ariaCurrent',
	},
];
let renderedCount = 0;

if (feed && sentinel) {
	appendFeedItems(feedItems.slice(0, 3));
	renderedCount = 3;

	cleanups.push(
		initInfiniteLoader({
			sentinel,
			rootMargin: '480px 0px',
			initialPage: 2,
			loadMore: async ({ done }) => {
				setLoaderText('loading');
				await wait(360);

				const nextItems = feedItems.slice(renderedCount, renderedCount + 2);
				if (nextItems.length === 0) {
					setLoaderText('done');
					sentinel.classList.add('is-done');
					sentinel.querySelector('p').textContent = 'Все демо-карточки загружены.';
					done();
					return false;
				}

				appendFeedItems(nextItems);
				renderedCount += nextItems.length;
				setLoaderText(renderedCount >= feedItems.length ? 'done' : 'idle');

				if (renderedCount >= feedItems.length) {
					sentinel.classList.add('is-done');
					sentinel.querySelector('p').textContent = 'Все демо-карточки загружены.';
					done();
					return false;
				}
			},
			onStateChange: ({ state }) => setLoaderText(state),
			onError: ({ retry }) => {
				setLoaderText('error');
				sentinel.addEventListener('click', retry, { once: true });
			},
		}),
	);
}

window.addEventListener('pagehide', () => cleanups.forEach(cleanup => cleanup()), { once: true });

function appendFeedItems(items) {
	const fragment = document.createDocumentFragment();

	items.forEach((item, index) => {
		const card = document.createElement('article');
		card.className = 'feed-card';
		card.setAttribute('data-reveal-state', 'visible');
		card.style.setProperty('--feed-delay', `${index * 60}ms`);
		card.innerHTML = `
			<span>${item.api}</span>
			<h3>${item.title}</h3>
			<p>${item.text}</p>
		`;
		fragment.append(card);
	});

	feed.append(fragment);
}

function setLoaderText(state) {
	if (loaderState) {
		loaderState.textContent = state;
	}
}

function wait(ms) {
	return new Promise(resolve => {
		window.setTimeout(resolve, ms);
	});
}
