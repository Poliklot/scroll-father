/** Параметры для настройки отслеживания состояния скролла страницы. */
interface ScrolledOptions {
	/**
	 * Атрибут, который будет добавлен к элементу при скролле.
	 *
	 * @default 'data-scrolled'
	 */
	attribute?: string;

	/**
	 * Элемент, для которого будет отслеживаться скролл.
	 *
	 * @default document.body
	 */
	element?: HTMLElement;
}

/**
 * Инициализирует отслеживание состояния скролла страницы.
 *
 * При первом скролле добавляет указанный атрибут(`attribute`) к указанному элементу(`element`).
 *
 * @param {ScrolledOptions} [options] - Опции для настройки отслеживания состояния скролла.
 * @param {string | undefined} [options.attribute='data-scrolled'] - Атрибут, который будет добавлен к элементу при
 *   скролле. Default is `'data-scrolled'`
 * @param {HTMLElement | undefined} [options.element=document.body] - Элемент, для которого будет отслеживаться скролл.
 *   Default is `document.body`
 */
export function initScrollListener(options: ScrolledOptions = {}): void {
	const { attribute = 'data-scrolled', element = document.body } = options;

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
