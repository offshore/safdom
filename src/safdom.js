/*! SAFDOM | (c) Alex Offshore | aopdg.com */
;(function(module, exports) {

/**
* PRIMARY TARGET IS LATEST CHROMIUM (Chrome 45+), shorthands and calls optimized for use with it
* all other browsers compatibility notes are JUST FOR REFERENCE, and not for all features,
* although latest versions of FF, Opera, Safari and even IE (Edge) can handle everything fine.
* Feature       Chrome min version  Notes
* $f            1+
* $1            1+
* $t            1+
* $is           34+
* $closest      45+
* $idx, $idxOf  1+                  Dependent on ParentNode.children
* $fc, $lc      1+
* $ps, $ns      4+
* $pss          20+
* $nss          20+
* $class*       8+                  Dependent on Element.classList
*/

// Object.assign is not supported by IE w/o polyfill (but Edge has it), others: [Chrome 45+, FF 34+, Opera 32+, Safari 9+]
// however, the following IS NOT A POLYFILL, just a shorthand
function _extendX(o) {
    for (var k, ai = 1; a = arguments[ai]; ++ai) for (k in a) if (a.hasOwnProperty(k)) o[k] = a[k];
    return o;
};
function _extend(ctx) { return ctx.Object.assign || _extendX; };

function _protoNode(ctx) {
    var Node = ctx.Node,
        DPP = Node.DOCUMENT_POSITION_PRECEDING,
        DPF = Node.DOCUMENT_POSITION_FOLLOWING;

    return {
    // node position comparison stuff
    $has: Node.prototype.contains, // THIS is one of parents of ELT => bool [FF 9+, IE 5+, Safari 3+]
    $eq: function(elt) { return this === elt; }, // THIS equals ELT => bool
    $gt: function(elt) { return this.compareDocumentPosition(elt) & DPP; }, // THIS is somewhere after ELT => int [IE 9+]
    $lt: function(elt) { return this.compareDocumentPosition(elt) & DPF; }, // THIS is somewhere before ELT => int [IE 9+]

    // node manipulation, THIS is what node op is performing on, ELT is reference node, returning THIS if not otherwise noted
    $after: function(elt) { return this.parentNode.insertBefore(elt, elt.nextSibling), this; }, // ELT after THIS (this must have parent)
    $append: function(elt) { return this.appendChild(elt), this; }, // ELT as last child of THIS
    $appendTo: function(elt) { return elt.appendChild(this); }, // THIS as last child of ELT
    $before: function(elt) { return this.parentNode.insertBefore(elt, this), this; }, // ELT before THIS (this must have parent)
    $clone: Node.prototype.cloneNode, // clone THIS (optionally deep), return NEW
    $detach: function() { return this.parentNode ? this.parentNode.removeChild(this) : this; }, // detach/remove THIS
    $insertAfter: function(elt) { return elt.parentNode.insertBefore(this, elt.nextSibling); }, // THIS after ELT (elt must have parent)
    $insertBefore: function(elt) { return elt.parentNode.insertBefore(this, elt); }, // THIS after ELT (elt must have parent)
    $prepend: function(elt) { return this.insertBefore(elt, this.firstChild), this; }, // ELT as first child of THIS
    $prependTo: function(elt) { return elt.insertBefore(this, elt.firstChild); }, // THIS as first child of ELT
    $replace: function(elt) { return this.parentNode.replaceChild(elt, this); }, // replace THIS with ELT
    $clear: function() { while (this.lastChild) this.removeChild(this.lastChild); return this; }, // wipe children
}; };

function _protoArr(ctx) {
    var forEach = ctx.Array.prototype.forEach;

    return {
    // enumeration / collection related utils
    forEach: function(callback, thisArg) { return forEach.call(this, callback, thisArg || this), this; }, // callback(element, index, collection)
    $slice: ctx.Array.prototype.slice, // to transform (live) collections to arrays
}; };

function _protoElement(ctx) {
    var protoElement = ctx.Element.prototype,
        dtlA = ctx.DOMTokenList.prototype.add,
        dtlD = ctx.DOMTokenList.prototype.remove,
        forEach = ctx.Array.prototype.forEach,
        indexOf = ctx.Array.prototype.indexOf;

    return {
    // attributes
    $attrH: protoElement.hasAttribute,
    $attrG: protoElement.getAttribute,
    $attrS: function(k, v) { return this.setAttribute(k, v), this; },
    $attrD: function(k) { return forEach.call(arguments, protoElement.removeAttribute, this), this; }, // supports many arguments
    $attrU: function(kv, v) { // unset when v == null (i.e. null or undefined)
        if (arguments.length == 2) return ((v == null) ? this.removeAttribute(kv) : this.setAttribute(kv, v)), this;
        for (var k in kv) if (kv.hasOwnProperty(k)) ((v = kv[k]), v == null) ? this.removeAttribute(k) : this.setAttribute(k, v);
        return this;
    },

    // class [IE10+; Does not support the second parameter for .toggle() and multiple params for .add / .remove]
    $classA: function() { return dtlA.apply(this.classList, arguments), this; }, // same as $classAM
    $classD: function() { return dtlD.apply(this.classList, arguments), this; }, // same as $classDM
    $classH: function(token) { return this.classList.contains(token); },
    $classT: function(token, force) { return this.classList.toggle(token, force), this; }, // toggle when force == null (i.e. null or undefined)

    // html content
    $htmlG: function() { return this.innerHTML; },
    $htmlS: function(html) { return (this.innerHTML = html), this; },
    $htmlBefore: function(html) { return this.insertAdjacentHTML('beforebegin', html), this; }, // HTML before THIS (this must have parent)
    $htmlPrepend: function(html) { return this.insertAdjacentHTML('afterbegin', html), this; }, // HTML before first child of THIS
    $htmlAppend: function(html) { return this.insertAdjacentHTML('beforeend', html), this; }, // HTML after last child of THIS
    $htmlAfter: function(html) { return this.insertAdjacentHTML('afterend', html), this; }, // HTML after THIS (this must have parent)

    // properties
    $propG: function(k) { return this[k]; },
    $propS: function(k, v) { return (this[k] = v), this; },

    // text content
    $textG: function() { return this.textContent; },
    $textS: function(text) { return (this.textContent = text), this; },
    $textBefore: function(text) { return this.parentNode.insertBefore(document.createTextNode(text), this), this; }, // TEXT before THIS (this must have parent)
    $textPrepend: function(text) { return this.insertBefore(document.createTextNode(text), this.firstChild), this; }, // TEXT before first child of THIS
    $textAppend: function(text) { return this.appendChild(document.createTextNode(text)), this; }, // TEXT after last child of THIS
    $textAfter: function(text) { return this.parentNode.insertBefore(document.createTextNode(text), this.nextSibling), this; }, // TEXT after THIS (this must have parent)

    // search/selection utils
    $f: protoElement.querySelectorAll, // Find all => NONlive HTMLCollection [Chrome 1+, FF 3.5+, IE 8+, Opera 10+, Safari 3.2+]
    $s: protoElement.querySelector, // Single (first) matched element => Element or null [Chrome 1+, FF 3.5+, IE 8+, Opera 10+, Safari 3.2+]
    $t: protoElement.getElementsByTagName, // by Tag name => LIVE HTMLCollection [Chrome 1+, IE 6+]
    $c: protoElement.getElementsByClassName, // by Class name => LIVE HTMLCollection [IE 9+]
    $is: protoElement.matches, // IS matching selector => bool [Chrome 34+, FF 34+, IE ?, Opera 21+, Safari 7.1+]
    $closest: protoElement.closest, // closest ancestor of THIS (or THIS itself) which matches selector => Element or null [Chrome 41+, Firefox 35+]

    // traversal utils related to Element (not Node)
    $idx: function() { return indexOf.call(this.parentElement.children || [], this); }, // THIS element index relative to its parent, or -1 if not found or detached
    $idxOf: function(elt) { return indexOf.call(this.children, elt); }, // ELT index relative to THIS, or -1 if not a direct child
    $up: function() { return this.parentElement; }, // shorthand to THIS.parentElement
    $fc: function() { return this.firstElementClild; }, // shorthand to THIS.firstElementClild
    $lc: function() { return this.lastElementClild; }, // shorthand to THIS.lastElementClild
    $ps: function() { return this.previousElementSibling; }, // one immidiately previous Element sibling => Element or null
    $ns: function() { return this.nextElementSibling; }, // one immidiately next Element sibling => Element or null

    //TODO rename to $psa/$nsa or completely drop (too complicated)
    $pss: function() { return this.parentElement.querySelectorAll(':scope > :not(:nth-child(' + this.$idx() + ') ~ *)'); }, // all siblings from parentElement.firstElementChild to this.previousElementSibling => NONlive HTMLCollection
    $nss: function() { return this.querySelectorAll(':scope ~ *'); }, // all siblings from this.nextElementSibling, to parentElement.lastElementChild => NONlive HTMLCollection
}; };

function _protoEventTarget(ctx) {
    return {
    // EventTarget shorthands
    //TODO
    $on: function(event, handler) { return this.addEventListener(event, handler, false), this; },
    $onc: function(event, handler) { return this.addEventListener(event, handler, true), this; },
    $off: function(event, handler) { return this.removeEventListener(event, handler, false), this; },
    $offc: function(event, handler) { return this.removeEventListener(event, handler, true), this; },
}; };

function $SAF(ctx) { // extend ctx with SAFDOM methods
    var extend = _extend(ctx),
        protoArr = _protoArr(ctx),
        document = ctx.document;

    extend(ctx.Node.prototype, _protoNode(ctx));
    extend(ctx.NodeList.prototype, protoArr);
    extend(ctx.HTMLCollection.prototype, protoArr);
    extend(ctx.Element.prototype, _protoElement(ctx));
    extend(ctx.EventTarget.prototype, _protoEventTarget(ctx));

    return extend(ctx, {
    // Globals
    $id: document.getElementById.bind(document),
    $f: document.querySelectorAll.bind(document), // Find all => NONlive HTMLCollection [Chrome 1+, FF 3.5+, IE 8+, Opera 10+, Safari 3.2+]
    $s: document.querySelector.bind(document), // 1st matched element => Element or null [Chrome 1+, FF 3.5+, IE 8+, Opera 10+, Safari 3.2+]
    $t: document.getElementsByTagName.bind(document), // by Tag name => LIVE HTMLCollection [Chrome 1+, IE 6+]
    $c: document.getElementsByClassName.bind(document), // by Class name => LIVE HTMLCollection [IE 9+]
    $mk: document.createElement.bind(document),
    $mkT: document.createTextNode.bind(document),
    //TODO $mk*
    });
};

if (exports) module.exports = $SAF;
else $SAF(module);

})

// detect context type: if this is require()'d module -- provide export and do nothing more,
// otherwise (in browser) just extend window;
// seems tricky, but its simpler than it looks like:
.apply(null, (typeof module !== 'undefined' && module) ? [module, true] : [window, false]);
