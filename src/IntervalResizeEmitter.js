import {
  _requestAnimationFrame,
  _cancelAnimationFrame,
  _dispatchEvent
} from './wrappedFunctions';

import { getSize, changedSize, isNode } from './utils';

var IntervalResizeEmitter = {
  createResizeEmitter: function createResizeEmitter(element) {
    isNode(element);
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

  removeResizeEmitter: function removeResizeEmitter(element) {
    isNode(element);
    if (element.__resizeSensor__) {
      _cancelAnimationFrame(element.__resizeSensor__.requestID);
      delete element.__resizeSensor__;
    }
  }
};

export { IntervalResizeEmitter };
