import type { Cleanup, ElementInput, ElementsInput, OffsetValue, ScrollProgressSnapshot, ScrollTarget } from './types';

export const noop: Cleanup = () => {};

export function canUseDOM(): boolean {
	return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function resolveOffset(offset: OffsetValue = 0): number {
	return typeof offset === 'function' ? offset() : offset;
}

export function prefersReducedMotion(): boolean {
	return canUseDOM() && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

export function resolveScrollBehavior(behavior: ScrollBehavior = 'smooth', respectReducedMotion: boolean = true): ScrollBehavior {
	return respectReducedMotion && prefersReducedMotion() ? 'auto' : behavior;
}

export function resolveElement(input: ElementInput | null | undefined, root?: Document | HTMLElement): HTMLElement | null {
	if (!canUseDOM() || !input) {
		return null;
	}

	const scope = root ?? document;

	if (typeof input === 'string') {
		return scope.querySelector<HTMLElement>(input);
	}

	return input;
}

export function resolveElements(input: ElementsInput, root?: Document | HTMLElement): HTMLElement[] {
	if (!canUseDOM()) {
		return [];
	}

	const scope = root ?? document;

	if (typeof input === 'string') {
		return Array.from(scope.querySelectorAll<HTMLElement>(input));
	}

	return Array.from(input);
}

export function getScrollTop(target: ScrollTarget): number {
	if (target === window) {
		return Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop, 0);
	}

	const element = target as HTMLElement;

	return Math.max(element.scrollTop, 0);
}

export function getMaxScroll(target: ScrollTarget): number {
	if (target === window) {
		const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

		return Math.max(scrollHeight - window.innerHeight, 0);
	}

	const element = target as HTMLElement;

	return Math.max(element.scrollHeight - element.clientHeight, 0);
}

export function getScrollSnapshot(target: ScrollTarget): ScrollProgressSnapshot {
	const scrollTop = getScrollTop(target);
	const maxScroll = getMaxScroll(target);
	const progress = maxScroll === 0 ? 0 : Math.min(Math.max(scrollTop / maxScroll, 0), 1);

	return { progress, scrollTop, maxScroll };
}

export function getElementTop(element: HTMLElement, target: ScrollTarget): number {
	if (target === window) {
		return element.getBoundingClientRect().top + getScrollTop(window);
	}

	const scrollElement = target as HTMLElement;

	return element.getBoundingClientRect().top - scrollElement.getBoundingClientRect().top + scrollElement.scrollTop;
}

export function scrollToPosition(target: ScrollTarget, top: number, behavior: ScrollBehavior = 'smooth'): void {
	if (target === window) {
		window.scrollTo({ top, left: 0, behavior });
		return;
	}

	target.scrollTo({ top, left: 0, behavior });
}

export function addScrollListener(target: ScrollTarget, listener: EventListener): Cleanup {
	target.addEventListener('scroll', listener, { passive: true });

	return () => {
		target.removeEventListener('scroll', listener);
	};
}

export function addWindowListener(eventType: string, listener: EventListener): Cleanup {
	window.addEventListener(eventType, listener, { passive: true });

	return () => {
		window.removeEventListener(eventType, listener);
	};
}

export function scheduleWithRaf(callback: () => void): { cleanup: Cleanup; schedule: () => void } {
	let frameId: number | null = null;

	const schedule = () => {
		if (frameId !== null) {
			return;
		}

		frameId = window.requestAnimationFrame(() => {
			frameId = null;
			callback();
		});
	};

	const cleanup = () => {
		if (frameId !== null) {
			window.cancelAnimationFrame(frameId);
			frameId = null;
		}
	};

	return { cleanup, schedule };
}

export function decodeHash(hash: string): string {
	try {
		return decodeURIComponent(hash.replace(/^#/, ''));
	} catch {
		return hash.replace(/^#/, '');
	}
}

export function getHashFromHref(href: string): string {
	try {
		return new URL(href, location.href).hash;
	} catch {
		return '';
	}
}

export function isSamePageUrl(url: URL): boolean {
	return url.origin === location.origin && url.pathname === location.pathname;
}

export function setElementAttribute(element: HTMLElement, attribute: string | false | undefined, value: string = ''): void {
	if (attribute) {
		element.setAttribute(attribute, value);
	}
}

export function removeElementAttribute(element: HTMLElement, attribute: string | false | undefined): void {
	if (attribute) {
		element.removeAttribute(attribute);
	}
}
