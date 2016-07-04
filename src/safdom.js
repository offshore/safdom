/*! SAFDOM | (c) Alex Offshore | aopdg.com */
;(function(module, exports) {

/**
* PRIMARY TARGET IS LATEST CHROMIUM (Chrome 45+), shorthands and calls optimized for use with it
* all other browsers compatibility notes are JUST FOR REFERENCE, and not for all features,
* although latest versions of FF, Opera, Safari and even IE (Edge) can handle most things fine.
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

// `Object.assign` is not supported by IE w/o polyfill (but Edge has it), others: [Chrome 45+, FF 34+, Opera 32+, Safari 9+]
// however, the following IS NOT A POLYFILL, just a shorthand
function _extendX(o) {
    for (var k, ai = 1; a = arguments[ai]; ++ai) for (k in a) if (a.hasOwnProperty(k)) o[k] = a[k];
    return o;
};
function _extend(ctx) { return ctx.Object.assign || _extendX; };

// internal utility methods:
function _util_compatMode(ctx) {
    return (ctx.document.compatMode || '') === 'CSS1Compat';
};
// scrollElement shim via https://github.com/mathiasbynens/document.scrollingElement, partially rewritten
// see also: http://www.quirksmode.org/mobile/tableViewport.html
function _util_mkScrollingElementGetter(ctx) {
    var document = ctx.document;
    if ('scrollingElement' in document) return function() { return document.scrollingElement; }; // woohoo, simple case
    // Well, we need a runtime detector for that. So frustrating.
    var isBodyElement = ctx.HTMLBodyElement
        ? function(elt) { return elt instanceof HTMLBodyElement; }
        : function(elt) { return elt.tagName.toLocaleLowerCase() == 'body'; }; // `tagName` is uppercase in HTML, but may be any-case in XML
    var locateBodyElement = function(frameset) {
        // We use this function to be correct per spec in case `document.body` is
        // a `frameset` but there exists a later `body`. Since `document.body` is
        // a `frameset`, we know the root is an `html`, and there was no `body`
        // before the `frameset`, so we just need to look at siblings after the
        // `frameset`.
        var current = frameset;
        do {
            if (current.nodeType == 1 && isBodyElement(current)) return current;
        } while (current = current.nextSibling);
        return null; // nothing found
    };
    var isScrollingElementCompliant = function() {
        // In quirks mode, the result is equivalent to the non-compliant standards mode behavior.
        if (!_util_compatMode(ctx)) return false;
        var iframe = document.createElement('iframe');
        iframe.style.height = '1px';
        (document.body || document.documentElement || document).appendChild(iframe);
        var iframeDoc = iframe.contentWindow.document;
        iframeDoc.write('<!DOCTYPE html><div style="height:9999em">x</div>');
        iframeDoc.close();
        var result = iframeDoc.documentElement.scrollHeight > iframeDoc.body.scrollHeight;
        iframe.parentNode.removeChild(iframe);
        isScrollingElementCompliant = function() { return _util_compatMode(ctx) && result; }; // further calls faster
        return result;
    };
    var isScrollable = function(body) {
        // a `body` element is scrollable if `body` and `html` both have non-`visible` overflow and are both being rendered
        // about check that element is rendered:
        // I've cut the visibility == 'collapse' test for table-*, it can be things-breaking for some setups
        // or maybe do I check offsetHeight and offsetParent values instead messing with styles?
        //TODO investigate that
        var bodyStyle = elt.$cs(),
            htmlStyle = document.documentElement.$cs();
        return bodyStyle.overflow != 'visible' && bodyStyle.display != 'none' && bodyStyle.visibility == 'visible'
            && htmlStyle.overflow != 'visible' && htmlStyle.display != 'none' && htmlStyle.visibility == 'visible';
    };
    return function() {
        if (isScrollingElementCompliant()) return document.documentElement; // better than it can be
        // Need duck typing body element and check other heavy shit. Every fucking time. R.I.P. performance.
        // you should note that document.body could be not only a HTMLBodyElement,
        // but at least HTMLFrameSetElement or null (e.g. if not yet initialized)
        var body = document.body && locateBodyElement(document.body);
        // If `body` is itself scrollable, it is not the `scrollingElement`.
        return body && isScrollable(body) ? null : body;
    };
};

// prototype extensions:
function _protoNode(ctx) {
    var Node = ctx.Node,
        DPP = Node.DOCUMENT_POSITION_PRECEDING,
        DPF = Node.DOCUMENT_POSITION_FOLLOWING;

    return {
    // node position comparison stuff
    $has: Node.prototype.contains, // THIS is one of parents of ELT => bool [FF 9+, IE 5+, Safari 3+], https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
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

    var matches = protoElement.matches || // is matching selector => bool [Chrome 34+, FF 34+, IE ?, Opera 21+, Safari 7.1+], https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
        protoElement.webkitMatchesSelector || // [Chrome All, Opera 15+]
        protoElement.mozMatchesSelector || // [FF 3.6+]
        protoElement.msMatchesSelector || // [IE 9.0+]
        protoElement.oMatchesSelector || // [Opera 11.5+]
        protoElement.matchesSelector; // general fallback, if available
    var closest = protoElement.closest || // closest ancestor of THIS (or THIS itself) which matches selector => Element or null; native: [Chrome 41+, Firefox 35+], https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
        function(selector) { // polyfill depends on .$is / Element.matches
            var cur = this;
            do {
                if (cur.$is(selector)) return cur;
            } while (cur = cur.parentElement);
            return null;
        };

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

    // class [Chrome 24+, IE10+, FF 24+: Lower versions have no support the second parameter for .toggle() and multiple params for .add / .remove, or completely does not support .classList]
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
    $is: matches,
    $closest: closest,

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

    // utility
    // alias for getComputedStyle with the minimal "shim" SUDDENLY for IE < 9
    $cs: ctx.getComputedStyle
        ? function(pseudoElt) { return ctx.getComputedStyle(this, pseudoElt || null); }
        : function(pseudoElt) { return this.currentStyle; },

    // aliases for getBoundingClientRect/getClientRects
    // take a look at https://msdn.microsoft.com/en-us/library/hh781509.aspx
    $rect: protoElement.getBoundingClientRect,
    $rects: protoElement.getClientRects,
}; };

function _protoEventTarget(ctx) {
    return {
    // those are shorthands for objects that implement EventTarget interface
    // however, EventTarget.prototype itself may not be available, see $SAF()
    //TODO
    $on: function(event, handler) { return this.addEventListener(event, handler, false), this; },
    $onc: function(event, handler) { return this.addEventListener(event, handler, true), this; },
    $off: function(event, handler) { return this.removeEventListener(event, handler, false), this; },
    $offc: function(event, handler) { return this.removeEventListener(event, handler, true), this; },
}; };

// browser/window/context/viewport/document utils/stats
function _meta(ctx) {
    var extend = _extend(ctx),
        getSE = _util_mkScrollingElementGetter(ctx);
        meta = {
            se: getSE,
            slG: function() { return getSE().scrollLeft; }, // scrollLeft
            slS: function(scrollLeft) { return (getSE().scrollLeft = scrollLeft), meta; },
            stG: function() { return getSE().scrollTop; }, // scrollTop
            stS: function(scrollTop) { return (getSE().scrollTop = scrollTop), meta; },
            vw: function() { return ctx.innerWidth; }, // viewport width (disregarding vertical scrollbar)
            vh: function() { return ctx.innerHeight; }, // viewport height (disregarding horisontal scrollbar)
            cw: function() { return getSE().clientWidth; }, // client width (vw - vertical scrollbar width, if present)
            ch: function() { return getSE().clientHeight; }, // client height (vh - horisontal scrollbar width, if present)
            sw: function() { return getSE().scrollWidth; }, // scroll width
            sh: function() { return getSE().scrollHeight; }, // scroll height
        };

    // pageXYoffset to use with $rect(s)
    // see https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
    if ('pageXOffset' in ctx) extend(meta, {
        px: function() { return ctx.pageXOffset; },
        py: function() { return ctx.pageYOffset; },
    });
    else extend(meta, {
        px: function() { return getSE().scrollLeft; },
        py: function() { return getSE().scrollTop; },
    });

    return meta;
};

function $SAF(ctx) { // extend ctx with SAFDOM methods
    var extend = _extend(ctx),
        protoArr = _protoArr(ctx),
        document = ctx.document;

    extend(ctx.Node.prototype, _protoNode(ctx));
    extend(ctx.NodeList.prototype, protoArr);
    extend(ctx.HTMLCollection.prototype, protoArr);
    extend(ctx.Element.prototype, _protoElement(ctx));

    // wtf, ie? https://developer.mozilla.org/en-US/docs/Web/API/Event/target
    // so, EventTarget.prototype itself may not be available, therefore we need to extend individual things
    var protoET = _protoEventTarget(ctx);
    if (ctx.EventTarget) {
        extend(ctx.EventTarget.prototype, protoET);
    }
    else {
        // touch main things, leave others like XMLHttpRequest unmodified
        extend(ctx.self, protoET);
        extend(ctx.document, protoET);
        extend(ctx.Node.prototype, protoET);
    }

    return extend(ctx, {
    // Globals
    $id: document.getElementById.bind(document),
    $f: document.querySelectorAll.bind(document), // Find all => NONlive HTMLCollection [Chrome 1+, FF 3.5+, IE 8+, Opera 10+, Safari 3.2+]
    $s: document.querySelector.bind(document), // 1st matched element => Element or null [Chrome 1+, FF 3.5+, IE 8+, Opera 10+, Safari 3.2+]
    $t: document.getElementsByTagName.bind(document), // by Tag name => LIVE HTMLCollection [Chrome 1+, IE 6+]
    $c: document.getElementsByClassName.bind(document), // by Class name => LIVE HTMLCollection [IE 9+]
    $mk: document.createElement.bind(document),
    $mkT: document.createTextNode.bind(document),
    $mkF: document.createDocumentFragment.bind(document),
    //TODO $mk*, $mkEvent
    $meta: _meta(ctx),
    });
};

if (exports) module.exports = $SAF;
else $SAF(module);

})

// detect context type: if this is require()'d module -- provide export and do nothing more,
// otherwise (in browser) just extend window;
// seems tricky, but its simpler than it looks like:
.apply(null, (typeof module !== 'undefined' && module) ? [module, true] : [window, false]);
