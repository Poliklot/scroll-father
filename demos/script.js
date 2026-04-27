import {
	initAnchorScroll,
	initInfiniteLoader,
	initRevealOnScroll,
	initScrollDirectionTracking,
	initScrollProgress,
	initScrollSpy,
	trackScrollState,
} from '../dist/index.js';

const header = document.querySelector('[data-site-header]');
const loaderState = document.querySelector('[data-loader-state]');
const loaderStatus = document.querySelector('[data-loader-status]');
const loaderCount = document.querySelector('[data-loader-count]');
const loaderHistory = document.querySelector('[data-loader-history]');
const feed = document.querySelector('[data-feed]');
const sentinel = document.querySelector('[data-feed-sentinel]');
const cleanups = [];
const getHeaderOffset = () => Math.round((header?.getBoundingClientRect().height ?? 0) + 24);
const initialFeedCount = 8;
const feedBatchSize = 6;
const maxLoaderHistoryItems = 8;
const stateLabels = {
	idle: 'Ожидаем',
	loading: 'Загружаем',
	loaded: 'Подгрузилось',
	done: 'Готово',
	error: 'Ошибка',
};
let lastHistorySignature = '';

cleanups.push(
	initAnchorScroll({
		selector: 'a[href^="#"]',
		offset: getHeaderOffset,
		updateHash: 'replace',
		focusTarget: true,
	}),
	initScrollSpy({
		sections: 'main section[id]',
		navLinks: '.site-nav a[href^="#"]',
		offset: getHeaderOffset,
		activeClass: 'is-active',
		attributeElement: document.body,
		attribute: 'data-active-section',
		ariaCurrent: 'location',
	}),
	initRevealOnScroll({
		elements: '[data-reveal]',
		visibleClass: 'is-visible',
		hiddenClass: 'is-hidden',
		attribute: 'data-reveal-state',
		stagger: index => Math.min(index, 8) * 18,
	}),
	initScrollProgress({
		element: document.documentElement,
		cssVariable: '--page-progress',
		attribute: false,
	}),
	initScrollDirectionTracking(false, 8),
	trackScrollState({ element: document.body }),
);

highlightTypeScriptSnippets();

