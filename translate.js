/*
MIT License

Copyright (c) 2017 Christian Kaindl

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/*
https://github.com/christiankaindl/trello-super-powers/blob/master/translate.js
*/
// Chrome/ Firefox detection
// const isChrome = typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype;
/**
* Translate an HTML page with the i18n API
*
* @param {string} property Name of the HTML attribute used for localization
*/
function translate(property = 'data-translate') {
  let translateables = document.querySelectorAll(`[${property}]`);

  for (let i = 0; i < translateables.length; i++) {
    let string = translateables[i].getAttribute(property);
    if (isChrome) { translateables[i].textContent = chrome.i18n.getMessage(string); }
    else { translateables[i].textContent = browser.i18n.getMessage(string); }
  }
}
