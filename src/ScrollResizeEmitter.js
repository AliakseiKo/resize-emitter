import {
  _requestAnimationFrame,
  _cancelAnimationFrame,
  _dispatchEvent,
  _addEventListener,
  _stopImmediatePropagation
} from './wrappedFunctions';

import { getSize, changedSize } from './utils';

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
};

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
};

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

export default ScrollResizeEmitter;