const feedItems = [
	{
		title: 'Документация с активным меню',
		text: 'Пункты навигации сами подсвечиваются, а якорные переходы учитывают высоту шапки.',
		api: 'якоря + активное меню',
	},
	{
		title: 'Лендинг с быстрым появлением блоков',
		text: 'Библиотека ставит состояние, CSS отвечает за внешний вид, а задержка появления не копится до бесконечности.',
		api: 'появление элементов',
	},
	{
		title: 'Лонгрид с прогрессом чтения',
		text: 'Значение прогресса пишется в CSS-переменную, поэтому полоску можно оформить без лишнего JavaScript.',
		api: 'прогресс чтения',
	},
	{
		title: 'Каталог с дозагрузкой товаров',
		text: 'Маяк внизу списка просит следующую страницу заранее, пока пользователь еще не уперся в пустоту.',
		api: 'бесконечная лента',
	},
	{
		title: 'Шапка, которая не мешает читать',
		text: 'Направление скролла пишется в body, а CSS полностью прячет шапку и оставляет только прогресс.',
		api: 'направление скролла',
	},
	{
		title: 'Мягкая миграция со старого API',
		text: 'Старые helpers оставлены, чтобы обновление пакета не превращалось в ночной переписанный проект.',
		api: 'совместимость',
	},
	{
		title: 'Безопасный импорт на сервере',
		text: 'Если нет browser globals, инициализаторы возвращают безопасную пустую очистку и не валят сборку.',
		api: 'SSR без падений',
	},
	{
		title: 'Динамический отступ для шапки',
		text: 'Отступ может быть функцией: высота шапки, админ-панель, баннер cookies или любое условие во время работы.',
		api: 'динамический offset',
	},
	{
		title: 'Доступная навигация без забытых мелочей',
		text: 'Фокус на целевом блоке и aria-current помогают клавиатуре и скринридерам понимать, где пользователь.',
		api: 'focus + aria-current',
	},
	{
		title: 'Страница портфолио',
		text: 'Проекты могут появляться быстро и последовательно, но без ощущения, что интерфейс догоняет пользователя.',
		api: 'быстрый reveal',
	},
	{
		title: 'Список статей',
		text: 'Прогресс чтения и активные разделы помогают не теряться в длинном материале.',
		api: 'статьи и разделы',
	},
	{
		title: 'Прайс или тарифы',
		text: 'Плавные якоря ведут к нужному тарифу, а липкая навигация показывает текущий блок.',
		api: 'якорные переходы',
	},
	{
		title: 'Лента новостей',
		text: 'Дозагрузка идет порциями, состояние видно сразу, а завершение не требует костылей.',
		api: 'done-состояние',
	},
	{
		title: 'Каталог услуг',
		text: 'Карточки можно догружать заранее, а при уходе со страницы отменять текущий запрос.',
		api: 'AbortSignal',
	},
	{
		title: 'Витрина продукта',
		text: 'Прокрутка, подсветка меню и прогресс работают вместе, но каждая часть включается отдельно.',
		api: 'модульный подход',
	},
	{
		title: 'Раздел с частыми вопросами',
		text: 'Активная секция и плавный переход помогают быстро вернуться к нужному вопросу.',
		api: 'активная секция',
	},
	{
		title: 'Обучающий материал',
		text: 'Пользователь видит, сколько осталось читать, а меню не теряет текущий урок.',
		api: 'прогресс + меню',
	},
	{
		title: 'Длинная главная страница',
		text: 'Шапка исчезает при чтении вниз и возвращается при движении вверх, не перекрывая контент.',
		api: 'умная шапка',
	},
	{
		title: 'Мини-приложение без фреймворка',
		text: 'Все сценарии можно собрать на обычном DOM без компонентной системы и внешних зависимостей.',
		api: 'обычный DOM',
	},
	{
		title: 'База знаний с главами',
		text: 'Разделы подсвечиваются по мере чтения, а переходы ведут к нужной главе без ручного расчета координат.',
		api: 'главы материала',
	},
	{
		title: 'Маркетинговый лонгрид',
		text: 'Большая страница остается управляемой: прогресс показывает путь, а блоки появляются без тяжелого сценария.',
		api: 'длинная история',
	},
	{
		title: 'Внутренний справочник',
		text: 'Сотрудники быстро прыгают к нужным разделам, а активное меню помогает не потеряться в регламентах.',
		api: 'справочник',
	},
	{
		title: 'Страница вакансий',
		text: 'Якоря ведут к командам, условиям и форме отклика, не пряча начало блока под липкой шапкой.',
		api: 'карьера',
	},
	{
		title: 'Онбординг продукта',
		text: 'Шаги знакомства можно раскрывать по мере прокрутки и не перегружать первый экран лишними деталями.',
		api: 'онбординг',
	},
	{
		title: 'Сравнение тарифов',
		text: 'Пользователь быстро возвращается к нужному тарифу, а подсветка показывает текущую часть сравнения.',
		api: 'тарифы',
	},
	{
		title: 'Галерея кейсов',
		text: 'Карточки кейсов подгружаются порциями, сохраняя страницу быстрой даже при большом архиве.',
		api: 'кейсы',
	},
	{
		title: 'Финансовый отчет',
		text: 'Длинные отчеты легче читать, когда есть прогресс, быстрые якоря и понятная текущая глава.',
		api: 'отчеты',
	},
	{
		title: 'Расписание мероприятий',
		text: 'Новые события можно добавлять по мере движения вниз, а маяк заранее попросит следующую порцию.',
		api: 'мероприятия',
	},
	{
		title: 'Документация интерфейса',
		text: 'Примеры, параметры и рецепты остаются доступными через меню, которое всегда знает активный раздел.',
		api: 'документация',
	},
	{
		title: 'Панель обучения',
		text: 'Уроки загружаются постепенно, а состояние ленты явно говорит, когда можно ожидать следующую пачку.',
		api: 'обучение',
	},
	{
		title: 'Магазин с подборками',
		text: 'Подборки товаров появляются без полной перерисовки страницы и не ломают позицию пользователя.',
		api: 'подборки',
	},
	{
		title: 'Блог компании',
		text: 'Архив статей можно листать долго, не заставляя посетителя нажимать кнопку после каждой страницы.',
		api: 'архив статей',
	},
	{
		title: 'Справочник терминов',
		text: 'Короткие карточки терминов догружаются порциями, а завершение ленты видно без догадок.',
		api: 'термины',
	},
	{
		title: 'Лента отзывов',
		text: 'Отзывы можно подгружать по мере чтения, оставляя первые экраны легкими и быстрыми.',
		api: 'отзывы',
	},
	{
		title: 'Карта разделов',
		text: 'Большое оглавление оживает от прокрутки: текущий раздел подсвечен, переходы остаются плавными.',
		api: 'оглавление',
	},
	{
		title: 'Страница релиза',
		text: 'Нововведения, исправления и заметки можно вести одним длинным полотном без ручных обработчиков.',
		api: 'релиз',
	},
	{
		title: 'Каталог недвижимости',
		text: 'Объекты подгружаются заранее, пока пользователь еще рассматривает текущую подборку.',
		api: 'каталог',
	},
	{
		title: 'Раздел поддержки',
		text: 'Ответы и инструкции появляются партиями, а текущий статус показывает, идет ли дозагрузка.',
		api: 'поддержка',
	},
	{
		title: 'История изменений',
		text: 'Длинный список изменений не раздувает первый экран и при этом остается удобным для чтения.',
		api: 'изменения',
	},
	{
		title: 'Публичная дорожная карта',
		text: 'Планы можно группировать и догружать без отдельного состояния в каждом компоненте страницы.',
		api: 'планы',
	},
	{
		title: 'Чеклист внедрения',
		text: 'Шаги внедрения раскрываются последовательно, чтобы команда видела путь без лишнего шума.',
		api: 'чеклист',
	},
	{
		title: 'Подборка материалов',
		text: 'Статьи, видео и инструкции можно отдавать порциями, не заставляя ждать весь список сразу.',
		api: 'материалы',
	},
	{
		title: 'Страница курса',
		text: 'Модули курса подгружаются по мере прокрутки, а прогресс помогает понимать длину маршрута.',
		api: 'курс',
	},
	{
		title: 'Сборник инструкций',
		text: 'Пошаговые руководства не теряют контекст: меню, якоря и прогресс работают как один слой.',
		api: 'инструкции',
	},
	{
		title: 'Портал партнеров',
		text: 'Материалы для партнеров можно показывать партиями, не усложняя основную навигацию.',
		api: 'партнеры',
	},
	{
		title: 'Навигация по главам',
		text: 'Активная глава обновляется автоматически, а переход к соседним частям остается предсказуемым.',
		api: 'главы',
	},
	{
		title: 'Рейтинг материалов',
		text: 'Популярные записи догружаются ниже текущего экрана и не блокируют первый рендер страницы.',
		api: 'рейтинг',
	},
	{
		title: 'Архив публикаций',
		text: 'Старые публикации можно листать без пагинации, сохраняя понятное состояние загрузки.',
		api: 'публикации',
	},
	{
		title: 'Раздел результатов',
		text: 'Метрики, кейсы и выводы появляются в нужном темпе, а пользователь видит, когда лента закончилась.',
		api: 'результаты',
	},
	{
		title: 'Финальная проверка ленты',
		text: 'Когда карточки заканчиваются, маяк переходит в готовое состояние и больше не дергает загрузчик.',
		api: 'готовая лента',
	},
];
let renderedCount = 0;
let feedFinished = false;

