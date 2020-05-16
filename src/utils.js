function getSize(element) {
  return { width: element.offsetWidth, height: element.offsetHeight };
}

function changedSize(sensor) {
  var newSize = getSize(sensor.target);
  if (newSize.width === sensor.prevSize.width
    && newSize.height === sensor.prevSize.height) return false;
  return (sensor.prevSize = newSize, true);
}

function isNode(element) {
  if (!(element instanceof Node)) throw new Error('element must extend Node class');
}

export { getSize, changedSize, isNode };
