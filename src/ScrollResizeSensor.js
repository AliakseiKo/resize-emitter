import {
  _requestAnimationFrame,
  _cancelAnimationFrame,
  _dispatchEvent,
  _addEventListener,
  _stopImmediatePropagation
} from './wrappedFunctions';

import { getSize, changedSize, isNode } from './utils';

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
  createResizeEmitter: function createResizeEmitter(element) {
    isNode(element);
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

  removeResizeEmitter: function removeResizeEmitter(element) {
    isNode(element);
    if (element.__resizeSensor__) {
      element.removeChild(element.__resizeSensor__.element);
      delete element.__resizeSensor__;
    };
  }
};

export { ScrollResizeEmitter };
