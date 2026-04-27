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
const feed = document.querySelector('[data-feed]');
const sentinel = document.querySelector('[data-feed-sentinel]');
const cleanups = [];
const getHeaderOffset = () => Math.round((header?.getBoundingClientRect().height ?? 0) + 24);
const stateLabels = {
	idle: 'ожидание',
	loading: 'загрузка',
	done: 'готово',
	error: 'ошибка',
};

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
];
let renderedCount = 0;

if (feed && sentinel) {
	appendFeedItems(feedItems.slice(0, 6));
	renderedCount = 6;
	setLoaderText('idle');

	cleanups.push(
		initInfiniteLoader({
			sentinel,
			rootMargin: '900px 0px',
			initialPage: 2,
			loadMore: async ({ done }) => {
				setLoaderText('loading');
				await wait(90);

				const nextItems = feedItems.slice(renderedCount, renderedCount + 4);
				if (nextItems.length === 0) {
					setLoaderText('done');
					sentinel.classList.add('is-done');
					sentinel.querySelector('p').textContent = 'Все демо-карточки загружены.';
					done();
					return false;
				}

				appendFeedItems(nextItems);
				renderedCount += nextItems.length;
				setLoaderText(renderedCount >= feedItems.length ? 'done' : 'idle');

				if (renderedCount >= feedItems.length) {
					sentinel.classList.add('is-done');
					sentinel.querySelector('p').textContent = 'Все демо-карточки загружены.';
					done();
					return false;
				}
			},
			onStateChange: ({ state }) => setLoaderText(state),
			onError: ({ retry }) => {
				setLoaderText('error');
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

function setLoaderText(state) {
	if (loaderState) {
		loaderState.textContent = stateLabels[state] ?? state;
	}
}

function wait(ms) {
	return new Promise(resolve => {
		window.setTimeout(resolve, ms);
	});
}