if (feed && sentinel) {
	appendFeedItems(feedItems.slice(0, initialFeedCount));
	renderedCount = initialFeedCount;
	setLoaderStatus('idle', { remember: true });

	cleanups.push(
		initInfiniteLoader({
			sentinel,
			rootMargin: '900px 0px',
			initialPage: 2,
			loadMore: async ({ done, page }) => {
				setLoaderStatus('loading', { detail: `Порция ${page}` });
				await wait(160);

				const nextItems = feedItems.slice(renderedCount, renderedCount + feedBatchSize);
				if (nextItems.length === 0) {
					markFeedDone(done);
					return false;
				}

				appendFeedItems(nextItems);
				renderedCount += nextItems.length;
				setLoaderStatus('loaded', { detail: `+${nextItems.length} карточек`, remember: true });
				await wait(520);

				if (renderedCount >= feedItems.length) {
					markFeedDone(done);
					return false;
				}
			},
			onStateChange: ({ state, page }) => {
				if (state === 'loading') {
					setLoaderStatus('loading', { detail: `Порция ${page}` });
					return;
				}

				if (state === 'done') {
					markFeedDone();
					return;
				}

				setLoaderStatus(state, { remember: state === 'idle' });
			},
			onError: ({ retry }) => {
				setLoaderStatus('error', { detail: 'Нажмите на маяк, чтобы повторить', remember: true });
				sentinel.addEventListener('click', retry, { once: true });
			},
		}),
	);
}

