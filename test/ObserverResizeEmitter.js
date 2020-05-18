(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.ObserverResizeEmitter = factory());
}(this, (function () { 'use strict';

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

  function getSize(element) {
    return { width: element.offsetWidth, height: element.offsetHeight };
  }

  function changedSize(sensor) {
    var newSize = getSize(sensor.target);
    if (newSize.width === sensor.prevSize.width
      && newSize.height === sensor.prevSize.height) return false;
    return (sensor.prevSize = newSize, true);
  }

  function resizeHandler(entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].borderBoxSize || entries[i].contentRect) {
        var sensor = entries[i].target.__resizeSensor__;

        if (sensor.requestID) _cancelAnimationFrame(sensor.requestID);
        sensor.requestID = _requestAnimationFrame(function () {
          if (!changedSize(sensor)) return;
          _dispatchEvent(sensor.target, 'resize');
        });

        break;
      }
    }
  }

  var ObserveResizeEmitter = {
    add: function (element) {
      if (element.__resizeSensor__) return;

      var observer = new ResizeObserver(resizeHandler);
      observer.observe(element);

      element.__resizeSensor__ = {
        target: element,
        observer: observer,
        prevSize: getSize(element),
        requestID: 0
      };
    },

    remove: function (element) {
      if (!element.__resizeSensor__) return;

      element.__resizeSensor__.observer.disconnect();
      delete element.__resizeSensor__;
    }
  };

  return ObserveResizeEmitter;

})));
