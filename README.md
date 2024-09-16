# Scroll Father

[🇷🇺 Документация на русском](docs/ru/README.md)

Scroll Father is a lightweight JavaScript/TypeScript library for handling scroll events, detecting scroll direction, and integrating `IntersectionObserver` with ease. It helps to manage dynamic classes and attributes based on scroll position and other scroll-related events.

## Features

- **Scroll state detection:** Automatically sets or removes attributes based on scroll position.
- **Scroll direction detection:** Adds `data-scroll-direction="up"` or `down` to the body.
- **IntersectionObserver integration:** Easily trigger callbacks when elements enter or exit the viewport.
- **Highly customizable:** Customize attributes, elements, margins, and more.

## Installation

Install via npm:

```bash
npm install scroll-father
```

Or add via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/scroll-father/dist/index.js"></script>
```

## Usage

### 1. Scroll State Detection
Automatically adds an attribute (e.g., `data-scrolled`) to a specified element when the page is scrolled down.

```typescript
import ScrollFather from 'scroll-father';

const scrollFather = new ScrollFather({
  attribute: 'data-scrolled', // Default attribute
  element: document.body      // Default element is the <body>
});
```

### 2. Scroll Direction Detection
Detects the direction of the scroll and sets an attribute (`data-scroll-direction="up"` or `"down"`) on the body element.

```typescript
scrollFather.initScrollDirectionTracking();
```

### 3. IntersectionObserver for Sections
Initialize a section for monitoring when it enters or exits the viewport.

```typescript
scrollFather.initIntersectionSection(
  document.querySelector('.section') as HTMLElement,
  () => console.log('Section is in view'),
  () => console.log('Section is out of view')
);
```

## Configuration Options

- `ScrolledOptions`: Configuration for scroll state detection.
    - `attribute`: The attribute name to be set on the element when scrolled (default is `data-scrolled`).
    - `element`: The element where the attribute will be applied (default is `document.body`).
- `IntersectionOptions`: Options for IntersectionObserver.
    - `rootMargin`: Margin around the root for intersection (default is `-50% 0px`).
    - `threshold`: Threshold to determine when the section is considered in view (default is `0`).

## Contributing
We welcome contributions! Feel free to submit issues or pull requests via our [GitHub repository](https://github.com/Poliklot/scroll-father).

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/Poliklot/scroll-father/blob/master/LICENSE) file for details.