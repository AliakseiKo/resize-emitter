import {
  _requestAnimationFrame,
  _cancelAnimationFrame,
  _dispatchEvent,
  _addEventListener
} from './wrappedFunctions';

import { getSize, changedSize } from './utils';

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

export default IntervalResizeEmitter;
