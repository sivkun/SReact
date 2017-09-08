export function htmlToDOM(html) {
  let div = document.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
}
export function removeItem(arr, value) {
  let index = arr.indexOf(value);
  index !== -1 && arr.splice(index, 1);
}
const eventPub = '_EVENTPUB_';
export function addEvent(el, type, fn, capture = false) {
  el[eventPub] = el[eventPub] || {};
  el[eventPub][type] = el[eventPub][type] || [];
  fn._capture = capture;
  el[eventPub][type].push(fn);
  el.addEventListener(type, fn, capture);
}
export function removeEvent(el, type, fn) {
  el[eventPub] = el[eventPub] || {};
  if (fn) {
    el[eventPub][type] = el[eventPub][type] || [];
    el.removeEventListener(type, fn, fn._capture);
    removeItem(el[eventPub][type], fn);
  } else if (type) {
    el[eventPub][type] = el[eventPub][type] || [];
    el[eventPub][type].forEach(fn => {
      el.removeEventListener(type, fn._capture);
    });
    el[eventPub][type] = [];
  } else {
    for (type in el[eventPub]) {
      el[eventPub][type] = el[eventPub][type] || [];
      el[eventPub][type].forEach(fn => {
        el.removeEventListener(type, fn._capture);
      });
    }
    el[eventPub] = {};
  }
}
