import {
  _requestAnimationFrame,
  _cancelAnimationFrame,
  _dispatchEvent
} from './wrappedFunctions';

import { getSize, changedSize, isNode } from './utils';

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
  createResizeEmitter: function createResizeEmitter(element) {
    isNode(element);
    var observer = new ResizeObserver(resizeHandler);
    observer.observe(element);

    element.__resizeSensor__ = {
      target: element,
      observer: observer,
      prevSize: getSize(element),
      requestID: 0
    };
  },

  removeResizeEmitter: function removeResizeEmitter(element) {
    isNode(element);
    if (element.__resizeSensor__) {
      element.__resizeSensor__.observer.disconnect();
      delete element.__resizeSensor__;
    }
  }
};

export { ObserveResizeEmitter };
