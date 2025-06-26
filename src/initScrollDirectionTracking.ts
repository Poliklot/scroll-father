/**
 * Инициализирует отслеживание направления скролла страницы. Устанавливает атрибут `data-scroll-direction` на `body` с направлениями `up` или `down`.
 * @param trackUserEventsOnly Если true, отслеживаются только события `wheel` и `touchmove`. Если false, также отслеживается событие `scroll`. По умолчанию false.
 */
export function initScrollDirectionTracking(trackUserEventsOnly: boolean = false): void {
	let lastScrollTop = 0;
	let isScrolling = false;

	const handleScrollDirection = () => {
		const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		const direction = scrollTop > lastScrollTop ? 'down' : 'up';

		document.body.setAttribute('data-scroll-direction', direction);

		lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
		isScrolling = false;
	};

	if (trackUserEventsOnly) {
		init('wheel')
		init('touchmove')
	} else {
		init('scroll')
	}

	function init(eventType: string) {
		window.addEventListener(eventType, () => {
			if (!isScrolling) {
				window.requestAnimationFrame(handleScrollDirection);
				isScrolling = true;
			}
		});
	}
}
