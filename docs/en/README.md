# Scroll Father

[🇷🇺 Документация на русском](https://github.com/Poliklot/scroll-father/blob/master/README.md)

Scroll Father is a lightweight and versatile JavaScript/TypeScript library that provides a set of useful functions for
working with scroll interactions in web applications. It allows developers to easily integrate required functionality by
importing only the necessary features, optimizing load times and improving performance.

## Features

- **Modularity:** Import only the functions you need.
- **Rich functionality:** Functions for detecting scroll direction, smooth scrolling, tracking elements on the page, and
  more.
- **High performance:** Optimized code with minimal impact on bundle size.
- **TypeScript support:** Full type definitions for convenient development and auto-completion.
- **Ease of use:** Simple and intuitive APIs for quick integration.

## Installation

Install via npm:

```bash
npm i scroll-father
```

Or add it via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/scroll-father/dist/ScrollFather.min.js"></script>
```

# Quick Start

### Importing required functions

You can import only the functions you need:

```javascript
// Import individual functions
import { initScrollListener, smoothScrollToElement } from 'scroll-father';
```

Or import everything at once (not recommended):

```javascript
// Import the entire library
import * as ScrollFather from 'scroll-father';
```

## Using the functions

### 1. Scroll state detection

Automatically adds an attribute (e.g., `data-scrolled`) to a specified element when scrolling the page.

```javascript
import { initScrollListener } from 'scroll-father';

initScrollListener({
	attribute: 'data-scrolled', // Attribute name (default: 'data-scrolled')
	element: document.body, // Element to set the attribute (default: document.body)
});
```

### 2. Scroll direction detection

Detects the scroll direction and sets an attribute (`data-scroll-direction="up"` or `"down"`) on the `<body>` element.

```javascript
import { initScrollDirectionTracking } from 'scroll-father';

initScrollDirectionTracking();
```

### 3. Infinite scrolling

Loads additional content when the user reaches the end of the page.

```javascript
import { initInfiniteScroll } from 'scroll-father';

initInfiniteScroll(
	async () => {
		// Your code for loading additional content
		await fetchMoreData();
	},
	{
		threshold: 300, // Threshold value in pixels from the end of the page (default: 300)
	},
);
```

### 4. Scroll debounce

Adds a debounced scroll event handler, ensuring that the provided callback is not called more frequently than the
specified delay.

```javascript
import { debounceScroll } from 'scroll-father';

debounceScroll(() => {
	// Your code to be called during debounced scrolling
}, 200); // Delay in milliseconds before the function is called (default: 200)
```

### 5. Element visibility tracking

Initializes tracking of an element using `IntersectionObserver`. Calls functions when the element appears or disappears
from the viewport.

```javascript
import { initIntersectionSection } from 'scroll-father';

const $section = document.querySelector('#my-section');

initIntersectionSection(
	$section,
	() => {
		// Called when the element enters the viewport
		console.log('Element entered the viewport');
	},
	() => {
		// Called when the element leaves the viewport
		console.log('Element left the viewport');
	},
	{
		rootMargin: '-50% 0px', // Viewport margins (default: '-50% 0px')
		threshold: 0, // Visibility threshold (default: 0)
	},
);
```

### 6. Smooth scrolling for anchor links

Adds smooth scrolling to all anchor links on the page.

```javascript
import { smootherAllAnchorLinks } from 'scroll-father';

smootherAllAnchorLinks();
```

## Function descriptions

- **debounceScroll(callback, delay?)** Adds a scroll event handler with debounce. The `callback` function will not be
  called more often than once every `delay` milliseconds.

- **initInfiniteScroll(loadMoreCallback, options?)** Implements infinite scrolling, calling `loadMoreCallback` when the
  user reaches the end of the page. The `options.threshold` parameter specifies how many pixels from the end of the page
  the callback should be triggered.

- **initIntersectionSection($section, onStart, onEnd, options?)** Tracks the `$section` element using
  `IntersectionObserver`. Calls `onStart` when the element enters the viewport and `onEnd` when it leaves.

- **initScrollDirectionTracking()** Tracks the scroll direction and sets the `data-scroll-direction` attribute on
  `<body>` with values `"up"` or `"down"`.

- **initScrollListener(options?)** Tracks the scroll state of the page and sets an attribute (default: `data-scrolled`)
  on a specified element when scrolling.

- **smootherAllAnchorLinks()** Adds smooth scrolling to all anchor links on the page, providing a smoother transition to
  target elements.

## Contributing

We welcome contributions! Feel free to submit issues or pull requests via our
[GitHub repository](https://github.com/Poliklot/scroll-father).

## License

This project is licensed under the MIT License - see the
[LICENSE](https://github.com/Poliklot/scroll-father/blob/master/LICENSE) file for details.
