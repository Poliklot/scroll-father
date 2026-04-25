import { canUseDOM, noop, prefersReducedMotion, resolveElements } from './dom';
import type { Cleanup, ElementsInput } from './types';

export type RevealOnScrollOptions = {
	/** Элементы или селектор элементов для reveal. */
	elements?: ElementsInput;
	/** Область поиска элементов. */
	scope?: Document | HTMLElement;
	/** IntersectionObserver root. */
	root?: Element | Document | null;
	rootMargin?: string;
	threshold?: number | number[];
	visibleClass?: string | false;
	hiddenClass?: string | false;
	attribute?: string | false;
	once?: boolean;
	stagger?: number | ((index: number, element: HTMLElement) => number);
	respectReducedMotion?: boolean;
	onReveal?: (element: HTMLElement, index: number) => void;
	onHide?: (element: HTMLElement, index: number) => void;
};

export function initRevealOnScroll(options: RevealOnScrollOptions = {}): Cleanup {
	if (!canUseDOM()) {
		return noop;
	}

	const settings = {
		elements: '[data-reveal]' as ElementsInput,
		scope: document as Document | HTMLElement,
		root: null as Element | Document | null,
		rootMargin: '0px 0px -10% 0px',
		threshold: 0 as number | number[],
		visibleClass: 'is-visible' as string | false,
		hiddenClass: false as string | false,
		attribute: 'data-reveal-state' as string | false,
		once: true,
		stagger: 0 as number | ((index: number, element: HTMLElement) => number),
		respectReducedMotion: true,
		...options,
	};
	const elements = resolveElements(settings.elements, settings.scope);
	const timers = new Map<HTMLElement, number>();

	elements.forEach((element, index) => {
		element.style.setProperty('--reveal-index', String(index));
		setRevealState(element, 'hidden', settings.visibleClass, settings.hiddenClass, settings.attribute);
	});

	if ((settings.respectReducedMotion && prefersReducedMotion()) || typeof IntersectionObserver === 'undefined') {
		elements.forEach((element, index) => reveal(element, index, 0));

		return () => clearTimers(timers);
	}

	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				const element = entry.target as HTMLElement;
				const index = elements.indexOf(element);

				if (entry.isIntersecting) {
					reveal(element, index, getDelay(settings.stagger, index, element));

					if (settings.once) {
						observer.unobserve(element);
					}
				} else if (!settings.once) {
					hide(element, index);
				}
			});
		},
		{
			root: settings.root && settings.root !== document ? (settings.root as Element) : null,
			rootMargin: settings.rootMargin,
			threshold: settings.threshold,
		},
	);

	elements.forEach(element => observer.observe(element));

	return () => {
		observer.disconnect();
		clearTimers(timers);
	};

	function reveal(element: HTMLElement, index: number, delay: number): void {
		const existingTimer = timers.get(element);
		if (existingTimer) {
			window.clearTimeout(existingTimer);
		}

		element.style.setProperty('--reveal-delay', `${delay}ms`);

		const apply = () => {
			timers.delete(element);
			setRevealState(element, 'visible', settings.visibleClass, settings.hiddenClass, settings.attribute);
			settings.onReveal?.(element, index);
		};

		if (delay > 0) {
			timers.set(element, window.setTimeout(apply, delay));
			return;
		}

		apply();
	}

	function hide(element: HTMLElement, index: number): void {
		const existingTimer = timers.get(element);
		if (existingTimer) {
			window.clearTimeout(existingTimer);
			timers.delete(element);
		}

		setRevealState(element, 'hidden', settings.visibleClass, settings.hiddenClass, settings.attribute);
		settings.onHide?.(element, index);
	}
}

function setRevealState(
	element: HTMLElement,
	state: 'visible' | 'hidden',
	visibleClass: string | false,
	hiddenClass: string | false,
	attribute: string | false,
): void {
	if (visibleClass) {
		element.classList.toggle(visibleClass, state === 'visible');
	}

	if (hiddenClass) {
		element.classList.toggle(hiddenClass, state === 'hidden');
	}

	if (attribute) {
		element.setAttribute(attribute, state);
	}
}

function getDelay(stagger: RevealOnScrollOptions['stagger'], index: number, element: HTMLElement): number {
	if (typeof stagger === 'function') {
		return Math.max(stagger(index, element), 0);
	}

	return Math.max((stagger ?? 0) * index, 0);
}

function clearTimers(timers: Map<HTMLElement, number>): void {
	timers.forEach(timer => window.clearTimeout(timer));
	timers.clear();
}
