import { canUseDOM, noop } from './dom';
import type { Cleanup } from './types';

export type IntersectionOptions = {
	rootMargin?: string;
	threshold?: number;
};

/**
 * Инициализирует отслеживание элемента с помощью IntersectionObserver. Вызывает `onStart`, когда элемент попадает в
 * область просмотра, и `onEnd`, когда выходит.
 *
 * @param {HTMLElement} $section - Элемент для отслеживания.
 * @param {Function} onStart - Функция, вызываемая при попадании элемента в область видимости.
 * @param {Function} onEnd - Функция, вызываемая при выходе элемента из области видимости.
 * @param {IntersectionOptions} [options={}] - Опции для настройки IntersectionObserver. Default is `{}`
 *
 * @returns Функция для отключения IntersectionObserver.
 */
export function initIntersectionSection(
	$section: HTMLElement,
	onStart: () => void,
	onEnd: () => void,
	options: IntersectionOptions = {},
): Cleanup {
	if (!canUseDOM() || typeof IntersectionObserver === 'undefined') {
		return noop;
	}

	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					onStart();
				} else {
					onEnd();
				}
			});
		},
		{
			root: null,
			rootMargin: options.rootMargin ?? '-50% 0px',
			threshold: options.threshold ?? 0,
		},
	);
	observer.observe($section);

	return () => {
		observer.disconnect();
	};
}
