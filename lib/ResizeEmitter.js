(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.ResizeEmitter = factory());
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

  var animationstartEvent = 'animationstart';
  var isStyleInited = false;

  function initStyle() {
    if (isStyleInited) return;

    var keyframeprefix = '';

    var el = document.createElement('fakeElement');
    if(el.style.animationName === undefined) {
      var domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
      var startEvents = ['webkitAnimationStart', 'animationstart', 'oAnimationStart', 'MSAnimationStart'];

      for(var i = 0; i < domPrefixes.length; i++) {
        if(el.style[domPrefixes[i] + 'AnimationName'] === undefined) continue;
        keyframeprefix = '-' + domPrefixes[i].toLowerCase() + '-';
        animationstartEvent = startEvents[i];
      }
    }

    var childStyle = 'position:absolute;left:0;top:0;';
    var parentStyle = childStyle + 'right:0;bottom:0;z-index:-1;overflow:hidden;visibility:hidden;opacity:0;pointer-events:none;';
    var shrinkChildStyle = 'width:200%;height:200%;';

    var css = '@' + keyframeprefix + 'keyframes __ResizeSensorKF__{from{opacity:0}to{opacity:0}}' +
      '.__ResizeSensor__{' + keyframeprefix + 'animation:1ms __ResizeSensorKF__;}' +
      '.__ResizeSensor__,.__ResizeExpand__,.__ResizeShrink__{' + parentStyle + '}' +
      '.__ResizeExpandChild__,.__ResizeShrinkChild__{' + childStyle + '}' +
      '.__ResizeShrinkChild__{' + shrinkChildStyle + '}';

    var styleEl = document.createElement('style');
    styleEl.type = 'text/css';

    if (styleEl.styleSheet) styleEl.styleSheet.cssText = css;
    else styleEl.appendChild(document.createTextNode(css));

    document.head.appendChild(styleEl);

    isStyleInited = true;
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
    var sensorElement = document.createElement('div');
    sensorElement.classList.add('__ResizeSensor__');
    sensorElement.dir = 'ltr';

    var expand = document.createElement('div');
    expand.classList.add('__ResizeExpand__');
    sensorElement.appendChild(expand);

    var expandChild = document.createElement('div');
    expandChild.classList.add('__ResizeExpandChild__');
    expand.appendChild(expandChild);

    var shrink = document.createElement('div');
    shrink.classList.add('__ResizeShrink__');
    sensorElement.appendChild(shrink);

    var shrinkChild = document.createElement('div');
    shrinkChild.classList.add('__ResizeShrinkChild__');
    shrink.appendChild(shrinkChild);

    return sensorElement;
  }

  var ScrollResizeEmitter = {
    add: function (element) {
      if (element.__resizeSensor__) return;

      initStyle();

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