window.addEventListener('pagehide', () => cleanups.forEach(cleanup => cleanup()), { once: true });

function appendFeedItems(items) {
	const fragment = document.createDocumentFragment();

	items.forEach((item, index) => {
		const card = document.createElement('article');
		card.className = 'feed-card';
		card.setAttribute('data-reveal-state', 'visible');
		card.style.setProperty('--feed-delay', `${index * 24}ms`);
		card.innerHTML = `
			<span>${item.api}</span>
			<h3>${item.title}</h3>
			<p>${item.text}</p>
		`;
		fragment.append(card);
	});

	feed.append(fragment);
}

function setLoaderStatus(state, options = {}) {
	const label = stateLabels[state] ?? state;
	const countText = `${renderedCount} из ${feedItems.length}`;

	if (loaderState) {
		loaderState.textContent = label;
		loaderState.dataset.state = state;
	}

	if (loaderStatus) {
		loaderStatus.dataset.state = state;
	}

	if (loaderCount) {
		loaderCount.textContent = options.detail ? `${countText} · ${options.detail}` : countText;
	}

	if (options.remember) {
		addLoaderHistoryItem(state, label, options.detail ?? countText);
	}
}

function addLoaderHistoryItem(state, label, detail) {
	if (!loaderHistory) {
		return;
	}

	const signature = `${state}:${renderedCount}:${detail}`;
	if (signature === lastHistorySignature) {
		return;
	}
	lastHistorySignature = signature;

	const item = document.createElement('li');
	item.dataset.state = state;
	item.innerHTML = `<span>${label}</span><small>${detail}</small>`;
	loaderHistory.append(item);

	while (loaderHistory.children.length > maxLoaderHistoryItems) {
		loaderHistory.firstElementChild?.remove();
	}

	loaderHistory.scrollTo({ left: loaderHistory.scrollWidth, behavior: 'smooth' });
}

function markFeedDone(done) {
	if (feedFinished) {
		done?.();
		return;
	}

	feedFinished = true;
	setLoaderStatus('done', { detail: 'лента завершена', remember: true });
	sentinel.classList.add('is-done');
	sentinel.querySelector('p').textContent = `Все ${feedItems.length} демо-карточек загружены.`;
	done?.();
}

function wait(ms) {
	return new Promise(resolve => {
		window.setTimeout(resolve, ms);
	});
}

function highlightTypeScriptSnippets() {
	document.querySelectorAll('code.language-ts').forEach(code => {
		if (code.dataset.highlighted === 'true') {
			return;
		}

		code.innerHTML = highlightTypeScript(code.textContent ?? '');
		code.dataset.highlighted = 'true';
	});
}

function highlightTypeScript(source) {
	const placeholders = new Map();
	const escaped = escapeHtml(source).replace(
		/\/\*[\s\S]*?\*\/|\/\/[^\n]*|`(?:\\[\s\S]|[^`\\])*`|'(?:\\[\s\S]|[^'\\])*'|"(?:\\[\s\S]|[^"\\])*"/g,
		match => {
			const type = match.startsWith('//') || match.startsWith('/*') ? 'comment' : 'string';
			const marker = `\uE000${createPlaceholderKey(placeholders.size)}\uE000`;
			placeholders.set(marker, `<span class="code-token code-token--${type}">${match}</span>`);
			return marker;
		},
	);

	return escaped
		.replace(
			/\b(import|from|const|let|var|return|async|await|new|function|type|interface|export|default|if|else|true|false|null|undefined)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()|\b(\d+(?:\.\d+)?)\b/g,
			(match, keyword, fnName, number) => {
				if (keyword) {
					return `<span class="code-token code-token--keyword">${match}</span>`;
				}

				if (fnName) {
					return `<span class="code-token code-token--function">${match}</span>`;
				}

				return `<span class="code-token code-token--number">${match}</span>`;
			},
		)
		.replace(/\uE000[A-Z]+\uE000/g, marker => placeholders.get(marker) ?? '');
}

function escapeHtml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function createPlaceholderKey(index) {
	let next = index;
	let key = '';

	do {
		key = String.fromCharCode(65 + (next % 26)) + key;
		next = Math.floor(next / 26) - 1;
	} while (next >= 0);

	return key;
}
