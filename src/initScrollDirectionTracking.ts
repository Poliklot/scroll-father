/**
 * Инициализирует отслеживание направления скролла страницы. Устанавливает атрибут `data-scroll-direction` на `body` с
 * направлениями `up` или `down`.
 */
export function initScrollDirectionTracking(): void {
	let lastScrollTop = 0;
	let isScrolling = false;

	const handleScrollDirection = () => {
		const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		const direction = scrollTop > lastScrollTop ? 'down' : 'up';

		document.body.setAttribute('data-scroll-direction', direction);

		lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
		isScrolling = false;
	};

	window.addEventListener('scroll', () => {
		if (!isScrolling) {
			window.requestAnimationFrame(handleScrollDirection);
			isScrolling = true;
		}
	});
}
