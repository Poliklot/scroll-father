import { canUseDOM, noop } from './dom';
import type { Cleanup } from './types';

export type InfiniteScrollOptions = {
	/** Пороговое значение в пикселях до конца страницы. */
	threshold?: number;
	/** Коллбэк для обработки ошибок загрузки. */
	onError?: (error: unknown) => void;
};

/**
 * Инициализирует бесконечную прокрутку страницы. Вызывает `loadMoreCallback`, когда пользователь достигает конца
 * страницы, чтобы загрузить дополнительный контент.
 *
 * @param {() => Promise<void> | void} loadMoreCallback - Функция для загрузки дополнительного контента.
 * @param {InfiniteScrollOptions} [options={}] - Опции для настройки бесконечной прокрутки. По умолчанию `{}`. Default
 *   is `{}`
 * @param {number} [options.threshold=300] - Пороговое значение в пикселях до конца страницы, при котором вызывается
 *   `loadMoreCallback`. По умолчанию `300`. Default is `300`
 * @param {(error: unknown) => void} [options.onError] - Коллбэк для обработки ошибок загрузки.
 *
 * @returns Функция для удаления обработчика скролла.
 */
export function initInfiniteScroll(
	loadMoreCallback: () => Promise<void> | void,
	options: InfiniteScrollOptions = {},
): Cleanup {
	if (!canUseDOM()) {
		return noop;
	}

	const threshold = options.threshold ?? 300; // Порог в пикселях до конца страницы
	let isLoading = false;
	let isDestroyed = false;

	const handleScroll = () => {
		if (isLoading || isDestroyed) {
			return;
		}

		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

		if (scrollHeight - scrollTop <= threshold) {
			isLoading = true;
			removeListener();

			Promise.resolve(loadMoreCallback())
				.catch(error => {
					if (options.onError) {
						options.onError(error);
						return;
					}

					console.error('[scroll-father] initInfiniteScroll loadMoreCallback failed:', error);
				})
				.finally(() => {
					isLoading = false;
					addListener();
				});
		}
	};

	const addListener = () => {
		if (!isDestroyed) {
			window.addEventListener('scroll', handleScroll, { passive: true });
		}
	};

	const removeListener = () => {
		window.removeEventListener('scroll', handleScroll);
	};

	addListener();

	return () => {
		isDestroyed = true;
		removeListener();
	};
}
