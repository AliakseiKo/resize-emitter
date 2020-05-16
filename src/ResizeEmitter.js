import { ObserveResizeEmitter } from './ObserverResizeSensor';
import { ScrollResizeEmitter } from './ScrollResizeSensor';
import { IntervalResizeEmitter } from './IntervalResizeEmitter';
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

if (typeof ResizeObserver === 'function') {
  ResizeEmitter = ObserveResizeEmitter;
} else {
  ResizeEmitter = {
    createResizeEmitter: function createResizeEmitter(element) {
      isNode(element);
      if (isIntervalTag(element.tagName)) {
        IntervalResizeEmitter.createResizeEmitter(element);
      } else {
        ScrollResizeEmitter.createResizeEmitter(element);
      }
    },

    removeResizeEmitter: function removeResizeEmitter(element) {
      isNode(element);
      if (isIntervalTag(element.tagName)) {
        IntervalResizeEmitter.removeResizeEmitter(element);
      } else {
        ScrollResizeEmitter.removeResizeEmitter(element);
      }
    }
  };
}

export default ResizeEmitter
