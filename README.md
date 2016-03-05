# SAFDOM
Simple as $uck DOM API shorthands. Fast as hell. Mainly to use with latest Chromium (45+).
All other browsers compatibility notes in code are JUST FOR REFERENCE, and not all features have such notes.
It is not intended to be totally cross-browser, although tries to use only general, well-known and compatible calls.

I'm using it with my [nw.js](http://nwjs.io/) projects to get totally rid of jQuery (which is VERY SLOW and bloated for such use),
while having convinient tool for querying CSS selectors, DOM traversal and manipulations.

It does not have tests (yet?) and had been published only for demonstration purposes.
Can have some dirty comments and untested code and does not ready for production use.

About tests: having the code not being very complicated, it still requires some unit testing.
If you can/want to help writing them (and for any other contribution or sugestions) -- use offshore@aopdg.com to contact me.

P.S. I know that extending core objects' prototypes is far not a 'best practice' and have some side effects,
but hey. Accept it or leave it. It's a specific thing for a specific case.
And bear in mind that unlike other browsers, Chromium is immune to performance impact introduced by such approach.

## Dive in

Just
```
npm install safdom
```
or
```
git clone https://github.com/offshore/safdom.git
```

SAFDOM default behavior depends on include method.
The detection based on variable `module` tested to be in surrounding context.
See below.

### Browsers / simple
```html
<script type="text/javascript" src="path/to/dist/safdom.min.js"></script>
```
This just loads SAFDOM and do prototype extension automatically.

### NW.js / advanced
If your nw.js project is simple single-window application, you can use the browser method already described above.
But there is one more interesting option available, especially if you open (possibly many) windows dynamically.
In background context you can do something like this:
```javascript
var $SAF = require('safdom');
// when you open new window, do magic:
nw.Window.open('someWindow.html', {}, function(someWindow) {
    $SAF(someWindow.window);
});
```
And then, `someWindow`'s DOM objects got extended.

## API Reference

### A note on forEach, NodeList and HTMLCollection
The only unprefixed thing in SAFDOM is a `forEach` method for NodeList and HTMLCollection;
however its done to achieve the same behavior and interface as seen on `(Array|Map|Set|...).forEach()`;
the only difference is that it returns `list` on which it was called -- for chaining purposes.
- **`list.forEach(callback, thisArg)`**: wrapper to `Array.prototype.forEach.call(list, callback, thisArg || list)`, returns list;
  `callback`'s `this` is pointing to `thisArg`; and arguments are:
  - `v`: (currentValue), the current thing being processed in the list
  - `k`: (index), the index of the current element being processed in the list
  - `list`: (array), The array that `forEach` is being applied to

Another method for NodeList and HTMLCollection is `$slice`, which acts exactly as `Array.slice`
and can be used to flatten LIVE lists.
- **`list.$slice(begin, end)`**: same as `Array.prototype.slice.call(list, begin, end)`, returns shallow copied list transformed to plain array

Maybe it's worth switching from `forEach` to `map`, because latter is more suitable for chaining.
Anyway, I think NodeList and HTMLCollection deserve their own `map` and `reduce` methods.

