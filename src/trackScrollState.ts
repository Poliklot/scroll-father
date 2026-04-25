import { canUseDOM, noop } from './dom';
import type { Cleanup } from './types';

/** Параметры для настройки отслеживания состояния скролла. */
export interface ScrollTrackerOptions {
	/**
	 * Атрибут, который будет добавлен к элементу при скролле.
	 *
	 * @default 'data-scrolled'
	 */
	attribute?: string | false;

	/**
	 * Элемент, для которого отслеживается скролл.
	 *
	 * @default document.body
	 */
	element?: HTMLElement;

	/** Коллбэк, вызываемый при начале скролла. */
	onScrollStart?: () => void;

	/** Коллбэк, вызываемый при сбросе состояния скролла (возврат в начало). */
	onScrollReset?: () => void;
}

/**
 * Отслеживает состояние скролла элемента.
 *
 * При первом скролле добавляет указанный атрибут (`attribute`) к указанному элементу (`element`) и вызывает
 * `onScrollStart`. При возврате в начальное состояние скролла убирает атрибут и вызывает `onScrollReset`.
 *
 * @param {ScrollTrackerOptions} [options] - Опции для настройки отслеживания состояния скролла.
 *
 * @returns Функция для удаления обработчика скролла.
 */
export function trackScrollState(options: ScrollTrackerOptions = {}): Cleanup {
	if (!canUseDOM()) {
		return noop;
	}

	const { attribute = 'data-scrolled', element = document.body, onScrollStart, onScrollReset } = options;

	let scrolled = false;
	let frameId: number | null = null;

	/** Обработчик скролла. */
	const handleScroll = () => {
		const target = element === document.body ? window : element;
		const scrollPosition = target === window ? window.scrollY : element.scrollTop;

		if (scrollPosition > 0) {
			if (!scrolled) {
				attribute && element.setAttribute(attribute, '');
				scrolled = true;
				onScrollStart?.(); // Вызов коллбэка при начале скролла
			}
		} else {
			if (scrolled) {
				attribute && element.removeAttribute(attribute);
				scrolled = false;
				onScrollReset?.(); // Вызов коллбэка при сбросе скролла
			}
		}
	};

	// Определяем, какой элемент слушать
	const target = element === document.body ? window : element;

	const schedule = () => {
		if (frameId !== null) {
			return;
		}

		frameId = requestAnimationFrame(() => {
			frameId = null;
			handleScroll();
		});
	};

	// Добавляем слушатель скролла
	target.addEventListener('scroll', schedule, { passive: true });

	// Проверяем состояние при инициализации
	handleScroll();

	return () => {
		target.removeEventListener('scroll', schedule);

		if (frameId !== null) {
			cancelAnimationFrame(frameId);
			frameId = null;
		}
	};
}
