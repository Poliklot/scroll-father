/** Параметры для настройки отслеживания состояния скролла. */
interface ScrollTrackerOptions {
	/**
	 * Атрибут, который будет добавлен к элементу при скролле.
	 *
	 * @default 'data-scrolled'
	 */
	attribute?: string;

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
 * @returns {void}
 */
export function trackScrollState(options: ScrollTrackerOptions = {}): void {
	const { attribute = 'data-scrolled', element = document.body, onScrollStart, onScrollReset } = options;

	let scrolled = false;

	/** Обработчик скролла. */
	const handleScroll = () => {
		const target = element === document.body ? window : element;
		const scrollPosition = target === window ? window.scrollY : element.scrollTop;

		if (scrollPosition > 0) {
			if (!scrolled) {
				element.setAttribute(attribute, '');
				scrolled = true;
				onScrollStart?.(); // Вызов коллбэка при начале скролла
			}
		} else {
			if (scrolled) {
				element.removeAttribute(attribute);
				scrolled = false;
				onScrollReset?.(); // Вызов коллбэка при сбросе скролла
			}
		}
	};

	// Определяем, какой элемент слушать
	const target = element === document.body ? window : element;

	// Добавляем слушатель скролла
	target.addEventListener(
		'scroll',
		() => {
			requestAnimationFrame(handleScroll);
		},
		{ passive: true },
	);

	// Проверяем состояние при инициализации
	handleScroll();
}
