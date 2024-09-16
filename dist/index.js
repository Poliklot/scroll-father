var ScrollFather = /** @class */ (function () {
    function ScrollFather(config) {
        if (config === void 0) { config = {}; }
        this.scrollListeners = [];
        this.init();
    }
    ScrollFather.prototype.init = function () {
        window.addEventListener('scroll', this.handleScroll.bind(this));
    };
    ScrollFather.prototype.handleScroll = function () {
        var scrollPosition = window.scrollY;
        this.scrollListeners.forEach(function (listener) {
            if (listener.condition(scrollPosition)) {
                listener.element.classList.add(listener.className);
            }
            else {
                listener.element.classList.remove(listener.className);
            }
        });
    };
    ScrollFather.prototype.addScrollListener = function (element, condition, className) {
        this.scrollListeners.push({ element: element, condition: condition, className: className });
    };
    return ScrollFather;
}());
export default ScrollFather;
