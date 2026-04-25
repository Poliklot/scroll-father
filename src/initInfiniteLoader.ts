import { canUseDOM, noop, resolveElement } from './dom';
import type { Cleanup, ElementInput, InfiniteLoaderState } from './types';

export type InfiniteLoaderContext = {
	page: number;
	signal: AbortSignal;
	done: () => void;
};

export type InfiniteLoaderStateChange = {
	state: InfiniteLoaderState;
	page: number;
	error?: unknown;
};

export type InfiniteLoaderError = {
	error: unknown;
	page: number;
	retry: () => void;
};

export type InfiniteLoaderOptions = {
	/** Sentinel-элемент, при появлении которого запускается загрузка. */
	sentinel: ElementInput;
	/** IntersectionObserver root. */
	root?: HTMLElement | null;
	rootMargin?: string;
	threshold?: number | number[];
	/** Страница, с которой начинается счётчик. */
	initialPage?: number;
	/** Догружать сразу, если sentinel уже виден. */
	prefill?: boolean;
	loadMore: (context: InfiniteLoaderContext) => Promise<boolean | void> | boolean | void;
	hasMore?: () => boolean;
	onStateChange?: (change: InfiniteLoaderStateChange) => void;
	onError?: (error: InfiniteLoaderError) => void;
};

export function initInfiniteLoader(options: InfiniteLoaderOptions): Cleanup {
	if (!canUseDOM() || typeof IntersectionObserver === 'undefined') {
		return noop;
	}

	const settings = {
		root: null as HTMLElement | null,
		rootMargin: '400px 0px',
		threshold: 0 as number | number[],
		initialPage: 1,
		prefill: true,
		...options,
	};
	const sentinel = resolveElement(settings.sentinel);

	if (!sentinel) {
		return noop;
	}

	let page = settings.initialPage;
	let state: InfiniteLoaderState = 'idle';
	let destroyed = false;
	let abortController: AbortController | null = null;
	let prefillFrame: number | null = null;

	const observer = new IntersectionObserver(
		entries => {
			if (entries.some(entry => entry.isIntersecting)) {
				load();
			}
		},
		{
			root: settings.root,
			rootMargin: settings.rootMargin,
			threshold: settings.threshold,
		},
	);

	const retry = () => {
		if (destroyed || state !== 'error') {
			return;
		}

		setState('idle');
		load();
	};

	const load = () => {
		if (destroyed || state === 'loading' || state === 'done') {
			return;
		}

		if (settings.hasMore && !settings.hasMore()) {
			setState('done');
			return;
		}

		observer.unobserve(sentinel);
		abortController = new AbortController();
		let markedDone = false;
		const currentPage = page;

		setState('loading');

		Promise.resolve()
			.then(() =>
				settings.loadMore({
					page: currentPage,
					signal: abortController!.signal,
					done: () => {
						markedDone = true;
					},
				}),
			)
			.then(result => {
				if (destroyed || abortController?.signal.aborted) {
					return;
				}

				if (markedDone || result === false || (settings.hasMore && !settings.hasMore())) {
					setState('done');
					return;
				}

				page += 1;
				setState('idle');
				observeOrPrefill();
			})
			.catch(error => {
				if (destroyed || abortController?.signal.aborted) {
					return;
				}

				setState('error', error);

				if (settings.onError) {
					settings.onError({ error, page: currentPage, retry });
				} else {
					console.error('[scroll-father] initInfiniteLoader loadMore failed:', error);
				}
			});
	};

	const observeOrPrefill = () => {
		if (destroyed || state === 'loading' || state === 'error' || state === 'done') {
			return;
		}

		if (settings.prefill && isElementVisible(sentinel, settings.root)) {
			prefillFrame = window.requestAnimationFrame(() => {
				prefillFrame = null;
				load();
			});
			return;
		}

		observer.observe(sentinel);
	};

	observeOrPrefill();

	return () => {
		destroyed = true;
		observer.disconnect();

		if (prefillFrame !== null) {
			window.cancelAnimationFrame(prefillFrame);
			prefillFrame = null;
		}

		if (abortController) {
			abortController.abort();
			abortController = null;
		}
	};

	function setState(nextState: InfiniteLoaderState, error?: unknown): void {
		state = nextState;
		settings.onStateChange?.({ state, page, error });
	}
}

function isElementVisible(element: HTMLElement, root: HTMLElement | null): boolean {
	const rect = element.getBoundingClientRect();

	if (!root) {
		return rect.top <= window.innerHeight && rect.bottom >= 0;
	}

	const rootRect = root.getBoundingClientRect();

	return rect.top <= rootRect.bottom && rect.bottom >= rootRect.top;
}
