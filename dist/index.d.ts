declare class ScrollFather {
    private scrollListeners;
    constructor(config?: Record<string, any>);
    private init;
    private handleScroll;
    addScrollListener(element: HTMLElement, condition: (scrollPosition: number) => boolean, className: string): void;
}
export default ScrollFather;
