(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.ResizeEmitter = factory());
}(this, (function () { 'use strict';

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

  function getSize(element) {
    return { width: element.offsetWidth, height: element.offsetHeight };
  }

  function changedSize(sensor) {
    var newSize = getSize(sensor.target);
    if (newSize.width === sensor.prevSize.width
      && newSize.height === sensor.prevSize.height) return false;
    return (sensor.prevSize = newSize, true);
  }

  function isNode(element) {
    if (!(element instanceof Node)) throw new Error('element must extend Node class');
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

  var animationString;
  var animationstartEvent = 'animationstart';
  var keyframesInited = false;

  function initKeyframes() {
    if (keyframesInited) return;

    var keyframeprefix = '';

    var el = document.createElement('fakeElement');
    if(el.style.animationName === undefined) {
      var domPrefixes = ['webkit', 'moz', 'o', 'ms'];
      var startEvents = ['webkitAnimationStart', 'animationstart', 'oAnimationStart', 'MSAnimationStart'];

      for(var i = 0; i < domPrefixes.length; i++) {
        if(el.style[domPrefixes[i] + 'AnimationName'] === undefined) continue;

        keyframeprefix = '-' + domPrefixes[i] + '-';
        animationstartevent = startEvents[i];
      }
    }

    animationString = keyframeprefix + 'animation:1ms __ResizeSensorKF__;';
    var css = '@' + keyframeprefix + 'keyframes __ResizeSensorKF__{from{opacity:0}to{opacity:0}}';

    var style = document.createElement('style');
    style.type = 'text/css';

    if (style.styleSheet) style.styleSheet.cssText = css;
    else style.appendChild(document.createTextNode(css));

    document.head.appendChild(style);

    keyframesInited = true;
  }

  function scrollListener(event) {
    _stopImmediatePropagation(event);

    var sensor = event.currentTarget.parentNode.__resizeSensor__;

    resetSensor(sensor.element);

    if (sensor.requestID) _cancelAnimationFrame(sensor.requestID);
    sensor.requestID = _requestAnimationFrame(function () {
      if (!changedSize(sensor)) return;
      _dispatchEvent(sensor.target, 'resize');
    });

    return false;
  }
  function animationListener(event) {
    _stopImmediatePropagation(event);

    var sensor = event.currentTarget.parentNode.__resizeSensor__;
    if (event.animationName === '__ResizeSensorKF__') resetSensor(sensor.element);

    return false;
  }

  function resetSensor(sensorElement) {
    var expand = sensorElement.firstElementChild;
    var shrink = sensorElement.lastElementChild;
    var expandChild = expand.firstElementChild;

    shrink.scrollLeft = shrink.scrollWidth;
    shrink.scrollTop = shrink.scrollHeight;
    expandChild.style.width = expand.offsetWidth + 1 + 'px';
    expandChild.style.height = expand.offsetHeight + 1 + 'px';
    expand.scrollLeft = expand.scrollWidth;
    expand.scrollTop = expand.scrollHeight;
  }
  function createSensor() {
    var style = 'position:absolute;left:0;top:0;right:0;bottom:0;z-index:-1;overflow:hidden;visibility:hidden;opacity:0;pointer-events:none;';
    var childStyle = 'position:absolute;left:0;top:0;';

    var sensorElement = document.createElement('div');
    sensorElement.classList.add('__ResizeSensor__');
    sensorElement.dir = 'ltr';
    sensorElement.style.cssText = style + animationString;

    var expand = document.createElement('div');
    expand.style.cssText = style;
    sensorElement.appendChild(expand);

    var expandChild = document.createElement('div');
    expandChild.style.cssText = childStyle;
    expand.appendChild(expandChild);

    var shrink = document.createElement('div');
    shrink.style.cssText = style;
    sensorElement.appendChild(shrink);

    var shrinkChild = document.createElement('div');
    shrinkChild.style.cssText = childStyle + 'width:200%;height:200%;';
    shrink.appendChild(shrinkChild);

    return sensorElement;
  }

  var ScrollResizeEmitter = {
    add: function (element) {
      if (element.__resizeSensor__) return;

      initKeyframes();

      if (getComputedStyle(element).position === 'static') element.style.position = 'relative';

      var sensorElement = createSensor();
      element.appendChild(sensorElement);

      resetSensor(sensorElement);

      element.__resizeSensor__ = {
        target: element,
        element: sensorElement,
        prevSize: getSize(element),
        requestID: 0
      };

      _addEventListener(sensorElement, 'scroll', scrollListener, true);
      _addEventListener(sensorElement, animationstartEvent, animationListener, true);
    },

    remove: function (element) {
      if (!element.__resizeSensor__) return;

      element.removeChild(element.__resizeSensor__.element);
      delete element.__resizeSensor__;
    }
  };

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

  function isIntervalTag(tagName) {
    if (
      tagName === 'TABLE'
      || tagName === 'THEAD'
      || tagName === 'TBODY'
      || tagName === 'TR'
      || tagName === 'IMG'
      || tagName === 'INPUT'
      || tagName === 'TEXTAREA'
      || tagName === 'CANVAS'
      || tagName === 'PICTURE'
      || tagName === 'AUDIO'
      || tagName === 'VIDEO'
      // || tagName === 'EMBED'
    ) return true;
    return false;
  }

  var ResizeEmitter;

  if (typeof ResizeObserver === 'function') {
    ResizeEmitter = {
      add: function (element) {
        function add(element) {
          isNode(element);
          ObserveResizeEmitter.add(element);
        }

        if (typeof element.length === 'number') {
          for (var i = 0; i < element.length; i++) {
            add(element[i]);
          }
        } else {
          add(element);
        }
      },

      remove: function (element) {
        function remove(element) {
          isNode(element);
          ObserveResizeEmitter.remove(element);
        }

        if (typeof element.length === 'number') {
          for (var i = 0; i < element.length; i++) {
            remove(element[i]);
          }
        } else {
          remove(element);
        }
      }
    };
  } else {
    ResizeEmitter = {
      add: function (element) {
        function add(element) {
          isNode(element);
          if (isIntervalTag(element.tagName)) {
            IntervalResizeEmitter.add(element);
          } else {
            ScrollResizeEmitter.add(element);
          }
        }

        if (typeof element.length === 'number') {
          for (var i = 0; i < element.length; i++) {
            add(element[i]);
          }
        } else {
          add(element);
        }
      },

      remove: function (element) {
        function remove(element) {
          isNode(element);
          if (isIntervalTag(element.tagName)) {
            IntervalResizeEmitter.remove(element);
          } else {
            ScrollResizeEmitter.remove(element);
          }
        }

        if (typeof element.length === 'number') {
          for (var i = 0; i < element.length; i++) {
            remove(element[i]);
          }
        } else {
          remove(element);
        }
      }
    };
  }

  var ResizeEmitter$1 = ResizeEmitter;

  return ResizeEmitter$1;

})));
