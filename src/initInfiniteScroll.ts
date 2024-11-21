/**
 * Инициализирует бесконечную прокрутку страницы. Вызывает `loadMoreCallback`, когда пользователь достигает конца
 * страницы, чтобы загрузить дополнительный контент.
 *
 * @param {() => Promise<void>} loadMoreCallback - Асинхронная функция для загрузки дополнительного контента.
 * @param {{ threshold?: number }} [options={}] - Опции для настройки бесконечной прокрутки. По умолчанию `{}`. Default
 *   is `{}`
 * @param {number} [options.threshold=300] - Пороговое значение в пикселях до конца страницы, при котором вызывается
 *   `loadMoreCallback`. По умолчанию `300`. Default is `300`
 */
export function initInfiniteScroll(loadMoreCallback: () => Promise<void>, options: { threshold?: number } = {}): void {
	const threshold = options.threshold || 300; // Порог в пикселях до конца страницы

	const handleScroll = () => {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

		if (scrollHeight - scrollTop <= threshold) {
			window.removeEventListener('scroll', handleScroll);
			loadMoreCallback().then(() => {
				window.addEventListener('scroll', handleScroll, { passive: true });
			});
		}
	};

	window.addEventListener('scroll', handleScroll, { passive: true });
}