### Node comparison
- **`x.$has(y)`**: same as [`x.contains(y)`](https://developer.mozilla.org/en-US/docs/Web/API/Node/contains)
- **`x.$eq(y)`**: check `x` identity (===) to `y`
- **`x.$lt(y)`** and **`x.$gt(y)`**: determine that `x` is somewhere before or after `y` in DOM tree, respectively.
  Uses [`Node.compareDocumentPosition`](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition), returns `0` or `non-0`
  (see `Node.DOCUMENT_POSITION_*`).

### Node manipulation
All of those methods do the same things as their jQuery cousins;
except that `x` and `y` can only be `Node` instances (no strings, selectors, arrays or other magic handling).
However you may be interested in `$(html|text)(Before|Prepend|Append|After)` -- see below.
They all return `x` (except `$clone`, which returns (optionally deep) detached copy of `x`), so can be easily chained with each other or other manipulation shorthands.
- **`x.$after(y)`** \* x must have parent
- **`x.$append(y)`**
- **`x.$appendTo(y)`**
- **`x.$before(y)`** \* x must have parent
- **`x.$clone(deep)`**: same as [`x.cloneNode(deep)`](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode); returns detached copy of x
- **`x.$detach()`**
- **`x.$insertAfter(y)`** \* y must have parent
- **`x.$insertBefore(y)`** \* y  must have parent
- **`x.$prepend(y)`**
- **`x.$prependTo(y)`**
- **`x.$replace(y)`** \* x must have parent; remember that [`replaceChild`](https://developer.mozilla.org/en-US/docs/Web/API/Node/replaceChild) is destructive
- **`x.$clear()`**: same as jQuery.empty() -- wipes children

### Element extensions
#### Attributes
- **`x.$attrH(k)`**: same as [`x.hasAttribute(k)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute)
- **`x.$attrG(k)`**: same as [`x.getAttribute(k)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute), pay attention to behavior notes
- **`x.$attrS(k, v)`**: same as [`x.setAttribute(k, v)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute), but returns x for chaining
- **`x.$attrD(k, k, ...)`**: same as [`x.removeAttribute(k)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute) for each argument, but returns x for chaining
- **`x.$attrU(k, v)`**: $attrD when v == null, $attrS otherwise
- **`x.$attrU(kv)`**: $attrU for each k and v in kv

#### Properties
- **`x.$propG(k)`**: just return x[k]
- **`x.$propS(k, v)`**: set x[k] to v, return x for chaining

#### Class names
Remember that IE10- does not support the second parameter for `.toggle()` and multiple params for `.add` or `.remove`;
however it may be shimmed later. See docs for [Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) / [DOMTokenList](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList).
- **`x.$classA(v, v, ...)`**: add each v to `Element.classList`
- **`x.$classD(v, v, ...)`**: remove each v from `Element.classList`
- **`x.$classH(v)`**: check that `Element.classList` contains v
- **`x.$classT(v, state)`**: toggle v in `Element.classList` when state == null, otherwise add/remove it for state is true/false, respectively

#### HTML content and manipulation
- **`x.$htmlG()`**: just return x.innerHTML
- **`x.$htmlS(v)`**: set x.innerHTML to v, return x for chaining

Those are crafty. Allows you to update HTML content inside and around element without side effects (losing events or performance impact);
so they act like `x.$before`, `x.$prepend`, `x.$append` and `x.$after` versions with html argument.
See [`Element.insertAdjacentHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML) for details.
- **`x.$htmlBefore(v)`** \* x must have parent
- **`x.$htmlPrepend(v)`**: like `x.innerHTML = v + x.innerHTML`
- **`x.$htmlAppend(v)`**: like `x.innerHTML = x.innerHTML + v`
- **`x.$htmlAfter(v)`** \* x must have parent

#### Text content
Note compatibility issues for \*G and \*S: see [reference for `Node.textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent).
- **`x.$textG(k)`**: just return x.textContent
- **`x.$textS(k, v)`**: set x.textContent to v, return x for chaining

Acts like `x.$before`, `x.$prepend`, `x.$append` and `x.$after` versions with text argument, automatically creating text Node with supplied
argument and attaching it appropriately.
- **`x.$textBefore(v)`**: \* x must have parent
- **`x.$textPrepend(v)`**
- **`x.$textAppend(v)`**
- **`x.$textAfter(v)`**: \* x must have parent

#### Search/selection utilities
Note that results of methods for querying multiple things can return not only HTMLCollection, but NodeList as well, and both LIVE and NON-live versions;
it can be tricky sometimes, so be sure to check documented behavior for appropriate shorthands.
- **`x.$f(selector)`**: same as [`x.querySelectorAll(selector)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll), returns NON-live list
- **`x.$s(selector)`**: same as [`x.querySelector(selector)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector), returns first match or `null`
- **`x.$t(tagName)`**: same as [`x.getElementsByTagName(tagName)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName), returns LIVE list
- **`x.$c(className)`**: same as [`x.getElementsByClassName(className)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName), returns LIVE list
- **`x.$is(selector)`**: same as [`x.matches(selector)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches), returns bool
- **`x.$closest(selector)`**: same as [`x.matches(selector)`](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches), returns closest matching ancestor (including x) or null

#### Traversal utils related to Element (not Node!)
- **`x.$idx()`**: obtain x index relative to its parent, or -1 if not found or detached
- **`x.$idxOf(y)`**: obtain y index relative to x, which should be it's parent, returns -1 if not found, detached, or y is not direct child of x
- **`x.$up()`**: just return `x.parentElement`
- **`x.$fc()`**: just return `x.firstElementClild`
- **`x.$lc()`**: just return `x.lastElementClild`
- **`x.$ps()`**: just return `x.previousElementSibling`
- **`x.$ns()`**: just return `x.nextElementSibling`

**Deprecated for now** due to naming problem and tricky nature. Most likely be renamed to `$psa` and `$nsa`, or even be completely cut:
- **`x.$pss()`**: find all siblings between (and including if not null) `x.parentElement.firstElementChild` and `x.previousElementSibling`, returns NONlive list
- **`x.$nss()`**: find all siblings between (and including if not null) `x.nextElementSibling` and `x.parentElement.lastElementChild`, returns NONlive list

### EventTarget shorthands
**Only minimal set of utilities for now**
- **`x.$on(event, handler)`**: same as [`x.addEventListener(event, handler, false)`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener), but returns x for chaining
- **`x.$onc(event, handler)`**: capturing version for `$on`
- **`x.$off(event, handler)`**: same as [`x.removeEventListener(event, handler, false)`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener), but returns x for chaining
- **`x.$offc(event, handler)`**: capturing version for `$off`

### Globals
**Selectors**:
- **`$id(id)`**: same as [`document.getElementById(id)`](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById), returns thing or `null`
- **`$f(selector)`**: same as [`document.querySelectorAll(selector)`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll), returns NON-live list
- **`$s(selector)`**: same as [`document.querySelector(selector)`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector), returns first match or `null`
- **`$t(tagName)`**: same as [`document.getElementsByTagName(tagName)`](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByTagName), returns LIVE list
- **`$c(className)`**: same as [`document.getElementsByClassName(className)`](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName), returns LIVE list

**Minimal (for now) construction shorthands**:
- **`$mk(tagName)`**: same as [`document.createElement(tagName)`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
- **`$mkT(textContent)`**: same as [`document.createTextNode(textContent)`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode)


### Appendix: method name parts cheatsheet
The dictionary of method names is fairly simple, short and easy to remember; screw those who prefer `WaitForMultipleObjects` over `poll`.
- attr: **Attr**ibute-related stuff
- class: Element **class** names
- html: **HTML** content manipulation
- prop: **Prop**erties
- text: **Text** content manipulation
- f: **F**ind *all* elements matching query
- s: **S**ingle element that meets query
- t: Search by **t**ag name
- c: Search by **c**lass name
- A: Add
- D: Delete
- G: Get
- H: Has
- S: Set
- T: Toggle
- U: Update



