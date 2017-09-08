import * as utils from './utils';
export default class ReactDOMTextComponent {
  constructor(text) {
    this._currentElement = '' + text;
  }
  mountComponent() {
    let markup = `${this._currentElement}`; // 一开始为了好控制，这里我用span把内容包裹了起来，现在把span标签去掉了。
    let mountImage = utils.htmlToDOM(markup);
    this._hostNode = mountImage;
    return mountImage;
  }
  receiveComponent(nextText) {
    nextText += '';
    if (nextText !== this._currentElement) {
      this._currentElement = nextText;
      let node = document.createTextNode(nextText);
      this._hostNode.parentNode.replaceChild(node, this._hostNode); // 更新时将老的替换掉
      this._hostNode = node; // 要重新赋值。
    }
  }
  getHostNode() {
    return this._hostNode;
  }
}
