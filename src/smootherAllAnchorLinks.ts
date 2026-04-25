import { initAnchorScroll } from './initAnchorScroll';
import type { Cleanup, HashUpdateMode, OffsetValue } from './types';

export interface SmoothScrollOptions {
	/** Отступ сверху в пикселях или функция для учета фиксированных элементов. */
	offset?: OffsetValue;
	/** Тип прокрутки: 'smooth' (плавная) или 'auto' (мгновенная). */
	behavior?: ScrollBehavior;
	/** Очистка хэша из location. */
	clearHash?: boolean;
	/** Установка offset top перед каждым скроллом. Совместимо с версией 2.2.4. */
	setOffsetBeforeScroll?: () => number;
	/** Фокусировать целевой элемент после клика по якорю. */
	focusTarget?: boolean;
	/** Уважать prefers-reduced-motion. */
	respectReducedMotion?: boolean;
}

/**
 * Добавляет плавную прокрутку ко всем ссылкам-якорям (`a[href^="#"]`) на странице.
 * Совместимая обёртка над `initAnchorScroll`.
 *
 * @param {SmoothScrollOptions} options - Настройки для плавной прокрутки
 *
 * @returns Функция для удаления обработчиков клика.
 */
export function smootherAllAnchorLinks(options: SmoothScrollOptions = {}): Cleanup {
	const updateHash: HashUpdateMode = options.clearHash === false ? 'replace' : 'clear';
	const offset = options.setOffsetBeforeScroll ?? options.offset ?? 0;

	return initAnchorScroll({
		selector: 'a[href*="#"]',
		offset,
		behavior: options.behavior ?? 'smooth',
		updateHash,
		focusTarget: options.focusTarget ?? false,
		respectReducedMotion: options.respectReducedMotion ?? true,
		scrollOnLoad: true,
		delegated: false,
	});
}
