var _requestAnimationFrame = window.requestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.webkitRequestAnimationFrame
  || function (cb) { return window.setTimeout(cb, 1000 / 60) };

var _cancelAnimationFrame = window.cancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.clearTimeout;

var _createEvent = (function () {
  try {
    var _event = new Event('resize');

    return function (type) {
      return new Event(type);
    }
  } catch (e) {
    return function (type) {
      var event = document.createEvent('Event');
      event.initEvent(type, false, false);
      return event;
    }
  }
})();

var _dispatchEvent = (function () {
  return function (element, type) {
    element.dispatchEvent(_createEvent(type));
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
  var _event = _createEvent('resize');

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
