var _requestAnimationFrame = requestAnimationFrame
  || mozRequestAnimationFrame
  || webkitRequestAnimationFrame
  || function (cb) { return setTimeout(cb, 1000 / 60) };

var _cancelAnimationFrame = cancelAnimationFrame
  || mozCancelAnimationFrame
  || webkitCancelAnimationFrame
  || clearTimeout;

var _dispatchEvent = (function () {
  if (typeof Event === 'function') {
    return function (element, type) {
      element.dispatchEvent(new Event(type));
    };
  }

  return function (element, type) {
    var event = document.createEvent('Event');
    event.initEvent(type, false, false);
    element.dispatchEvent(event);
  }
})();

var _addEventListener = (function () {
  if (typeof document.addEventListener === 'function') {
    return function (element, type, handler, capture) {
      element.addEventListener(type, handler, capture);
    }
  }

  return function (element, type, handler, capture) {
    element.attachEvent('on' + type, handler);
  }
})();

var _stopImmediatePropagation = (function () {
  var _event;
  if (typeof Event === 'function') {
    _event = new Event('resize');
  } else {
    _event = document.createEvent('Event');
  }

  if (typeof _event.stopImmediatePropagation === 'function') {
    return function (event) {
      event.stopImmediatePropagation();
    }
  } else if (typeof _event.stopPropagation() === 'function') {
    return function (event) {
      event.stopPropagation();
    }
  }
  return function (event) {};
})();

export {
  _requestAnimationFrame,
  _cancelAnimationFrame,
  _dispatchEvent,
  _addEventListener,
  _stopImmediatePropagation
};
