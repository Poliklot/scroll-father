/**
 * Добавляет плавную прокрутку ко всем ссылкам-якорям на странице. При клике по ссылке происходит плавный скролл к
 * соответствующему элементу на странице.
 */
export function smootherAllAnchorLinks(): void {
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			if (anchor.getAttribute('href') === '#') return;

			const targetId = anchor.getAttribute('href')!.substring(1); // убираем символ #
			const $elementToScroll = document.getElementById(targetId); // находим элемент по id

			if (!$elementToScroll) return;

			// Находим позицию родителя и дочернего элемента относительно верха документа
			const parentOffsetTop = $elementToScroll.parentElement?.offsetTop || 0;
			const childOffsetTop = $elementToScroll.offsetTop;

			// Вычисляем окончательную позицию для прокрутки
			const scrollToTop = parentOffsetTop + childOffsetTop;

			// Прокручиваем документ до нужной позиции
			document.documentElement.scrollTo({
				top: scrollToTop,
				left: 0,
				behavior: 'smooth',
			});
		});
	});
}
