import {
	addScrollListener,
	addWindowListener,
	canUseDOM,
	decodeHash,
	getElementTop,
	getHashFromHref,
	getScrollTop,
	noop,
	removeElementAttribute,
	resolveElements,
	resolveOffset,
	scheduleWithRaf,
	setElementAttribute,
} from './dom';
import type { Cleanup, ElementsInput, HashUpdateMode, OffsetValue, ScrollDirection, ScrollTarget } from './types';

export type ScrollSpyChange = {
	activeId: string;
	previousId: string | null;
	activeSection: HTMLElement | null;
	activeLink: HTMLAnchorElement | null;
	direction: ScrollDirection;
};

export type ScrollSpyOptions = {
	/** Секции для отслеживания. */
	sections?: ElementsInput;
	/** Ссылки навигации, которые нужно подсвечивать. */
	navLinks?: string | HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement>;
	/** Область поиска секций и ссылок. */
	scope?: Document | HTMLElement;
	/** Scroll target: окно или scroll-контейнер. */
	target?: ScrollTarget;
	/** Отступ для fixed/sticky header. */
	offset?: OffsetValue;
	/** Класс активной ссылки. */
	activeClass?: string | false;
	/** Класс активной секции. */
	sectionActiveClass?: string | false;
	/** Элемент, на который ставится active attribute. */
	attributeElement?: HTMLElement;
	/** Атрибут с id активной секции. */
	attribute?: string | false;
	/** Управлять aria-current у активной ссылки. */
	ariaCurrent?: boolean | string;
	/** Обновлять URL hash при смене активной секции. */
	updateHash?: HashUpdateMode | false;
	onChange?: (change: ScrollSpyChange) => void;
};

export function initScrollSpy(options: ScrollSpyOptions = {}): Cleanup {
	if (!canUseDOM()) {
		return noop;
	}

	const settings = {
		sections: 'section[id]' as ElementsInput,
		navLinks: 'a[href^="#"]' as string | HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement>,
		scope: document as Document | HTMLElement,
		target: window as ScrollTarget,
		offset: 0 as OffsetValue,
		activeClass: 'is-active' as string | false,
		sectionActiveClass: false as string | false,
		attributeElement: document.body,
		attribute: 'data-active-section' as string | false,
		ariaCurrent: true as boolean | string,
		updateHash: false as HashUpdateMode | false,
		...options,
	};
	const cleanups: Cleanup[] = [];
	const sections = resolveElements(settings.sections, settings.scope).filter(section => Boolean(section.id));
	const navLinks = resolveNavLinks(settings.navLinks, settings.scope);
	let activeId: string | null = null;
	let lastScrollTop = getScrollTop(settings.target);

	const update = () => {
		const scrollTop = getScrollTop(settings.target);
		const direction: ScrollDirection = scrollTop > lastScrollTop ? 'down' : scrollTop < lastScrollTop ? 'up' : 'none';
		lastScrollTop = scrollTop;

		const nextSection = findActiveSection(sections, settings.target, resolveOffset(settings.offset));
		const nextId = nextSection?.id ?? '';

		if (!nextId || nextId === activeId) {
			return;
		}

		const previousId = activeId;
		activeId = nextId;
		const activeLink = applyActiveState(nextId, sections, navLinks, settings);
		updateLocationHash(nextId, settings.updateHash);

		settings.onChange?.({
			activeId: nextId,
			previousId,
			activeSection: nextSection,
			activeLink,
			direction,
		});
	};
	const scheduler = scheduleWithRaf(update);

	cleanups.push(addScrollListener(settings.target, scheduler.schedule));
	cleanups.push(addWindowListener('resize', scheduler.schedule));
	cleanups.push(scheduler.cleanup);

	update();

	return () => {
		cleanups.forEach(cleanup => cleanup());
		clearActiveState(sections, navLinks, settings);
	};
}

function findActiveSection(sections: HTMLElement[], target: ScrollTarget, offset: number): HTMLElement | null {
	if (sections.length === 0) {
		return null;
	}

	let active = sections[0];
	const currentTop = getScrollTop(target) + offset + 1;

	sections.forEach(section => {
		if (getElementTop(section, target) <= currentTop) {
			active = section;
		}
	});

	return active;
}

function resolveNavLinks(
	input: string | HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement>,
	scope: Document | HTMLElement,
): HTMLAnchorElement[] {
	if (typeof input === 'string') {
		return Array.from(scope.querySelectorAll<HTMLAnchorElement>(input));
	}

	return Array.from(input);
}

function applyActiveState(
	activeId: string,
	sections: HTMLElement[],
	navLinks: HTMLAnchorElement[],
	settings: Required<Omit<ScrollSpyOptions, 'onChange'>> & { onChange?: ScrollSpyOptions['onChange'] },
): HTMLAnchorElement | null {
	let activeLink: HTMLAnchorElement | null = null;

	sections.forEach(section => {
		if (settings.sectionActiveClass) {
			section.classList.toggle(settings.sectionActiveClass, section.id === activeId);
		}
	});

	navLinks.forEach(link => {
		const linkHash = getHashFromHref(link.getAttribute('href') ?? '');
		const isActive = decodeHash(linkHash) === activeId;

		if (settings.activeClass) {
			link.classList.toggle(settings.activeClass, isActive);
		}

		if (settings.ariaCurrent) {
			if (isActive) {
				link.setAttribute('aria-current', typeof settings.ariaCurrent === 'string' ? settings.ariaCurrent : 'true');
			} else {
				link.removeAttribute('aria-current');
			}
		}

		if (isActive) {
			activeLink = link;
		}
	});

	setElementAttribute(settings.attributeElement, settings.attribute, activeId);

	return activeLink;
}

function updateLocationHash(activeId: string, mode: HashUpdateMode | false): void {
	if (mode === false || mode === 'keep') {
		return;
	}

	const url = new URL(location.href);
	url.hash = mode === 'clear' ? '' : activeId;

	if (mode === 'push') {
		history.pushState(null, '', url.toString());
		return;
	}

	history.replaceState(null, '', url.toString());
}

function clearActiveState(
	sections: HTMLElement[],
	navLinks: HTMLAnchorElement[],
	settings: Required<Omit<ScrollSpyOptions, 'onChange'>> & { onChange?: ScrollSpyOptions['onChange'] },
): void {
	sections.forEach(section => {
		if (settings.sectionActiveClass) {
			section.classList.remove(settings.sectionActiveClass);
		}
	});

	navLinks.forEach(link => {
		if (settings.activeClass) {
			link.classList.remove(settings.activeClass);
		}

		if (settings.ariaCurrent) {
			link.removeAttribute('aria-current');
		}
	});

	removeElementAttribute(settings.attributeElement, settings.attribute);
}
