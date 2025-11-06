/**
 * Добавляет обработчик прокрутки с дебаунсом. Эта функция гарантирует, что переданный колбэк будет вызываться не чаще,
 * чем с указанной задержкой.
 *
 * @param {() => void} callback - Функция, которая будет вызываться при прокрутке.
 * @param {number} - Задержка в миллисекундах перед вызовом функции. Default is `200`
 */
export function debounceScroll(callback: () => void, delay: number = 200): void {
	let timeout: number | null = null;

	const debouncedFunction = () => {
		if (timeout !== null) {
			clearTimeout(timeout);
		}
		timeout = window.setTimeout(callback, delay);
	};

	window.addEventListener('scroll', debouncedFunction, { passive: true });
}
