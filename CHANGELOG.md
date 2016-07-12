# SAFDOM changelog

## 0.2.3 (2016-07-12)
* Considered unuseful in $meta and has been cut: sl*, st*, vw, vh, cw, ch, sw, sh. Use respective `scrollLeft`, `scrollHeight`, etc on `$meta.se()`.
* The scrollingElement accessor `$meta.se()` now caches it's return value. Use `$meta.seReread()` to flush it (I guess it's useful for weird setups only).

## 0.2.2 (2016-07-01)
* Included $rect and $rects, which are aliases for Element.getBoundingClientRect and Element.getClientRects, respectively.
* Included minimalistic getComputedStyle utility as Element.$cs
* New global: $meta, which I suppose to use for utility methods such as browser/window/context/viewport/document utils/stats detection/manipulation. Kinda messy.
* Methods for main viewport inspection in $meta (client/inner/scroll-related dimensions)
* $meta.se() to polyfill document.scrollingElement via https://github.com/mathiasbynens/document.scrollingElement
* So, the as noted in library description, it is still optimized for Chromium; I realize that wider browser support is needed, so in future some shims will be introduced.
* Therefore, SAFDOM API is about to change: at least, all globals most likely will be migrated into one global `$SAF` object and something like jQuery.noConflict provided to handle special cases.
* Also planned: utils/aliases (NOT POLYFILLS OR SHIMS) for custom Elements, HTML Templates, Shadow DOM and HTML Imports.

## 0.2.1 (2016-03-09)
* Included fallback for Element.contains, minimal Chrome version is now 24+
* Included fallback for Element.matches
* $mkF for document.createDocumentFragment
* Documentation fixes and compatibility table

## 0.2.0 (2016-03-05)
* Different behavior for various environments
* Documentation fixes

## 0.1.0 (2016-03-04)
* It was decided to use `forEach` instead of `$each` for NodeList and HTMLCollection
* It was decided to remove console.$time and console.$timeEnd
* Near full usage reference provided
* Introducing changelog

## 0.0.1 (2016-03-03)
* Initial revision
