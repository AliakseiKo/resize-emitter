import ObserveResizeEmitter from './ObserverResizeEmitter';
import ScrollResizeEmitter from './ScrollResizeEmitter';
import IntervalResizeEmitter from './IntervalResizeEmitter';
import { isNode } from './utils';

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
// typeof ResizeObserver === 'function'
if (false) {
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

export default ResizeEmitter
