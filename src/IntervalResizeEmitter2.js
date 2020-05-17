import {
  _requestAnimationFrame,
  _cancelAnimationFrame,
  _dispatchEvent,
  _addEventListener
} from './wrappedFunctions';

import { getSize, changedSize } from './utils';

var IntervalResizeEmitter = {
  add: function (element) {
    if (element.__resizeSensor__) return;

    var sensor = {
      target: element,
      prevSize: getSize(element),
      requestID: 0
    };

    element.__resizeSensor__ = sensor;

    sensor.requestID = _requestAnimationFrame(function loop() {
      if (changedSize(sensor)) {
        _dispatchEvent(sensor.target, 'resize');
      }
      sensor.requestID = _requestAnimationFrame(loop);
    });
  },

  remove: function (element) {
    if (!element.__resizeSensor__) return;
    _cancelAnimationFrame(element.__resizeSensor__.requestID);
    delete element.__resizeSensor__;
  }
};

export default IntervalResizeEmitter;
