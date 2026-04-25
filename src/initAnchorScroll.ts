import {
	canUseDOM,
	decodeHash,
	getElementTop,
	isSamePageUrl,
	noop,
	resolveOffset,
	resolveScrollBehavior,
	scrollToPosition,
} from './dom';
import type { Cleanup, HashUpdateMode, OffsetValue, ScrollTarget } from './types';

export type AnchorScrollDetails = {
	hash: string;
	target: HTMLElement | null;
	link: HTMLAnchorElement | null;
};

export type AnchorScrollOptions = {
	/** Селектор ссылок-якорей. */
	selector?: string;
	/** Область, внутри которой слушаются клики и ищутся ссылки. */
	root?: Document | HTMLElement;
	/** Scroll target: окно или scroll-контейнер. */
	target?: ScrollTarget;
	/** Отступ сверху в пикселях или функция для динамического fixed header. */
	offset?: OffsetValue;
	/** Тип прокрутки. */
	behavior?: ScrollBehavior;
	/** Как обновлять hash после перехвата клика. */
	updateHash?: HashUpdateMode | false;
	/** Скроллить к hash, который уже есть в URL при инициализации. */
	scrollOnLoad?: boolean;
	/** Использовать delegated listener вместо подписки на каждую ссылку. */
	delegated?: boolean;
	/** Фокусировать целевой элемент после перехвата якоря. */
	focusTarget?: boolean;
	/** Уважать prefers-reduced-motion. */
	respectReducedMotion?: boolean;
	onBeforeScroll?: (details: AnchorScrollDetails) => boolean | void;
	onAfterScroll?: (details: AnchorScrollDetails) => void;
};

export function initAnchorScroll(options: AnchorScrollOptions = {}): Cleanup {
	if (!canUseDOM()) {
		return noop;
	}

	const settings = {
		selector: 'a[href*="#"]',
		root: document as Document | HTMLElement,
		target: window as ScrollTarget,
		offset: 0 as OffsetValue,
		behavior: 'smooth' as ScrollBehavior,
		updateHash: 'replace' as HashUpdateMode | false,
		scrollOnLoad: true,
		delegated: true,
		focusTarget: true,
		respectReducedMotion: true,
		...options,
	};
	const cleanups: Cleanup[] = [];
	let afterScrollTimeout: number | null = null;

	const scrollToHash = (hash: string, link: HTMLAnchorElement | null): boolean => {
		if (!hash) {
			return false;
		}

		const target = hash === '#' ? null : document.getElementById(decodeHash(hash));
		if (hash !== '#' && !target) {
			return false;
		}

		const details: AnchorScrollDetails = { hash, target, link };
		if (settings.onBeforeScroll?.(details) === false) {
			return false;
		}

		const top = target ? getElementTop(target, settings.target) - resolveOffset(settings.offset) : 0;
		const behavior = resolveScrollBehavior(settings.behavior, settings.respectReducedMotion);

		scrollToPosition(settings.target, Math.max(top, 0), behavior);
		updateLocationHash(hash);
		focusTarget(target);

		if (afterScrollTimeout !== null) {
			window.clearTimeout(afterScrollTimeout);
		}

		afterScrollTimeout = window.setTimeout(() => {
			afterScrollTimeout = null;
			settings.onAfterScroll?.(details);
		}, 0);

		return true;
	};

	const handleAnchor = (anchor: HTMLAnchorElement, event?: Event): void => {
		const href = anchor.getAttribute('href');
		if (!href) {
			return;
		}

		const url = new URL(href, location.href);
		if (!isSamePageUrl(url)) {
			return;
		}

		if (scrollToHash(url.hash || '#', anchor)) {
			event?.preventDefault();
		}
	};

	if (settings.delegated) {
		const handleClick = (event: Event) => {
			const anchor = findAnchor(event.target, settings.selector, settings.root);

			if (anchor) {
				handleAnchor(anchor, event);
			}
		};

		settings.root.addEventListener('click', handleClick);
		cleanups.push(() => settings.root.removeEventListener('click', handleClick));
	} else {
		const anchors = Array.from(settings.root.querySelectorAll<HTMLAnchorElement>(settings.selector));

		anchors.forEach(anchor => {
			const handleClick = (event: Event) => handleAnchor(anchor, event);

			anchor.addEventListener('click', handleClick);
			cleanups.push(() => anchor.removeEventListener('click', handleClick));
		});
	}

	if (settings.scrollOnLoad && location.hash) {
		scrollToHash(location.hash, null);
	}

	return () => {
		cleanups.forEach(cleanup => cleanup());

		if (afterScrollTimeout !== null) {
			window.clearTimeout(afterScrollTimeout);
			afterScrollTimeout = null;
		}
	};

	function updateLocationHash(hash: string): void {
		const mode = settings.updateHash;
		if (mode === false || mode === 'keep') {
			return;
		}

		const url = new URL(location.href);
		url.hash = mode === 'clear' || hash === '#' ? '' : hash;

		if (mode === 'push') {
			history.pushState(null, '', url.toString());
			return;
		}

		history.replaceState(null, '', url.toString());
	}

	function focusTarget(target: HTMLElement | null): void {
		if (!settings.focusTarget || !target || typeof target.focus !== 'function') {
			return;
		}

		if (!target.hasAttribute('tabindex')) {
			target.setAttribute('tabindex', '-1');
		}

		target.focus({ preventScroll: true });
	}
}

function findAnchor(target: EventTarget | null, selector: string, root: Document | HTMLElement): HTMLAnchorElement | null {
	if (!(target instanceof Element)) {
		return null;
	}

	const anchor = target.closest<HTMLAnchorElement>(selector);
	if (!anchor) {
		return null;
	}

	if (root === document) {
		return anchor;
	}

	return root.contains(anchor) ? anchor : null;
}
