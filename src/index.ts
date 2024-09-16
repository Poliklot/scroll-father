/**
 * Опции для отслеживания состояния скролла страницы.
 * @typedef {Object} ScrolledOptions
 * @property {string} [attribute='data-scrolled'] - Имя атрибута, который будет добавляться при скролле.
 * @property {HTMLElement} [element=document.body] - Элемент, на который будет установлен атрибут.
 */
type ScrolledOptions = {
  attribute?: string;
  element?: HTMLElement;
};

/**
 * Опции для настройки IntersectionObserver.
 * @typedef {Object} IntersectionOptions
 * @property {string} [rootMargin='-50% 0px'] - Margin для области видимости.
 * @property {number} [threshold=0] - Порог пересечения элемента с областью просмотра.
 */
type IntersectionOptions = {
  rootMargin?: string;
  threshold?: number;
};

/**
 * Класс ScrollFather для управления состоянием скролла, отслеживания направления и использования IntersectionObserver.
 */
class ScrollFather {
  private scrolled: boolean = false;
  private options: ScrolledOptions;
  private lastScrollTop: number = 0;
  private isScrolling: boolean = false;

  /**
   * Конструктор ScrollFather.
   * @param {ScrolledOptions} [options={}] - Опции для настройки отслеживания состояния скролла.
   */
  constructor(options: ScrolledOptions = {}) {
    this.options = {
      attribute: options.attribute || 'data-scrolled',
      element: options.element || document.body,
    };
    this.initScrollListener();
  }

  /**
   * Устанавливает состояние "проскроллено" для элемента.
   * @private
   */
  private setScrolledState(): void {
    this.scrolled = true;
    this.options.element?.setAttribute(this.options.attribute!, '');
  }

  /**
   * Сбрасывает состояние "проскроллено" для элемента.
   * @private
   */
  private unsetScrolledState(): void {
    this.scrolled = false;
    this.options.element?.removeAttribute(this.options.attribute!);
  }

  /**
   * Обработчик скролла. Устанавливает или сбрасывает состояние в зависимости от положения страницы.
   * @private
   */
  private handleScroll(): void {
    if (window.scrollY > 0) {
      if (!this.scrolled) this.setScrolledState();
    } else {
      if (this.scrolled) this.unsetScrolledState();
    }
  }

  /**
   * Инициализирует слушатель события скролла.
   * Использует `requestAnimationFrame` для оптимизации производительности.
   * @private
   */
  private initScrollListener(): void {
    window.addEventListener('scroll', () => {
      requestAnimationFrame(() => this.handleScroll());
    }, { passive: true });
    this.handleScroll();
  }

  /**
   * Инициализирует отслеживание элемента с помощью IntersectionObserver.
   * Вызывает `onStart`, когда элемент попадает в область просмотра, и `onEnd`, когда выходит.
   *
   * @param {HTMLElement} $section - Элемент для отслеживания.
   * @param {Function} onStart - Функция, вызываемая при попадании элемента в область видимости.
   * @param {Function} onEnd - Функция, вызываемая при выходе элемента из области видимости.
   * @param {IntersectionOptions} [options={}] - Опции для настройки IntersectionObserver.
   */
  public initIntersectionSection(
    $section: HTMLElement,
    onStart: () => void,
    onEnd: () => void,
    options: IntersectionOptions = {}
  ): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onStart();
          } else {
            onEnd();
          }
        });
      },
      {
        root: null,
        rootMargin: options.rootMargin || '-50% 0px',
        threshold: options.threshold || 0,
      }
    );
    observer.observe($section);
  }

  /**
   * Инициализирует отслеживание направления скролла страницы.
   * Устанавливает атрибут `data-scroll-direction` на `body` с направлениями `up` или `down`.
   */
  public initScrollDirectionTracking(): void {
    window.addEventListener('scroll', () => {
      if (!this.isScrolling) {
        window.requestAnimationFrame(() => this.handleScrollDirection());
        this.isScrolling = true;
      }
    });
  }

  /**
   * Обработчик направления скролла. Устанавливает атрибут `data-scroll-direction` на элементе `body`.
   * @private
   */
  private handleScrollDirection(): void {
    const scrollTop = document.documentElement.scrollTop;
    const direction = scrollTop > this.lastScrollTop ? 'down' : 'up';

    document.body.setAttribute('data-scroll-direction', direction);

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    this.isScrolling = false;
  }
}

export default ScrollFather;
