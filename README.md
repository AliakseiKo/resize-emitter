# resize-emitter

Add resize event to any html element. You can subscribe to the resize event like to any other standard event. **5.01KB** when compressed.

I tried to make to it works in older versions of browsers.
It was tested in:
* IE
  * 11 (Nov 7, 2013)
  * 10 (Nov 13, 2012)
* Edge
    * 81.0.416.72 (May 7, 2020)
    * 44.18362.449.0 (12 Nov, 2019)
* Firefox
    * 76.0.1 (May 8, 2020)
    * 5.0 (Jun 20, 2011)
* Chrome
  * 81.0 (May 5, 2020)
  * 8.0 (Dec 2, 2010)
* Opera
    * 68.0 (May 13, 2020)
    * 15.0 (Jul 1, 2013)
* Safari 5.1 (Jul 20, 2011)

## **Usage**

jQuery:

```js
var $someElements = $('.someElement');

// add resize event emitter for elements or element
ResizeEmitter.add($someElements);

$someElements.on('resize', function (e) {
  console.log('resized', e.target);
});

// you can remove resize emitter later
ResizeEmitter.remove($someElements);
```

JS:

```js
var someElements = document.querySelectorAll('.someElement');

// add resize event emitter for elements or element
ResizeEmitter.add(someElements);

someElements.forEach(function (el) {
  el.addEventListener('resize', (e) => {
    console.log('resized', e.target);
  });
});

// you can remove resize emitter later
ResizeEmitter.remove(someElements);
```

## **Methods**

### **ResizeEmitter.add`(element)`**

Adds ability to emit resize event to passed element or elements.

* `element` - can be one element or collection of elements.

### **ResizeEmitter.remove`(element)`**

Removes ability to emit resize event to passed element or elements.

* `element` - can be one element or collection of elements.

## **How it works**

* If the browser implements [ResizeObserver](https://caniuse.com/#feat=resizeobserver) - then it is used. <br>
<small>*best performance,*</small>
<small>*no memory leaks*</small>

* If the browser does not implement [ResizeObserver](https://caniuse.com/#feat=resizeobserver) then a `div` element with a `__ResizeSensor__` class is embedded in the element, which is hidden and contains additional markup for generating a scroll event on an embeded `div` element. <br>
<small>*best performance,*</small>
<small>*no memory leaks*</small>

* If the browser does not implement [ResizeObserver](https://caniuse.com/#feat=resizeobserver) and your element is `img, input, textarea, canvas, picture, audio, video, table, thead, tbody, tr` then a `requestAnimationFrame` loop is created, where element size is checked. Don't forget to remove resize event emitter `ResizeEmitter.remove(element)`. <br>
<small>*bad performance,*</small>
<small>*causes memory leaks if you do not remove the resize emitter*</small>

So if you want to track the above tags and the browser does not implement [ResizeObserver](https://caniuse.com/#feat=resizeobserver), it's better to wrap them in an extra `div`, to which add a resize event emitter.
