import { addScrollListener, addWindowListener, canUseDOM, getScrollSnapshot, noop, scheduleWithRaf } from './dom';
import type { Cleanup, ScrollProgressSnapshot, ScrollTarget } from './types';

export type ScrollProgressOptions = {
	/** Scroll target: окно или scroll-контейнер. */
	target?: ScrollTarget;
	/** Элемент, на который записываются CSS variable и attribute. */
	element?: HTMLElement;
	/** CSS variable с прогрессом 0..1. */
	cssVariable?: string | false;
	/** Атрибут с прогрессом 0..1. */
	attribute?: string | false;
	/** Количество знаков после запятой. */
	precision?: number;
	onChange?: (snapshot: ScrollProgressSnapshot) => void;
};

export function initScrollProgress(options: ScrollProgressOptions = {}): Cleanup {
	if (!canUseDOM()) {
		return noop;
	}

	const settings = {
		target: window as ScrollTarget,
		element: document.documentElement,
		cssVariable: '--scroll-progress' as string | false,
		attribute: 'data-scroll-progress' as string | false,
		precision: 4,
		...options,
	};
	const cleanups: Cleanup[] = [];
	let previousValue: string | null = null;

	const update = () => {
		const snapshot = getScrollSnapshot(settings.target);
		const value = snapshot.progress.toFixed(settings.precision);

		if (value === previousValue) {
			return;
		}

		previousValue = value;

		if (settings.cssVariable) {
			settings.element.style.setProperty(settings.cssVariable, value);
		}

		if (settings.attribute) {
			settings.element.setAttribute(settings.attribute, value);
		}

		settings.onChange?.(snapshot);
	};
	const scheduler = scheduleWithRaf(update);

	cleanups.push(addScrollListener(settings.target, scheduler.schedule));
	cleanups.push(addWindowListener('resize', scheduler.schedule));
	cleanups.push(scheduler.cleanup);

	update();

	return () => {
		cleanups.forEach(cleanup => cleanup());
	};
}
