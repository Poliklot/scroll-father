import { trackScrollState } from '../../dist';

trackScrollState({
	onScrollStart: () => console.log('Скролл начался!'),
	onScrollReset: () => console.log('Скролл сброшен!'),
});
