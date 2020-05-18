(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.IntervalResizeEmitter = factory());
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

  var checkingElements = [];
  var requestID = 0;
  var isLooping = false;

  function frameLoop() {
    for (var i = 0; i < checkingElements.length; i++) {
      if (changedSize(checkingElements[i].__resizeSensor__)) {
        _dispatchEvent(checkingElements[i], 'resize');
      }
    }
    requestID = _requestAnimationFrame(frameLoop);
  }

  function runFrameLoop() {
    if (isLooping) return;
    requestID = _requestAnimationFrame(frameLoop);
    isLooping = true;
  }

  function stopFrameLoop() {
    if (!isLooping) return;
    _cancelAnimationFrame(requestID);
    isLooping = false;
  }

  var IntervalResizeEmitter = {
    add: function (element) {
      if (element.__resizeSensor__) return;

      element.__resizeSensor__ = {
        target: element,
        prevSize: getSize(element),
        requestID: 0
      };

      checkingElements.push(element);

      runFrameLoop();
    },

    remove: function (element) {
      if (!element.__resizeSensor__) return;

      checkingElements.splice(checkingElements.indexOf(element), 1);
      delete element.__resizeSensor__;

      if (checkingElements.length === 0) stopFrameLoop();
    }
  };

  return IntervalResizeEmitter;

})));
