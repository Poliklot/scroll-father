
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

	const { origin, pathname, hash, href } = location
	const urlCurrent = new URL(href, origin);

	// ! При загрузке
	if (hash) {
		const hashTemp = hash
		clearHash()
		scrollToElementById(hashTemp)
	}

	// ! При нажатии
	document.querySelectorAll('a[href*="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			const href = anchor.getAttribute('href')
			const urlTarget = new URL(href!, origin);

			// ! Если на другой сайт или на тот же сайт но страницы разные то ничего не делаем
			if (urlTarget.origin !== origin || urlTarget.pathname !== pathname) {
				return
			}

			// ! Иначе плавный скролл
			e.preventDefault() // ! Здесь роль clearHash выполняет
			scrollToElementById(urlTarget.hash)
		});
	});

	function scrollToElementById(hash: string) {
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

			window.scrollTo({
				top: offsetTop - settings.offset,
				left: 0,
				behavior: settings.behavior,
			});

			const idTimeout = setTimeout(() => {
			if (settings.clearHash === false) {
				returnHash(hash)
			}
			clearTimeout(idTimeout)
		}, 1)
	}

	function clearHash() {
		urlCurrent.hash = '';
		history.replaceState(null, '', urlCurrent.toString());
	}

	function returnHash(hash: string) {
		urlCurrent.hash = hash;
		history.replaceState(null, '', urlCurrent.toString());
	}
}
