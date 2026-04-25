export type Cleanup = () => void;

export type ScrollTarget = Window | HTMLElement;

export type ElementInput = string | HTMLElement;

export type ElementsInput = string | HTMLElement[] | NodeListOf<HTMLElement>;

export type OffsetValue = number | (() => number);

export type ScrollDirection = 'up' | 'down' | 'none';

export type HashUpdateMode = 'keep' | 'clear' | 'replace' | 'push';

export type InfiniteLoaderState = 'idle' | 'loading' | 'error' | 'done';

export type ScrollProgressSnapshot = {
	progress: number;
	scrollTop: number;
	maxScroll: number;
};
