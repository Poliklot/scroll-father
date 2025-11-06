/**
 * Инициализирует отслеживание направления скролла страницы.
 * Устанавливает атрибут `data-scroll-direction` на `body` со значениями `up` | `down`.
 * @param trackUserEventsOnly Если true, отслеживаются только события `wheel` и `touchmove`.
 *                            Если false, также отслеживается событие `scroll`. По умолчанию false.
 * @param thresholdPx Минимальное изменение scrollTop (в пикселях) для смены направления. По умолчанию 6.
 */
export function initScrollDirectionTracking(
  trackUserEventsOnly: boolean = false,
  thresholdPx: number = 6
): void {
  let ticking = false;

  const readScrollTop = (): number =>
    Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop,
      0
    );

  // Позиция, относительно которой считаем дельту и подтверждаем смену направления
  let anchorScrollTop = readScrollTop();
  // Текущее подтверждённое направление
  let currentDirection: 'down' | 'up' = 'down';
  document.body.setAttribute('data-scroll-direction', currentDirection);

  const handleScrollDirection = () => {
    const scrollTop = readScrollTop();
    const diff = scrollTop - anchorScrollTop;

    // Равенство/микродвижения — игнорируем
    if (diff === 0 || Math.abs(diff) < thresholdPx) {
      ticking = false;
      return;
    }

    const nextDirection: 'down' | 'up' = diff > 0 ? 'down' : 'up';
    if (nextDirection !== currentDirection) {
      currentDirection = nextDirection;
      document.body.setAttribute('data-scroll-direction', currentDirection);
    }

    // Переносим «якорь» в текущую позицию — дальнейшие дельты считаем отсюда
    anchorScrollTop = scrollTop;
    ticking = false;
  };

  const schedule = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(handleScrollDirection);
    }
  };

  const init = (eventType: string) => {
    window.addEventListener(eventType, schedule, { passive: true });
  };

  if (trackUserEventsOnly) {
    init('wheel');
    init('touchmove');
  } else {
    init('scroll');
  }
}
