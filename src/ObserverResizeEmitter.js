import {
  _requestAnimationFrame,
  _cancelAnimationFrame,
  _dispatchEvent,
  _addEventListener
} from './wrappedFunctions';

import { getSize, changedSize } from './utils';

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

export default ObserveResizeEmitter;
