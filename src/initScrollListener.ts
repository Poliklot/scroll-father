type ScrolledOptions = {
	attribute?: string;
	element?: HTMLElement;
};

/**
 * Инициализирует отслеживание состояния скролла страницы.
 *
 * @param {ScrolledOptions} [options={}] - Опции для настройки отслеживания состояния скролла. Default is `{}`
 */
export function initScrollListener(options: ScrolledOptions = {}): void {
	const attribute = options.attribute || 'data-scrolled';
	const element = options.element || document.body;
	let scrolled = false;

	const handleScroll = () => {
		if (window.scrollY > 0) {
			if (!scrolled) {
				element.setAttribute(attribute, '');
				scrolled = true;
			}
		} else {
			if (scrolled) {
				element.removeAttribute(attribute);
				scrolled = false;
			}
		}
	};

	window.addEventListener(
		'scroll',
		() => {
			requestAnimationFrame(handleScroll);
		},
		{ passive: true },
	);

	// Проверка при инициализации
	handleScroll();
}
