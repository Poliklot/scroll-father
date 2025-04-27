
export interface SmoothScrollOptions {
	/** Отступ сверху в пикселях (для учета фиксированных элементов) */
	offset?: number;
	/** Тип прокрутки: 'smooth' (плавная) или 'auto' (мгновенная) */
	behavior?: ScrollBehavior;
}

/**
 * Добавляет плавную прокрутку ко всем ссылкам-якорям (`a[href^="#"]`) на странице.
 * Автоматически обрабатывает клики по таким ссылкам и плавно прокручивает страницу к целевому элементу.
 *
 * @param {SmoothScrollOptions} options - Настройки для плавной прокрутки
 * @returns {void}
 *
 * @example
 * // Базовое использование с настройками по умолчанию
 * smootherAllAnchorLinks();
 *
 * @example
 * // С учетом фиксированной шапки (отступ 60px)
 * smootherAllAnchorLinks({ offset: 60 });
 *
 * @example
 * // С мгновенной прокруткой
 * smootherAllAnchorLinks({ behavior: 'auto' });
 */
export function smootherAllAnchorLinks(options: SmoothScrollOptions = {}): void {
	const settings = {
		offset: 0,
		behavior: 'smooth' as ScrollBehavior
	};

	Object.assign(settings, options);

	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
		e.preventDefault();
		const href = anchor.getAttribute('href');

		if (href === '#') return;

		const targetId = href!.substring(1);
		const elementToScroll = document.getElementById(targetId);

		if (!elementToScroll) return;

		let offsetTop = 0;
		let currentElement: HTMLElement | null = elementToScroll;

		while (currentElement) {
			offsetTop += currentElement.offsetTop;
			currentElement = currentElement.offsetParent as HTMLElement;

			if (!currentElement || currentElement === document.body || currentElement === document.documentElement) {
			break;
			}
		}

		window.scrollTo({
			top: offsetTop - settings.offset,
			left: 0,
			behavior: settings.behavior,
		});
		});
	});
}
