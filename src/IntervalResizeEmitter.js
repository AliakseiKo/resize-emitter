import {
  _requestAnimationFrame,
  _cancelAnimationFrame,
  _dispatchEvent
} from './wrappedFunctions';

import { getSize, changedSize } from './utils';

var IntervalResizeEmitter = {
  add: function (element) {
    var sensor = {
      target: element,
      prevSize: getSize(element),
      requestID: 0
    };

    element.__resizeSensor__ = sensor;

    function loop() {
      if (changedSize(sensor)) _dispatchEvent(sensor.target, 'resize');
      sensor.requestID = _requestAnimationFrame(loop);
    }

    sensor.requestID = _requestAnimationFrame(loop);
  },

  remove: function (element) {
    if (element.__resizeSensor__) {
      _cancelAnimationFrame(element.__resizeSensor__.requestID);
      delete element.__resizeSensor__;
    }
  }
};

export { IntervalResizeEmitter };
