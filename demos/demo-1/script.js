import { smootherAllAnchorLinks, trackScrollState } from '../../dist';
smootherAllAnchorLinks();

trackScrollState({
	onScrollStart: () => console.log('Скролл начался!'),
	onScrollReset: () => console.log('Скролл сброшен!'),
});
