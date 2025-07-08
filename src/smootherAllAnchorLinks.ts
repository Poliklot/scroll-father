
export interface SmoothScrollOptions {
	/** Отступ сверху в пикселях (для учета фиксированных элементов) */
	offset?: number;
	/** Тип прокрутки: 'smooth' (плавная) или 'auto' (мгновенная) */
	behavior?: ScrollBehavior;
	/** Очистка хэша из location */
	clearHash?: boolean;
}

/**
 * Добавляет плавную прокрутку ко всем ссылкам-якорям (`a[href^="#"]`) на странице.
 * Автоматически обрабатывает клики по таким ссылкам и плавно прокручивает страницу к целевому элементу.
 *
 * @param {SmoothScrollOptions} options - Настройки для плавной прокрутки
 * @returns {void}
 *
 * @example
 * * Базовое использование с настройками по умолчанию
 * smootherAllAnchorLinks();
 *
 * @example
 * * С учетом фиксированной шапки (отступ 60px)
 * smootherAllAnchorLinks({ offset: 60 });
 *
 * @example
 * * С мгновенной прокруткой
 * smootherAllAnchorLinks({ behavior: 'auto' });
 */
export function smootherAllAnchorLinks(options: SmoothScrollOptions = {}): void {
	const settings = {
		offset: 0,
		behavior: 'smooth' as ScrollBehavior,
		clearHash: true
	};

	Object.assign(settings, options);

	// ! При загрузке
	if (location.hash) {
		const hash = location.hash
		clearHash()
		scrollToHash(hash)

		const id = setTimeout(() => {
			if (settings.clearHash === false) {
				returnHash(hash)
			}
			clearTimeout(id)
		}, 1)
	}

	// ! При нажатии
	document.querySelectorAll('a[href*="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			const href = anchor.getAttribute('href')
			const url = new URL(href!, location.origin);

			// ! Если на другой сайт или на тот же сайт но страницы разные то ничего не делаем
			if (url.origin !== location.origin || url.pathname !== location.pathname) {
				return
			}

			// ! Иначе плавный скролл
			e.preventDefault()
			scrollToHash(url.hash)
		});
	});

	function scrollToHash(hash: string) {
			if (hash === '#') return;

			const targetId = hash!.substring(1);
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

			scrollTo({
				top: offsetTop - settings.offset,
				left: 0,
				behavior: settings.behavior,
			});
	}

	function clearHash() {
		const url = new URL(location.href, location.origin);
		url.hash = '';
		history.replaceState(null, '', url.toString());
	}

	function returnHash(hash: string) {
		const url = new URL(location.href, location.origin);
		url.hash = hash;
		history.replaceState(null, '', url.toString());
	}
}
