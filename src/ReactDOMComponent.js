import instantiateReactComponent from './instantiateReactComponent';
import shouldUpdateReactComponent from './shouldUpdateReactComponent';
import * as utils from './utils';
let internalInstanceKey =
  '__reactInternalInstance$' +
  Math.random()
    .toString(36)
    .slice(2);

const RESERVED_PROPS = {
  children: true,
  style: true,
  className: true,
};
const eventPreg = /on([A-Z])([a-z]+)(Capture)?/;
function isEvent(propName) {
  return eventPreg.test(propName);
}
function putListener(that, events) {
  let el = that.getHostNode();
  let propName;
  for (propName in events) {
    let isCapture = false;
    let type = propName.replace(eventPreg, (m, $1, $2, $3) => {
      if ($3 === 'Capture') isCapture = true;
      return $1.toLocaleLowerCase() + $2;
    });
    utils.addEvent(el, type, events[propName], isCapture);
  }
}

function deleteListener(that, propName) {
  let el = that.getHostNode();
  let type = propName.replace(eventPreg, (m, $1, $2, $3) => {
    return $1.toLocaleLowerCase() + $2;
  });
  utils.removeEvent(el, type);
}
// style对象解析成style字符串
function parseStyle(style) {
  let result = '';
  let o = document.body.style;
  for (let key in style) {
    let prop = key.replace(/[A-Z]/g, m => {
      return '-' + m.toLocaleLowerCase();
    });
    if (o.hasOwnProperty(prop)) {
      result += `${prop}:${style[key]};`;
    }
  }
  return result;
}
// CSSPropertyOperations，为元素设置style
function setValueForStyles(el, styleUpdates) {
  let o = document.body.style;
  for (let key in styleUpdates) {
    let prop = key.replace(/[A-Z]/g, m => {
      return '-' + m.toLocaleLowerCase();
    });
    if (o.hasOwnProperty(prop)) {
      el.style[prop] = styleUpdates[key];
    }
  }
}
export default class ReactDOMComponent {
  constructor(element) {
    this._currentElement = element;
    // this._domID = null; // 为了标识元素，方便处理
    this._mountIndex = null; // 挂载顺序
  }
  mountComponent() {
    let tagOpen = `<${this._currentElement.type} `; // eslint-disable-line
    let tagClose = `</${this._currentElement.type}>`;
    // 处理元素属性
    const props = this._currentElement.props;
    let propName;
    let events = {};
    // let preg = /on([A-Z])([a-z]+)(Capture)?/;
    for (propName in props) {
      if (isEvent(propName)) {
        // 如果是事件，后续处理
        events[propName] = props[propName];
      } else if (props.hasOwnProperty(propName) && !RESERVED_PROPS[propName]) {
        // 常规属性处理
        tagOpen += `${propName}="${props[propName]}" `;
      }
    }
    // 添加内联样式
    if (props['style'] !== undefined) {
      tagOpen += `style="${parseStyle(props['style'])}" `;
    }
    // className处理
    if (props['className'] !== undefined) {
      tagOpen += `class="${props['className']}" `;
    }
    tagOpen += '>';
    let markup = tagOpen + tagClose;
    // html字符串转化为DOM对象
    let mountImage = utils.htmlToDOM(markup);
    // 设置hostNode,即对应的DOM元素
    this._hostNode = mountImage;
    this._hostNode[internalInstanceKey] = this;
    // 为DOM对象添加事件
    putListener(this, events);
    // 处理子元素
    let content = this._createInitialChildren();
    content.forEach(child => {
      child != null && mountImage.appendChild(child); // child可能为空，要进行判断，否则出错
    });
    // 返回DOM对象
    return mountImage;
  }
  // 返回孩子DOM节点
  _createInitialChildren() {
    let content = [];
    let children = this._currentElement.props.children;
    let childrenInstances = [];
    children.forEach((child, key) => {
      let childInstance = instantiateReactComponent(child);
      // 设置孩子挂载顺序,即 孩子节点在父节点中的第几个位置。
      childInstance._mountIndex = key;
      childrenInstances.push(childInstance);
      content.push(childInstance.mountComponent(this));
    });
    this._renderedChildren = flattenChildren(childrenInstances);
    return content;
  }
  receiveComponent(nextElement) {
    let lastProps = this._currentElement.props;
    let nextProps = nextElement.props;
    this._currentElement = nextElement;
    // 更新属性
    this._updateDOMProperties(lastProps, nextProps);
    // 更新子节点
    this._updateDOMChildren(nextProps.children);
  }
  /* eslint-disable */
  _updateDOMProperties(lastProps, nextProps) {
    let propKey;
    let styleName;
    let styleUpdates;
    // 老集合有，新集合没有的属性，要删除
    for (propKey in lastProps) {
      if (
        nextProps.hasOwnProperty(propKey) ||
        !lastProps.hasOwnProperty(propKey) ||
        lastProps[propKey] == null
      ) {
        continue;
      } else if (isEvent(propKey)) {
        deleteListener(this, propKey);
      } else if (propKey !== 'children') {
        if (propKey === 'className') {
          propKey = 'class';
        }
        this.getHostNode().removeAttribute(propKey);
      }
    }

    for (propKey in nextProps) {
      let lastProp =
        lastProps[propKey] != null ? lastProps[propKey] : undefined;
      let nextProp = nextProps[propKey];
      // 新集合有 或者 新集合与老集合都有但是不同的，进行新增或者修改处理
      if (
        !nextProps.hasOwnProperty(propKey) ||
        lastProp === nextProp ||
        (lastProp == null && nextProp == null)
      ) {
        continue;
      }
      if (propKey === 'style') {
        if (!lastProp) {
          // 新集合有style，老集合里面没有style
          let style = parseStyle(nextProp);
          this.getHostNode().style = style;
        } else {
          // 新 老 集合都有 style属性
          // styleName老style有，新style没有,去除相应的style
          for (styleName in lastProp) {
            if (
              lastProp.hasOwnProperty(styleName) &&
              (!nextProp || !nextProp.hasOwnProperty(styleName))
            ) {
              // this._hostNode.style[styleName]='';
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = '';
            }
          }
          // 新style集合里面有的属性,如果和老style集合里面的不同
          for (styleName in nextProp) {
            if (
              nextProp.hasOwnProperty(styleName) &&
              nextProp[styleName] !== lastProp[styleName]
            ) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = nextProp[styleName];
            }
          }
        }
      } else if (isEvent(propKey)) {
        // 处理事件
        if (nextProp !== lastProp) {
          // 监听函数不同
          deleteListener(this, propKey);
          putListener(this, { propKey: nextProp });
        }
      } else if (propKey !== 'children' && lastProp !== nextProp) {
        // 剩下的情况，只要属性不同就要替换
        this.getHostNode()[propKey] = nextProps;
      }
    }
    if (styleUpdates) {
      setValueForStyles(this.getHostNode(), styleUpdates);
    }
  }
  /* eslint-enable */
  // 可以理解为深度后序遍历更新  ，接下来要完成更新到DOM树上的操作
  _updateDOMChildren(nextChildrenElements) {
    let prevChildren = this._renderedChildren;
    let mountImages = []; // 新增加的节点
    let removedNodes = {}; // removedNodes中记录了需要移除的节点信息
    nextChildrenElements = flattenChildren(nextChildrenElements, false);
    let nextChildren = reconcilerUpdateChildren(
      prevChildren,
      nextChildrenElements,
      mountImages,
      removedNodes,
    );
    if (!nextChildren && !prevChildren) {
      return;
    }
    let updates = [];
    let name;
    // `nextIndex` will increment for each child in `nextChildren`, but
    // `lastIndex` will be the last index visited in `prevChildren`.
    // `nextIndex` 随着遍历`nextChildren`递增，代表`child`要挂载到父DOM节点中的位置，可以理解为`ReactDOMCompoent`中的`_mountIndex`
    // `lastIndex` 总是指向访问prevChildren访问过的最后一个位置。顺序优化原则。
    let lastIndex = 0;
    let nextIndex = 0;
    // `nextMountIndex` will increment for each newly mounted child.
    var nextMountIndex = 0; // 准确匹配新加节点，在mountImages的索引。
    var lastPlacedNode = null; // 记录上一次操作的DOM节点
    for (name in nextChildren) {
      if (!nextChildren.hasOwnProperty(name)) {
        continue;
      }
      let prevChild = prevChildren && prevChildren[name];
      let nextChild = nextChildren[name];
      if (prevChild === nextChild) {
        // 此处是否需要移动节点，根据lastIndex，和prevChild._mountIndex判断，
        // lastIndex > prevChild._mountIndex,需要移动节点，否则不需要
        if (lastIndex > prevChild._mountIndex) {
          updates.push(makeMove(prevChild, lastPlacedNode, nextIndex));
        }
        // 这里的_mountIndex，表示子节点在父节点中挂载顺序。
        lastIndex = Math.max(prevChild._mountIndex, lastIndex);
        prevChild._mountIndex = nextIndex; // 更新挂载顺序
      } else {
        if (prevChild) {
          lastIndex = Math.max(lastIndex, prevChild._mountIndex); // 只更新lastIndex索引
          // 新老child key值相同，但是不属于相同的元素类别，老节需要移除，这里暂时不做处理，在处理removedNodes时真正移除
        }
        // 添加新的节点
        // mountImages[nextMountIndex];
        nextChild._mountIndex = nextIndex; // 设置nextChild的挂载到父节点的顺序。
        updates.push(
          makeInsertMarkup(
            mountImages[nextMountIndex],
            lastPlacedNode,
            nextIndex,
          ),
        );
        nextMountIndex++;
        // 之所以，只需要 ++ 就可以知道新增加节点的mountImage，是因为这里是遍历的nextChildren，
        // 和之前reconcilerUpdateChildren更新子节点时,遍历的nextChildrenElements,顺序是一致的。
      }
      nextIndex++;
      lastPlacedNode = nextChild.getHostNode(); // 记录上一次操作的DOM节点
    }
    // 移除不再展示的孩子节点
    for (name in removedNodes) {
      if (removedNodes.hasOwnProperty(name)) {
        // updates = enqueue(
        //   updates,
        //   this._unmountChild(prevChildren[name], removedNodes[name]),
        // );
        prevChildren[name]._mountIndex = null;
        updates.push(makeRemove(prevChildren[name], removedNodes[name]));
      }
    }
    if (updates.length > 0) {
      processQueue(this, updates); // 执行更新，要理解，所有的孩子节点已经更新过了。可以理解为深度后序遍历更新。
    }
    this._renderedChildren = nextChildren;
  }
  getHostNode() {
    // this._hostNode = document.querySelector(`[data-reactid="${this._domID}"]`);
    return this._hostNode;
  }
}
// 扁平化Children数组，形成以key为键，child为值的对象、
function flattenChildren(componentOrELement, isComponent = true) {
  let child;
  let name;
  let i;
  let childrenMap = {};

  for (i = 0; i < componentOrELement.length; i++) {
    child = componentOrELement[i];
    name = isComponent
      ? child && child._currentElement && child._currentElement.key
        ? child._currentElement.key
        : i.toString(36)
      : child && child.key ? child.key : i.toString(36);
    childrenMap[name] = child;
  }
  return childrenMap;
}

function reconcilerUpdateChildren(
  prevChildren,
  nextChildrenElements,
  mountImages,
  removedNodes,
) {
  let nextChildren = {};
  let name;
  let prevChild;
  // 遍历新节点集合
  for (name in nextChildrenElements) {
    let nextElement = nextChildrenElements[name];
    prevChild = prevChildren[name] || null;
    // 这里使用了null，是因为如果prevElement为undefined，shouldUpdateReactComponent判断会出错。
    let prevElement = prevChild && prevChild._currentElement;
    // 判断是否需要更新
    if (shouldUpdateReactComponent(prevElement, nextElement)) {
      prevChild.receiveComponent(nextElement);
      nextChildren[name] = prevChild;
    } else {
      // 不需要更新，要直接卸载然后挂载新的
      if (prevChild) {
        removedNodes[name] = prevChild.getHostNode(); // 记录要卸载的节点，后续操作会卸载
        // prevChild.unmountComponent();
      } else {
        let nextChild = instantiateReactComponent(nextElement);
        nextChildren[name] = nextChild;
        let mountImage = nextChild.mountComponent();
        mountImages.push(mountImage); // 保存新增加的节点，后续添加到DOM树中
      }
    }
  }
  // 老节点集合中有，新节点集合中没有，需要卸载。
  for (name in prevChildren) {
    if (
      prevChildren.hasOwnProperty(name) &&
      nextChildrenElements &&
      !nextChildrenElements.hasOwnProperty(name)
    ) {
      prevChild = prevChildren[name];
      removedNodes[name] = prevChild.getHostNode(); // 记录要卸载的节点，后续操作会卸载
      // prevChild.unmountComponent();
    }
  }
  return nextChildren;
}

/**
 * Make an update for markup to be rendered and inserted at a supplied index.
 *
 * @param {string} markup Markup that renders into an element.
 * @param {number} toIndex Destination index.
 * @private
 */
function makeInsertMarkup(markup, afterNode, toIndex) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'INSERT_MARKUP',
    content: markup,
    fromIndex: null,
    fromNode: null,
    toIndex: toIndex,
    afterNode: afterNode,
  };
}

/**
 * Make an update for moving an existing element to another index.
 *
 * @param {number} fromIndex Source index of the existing element.
 * @param {number} toIndex Destination index of the element.
 * @private
 */
function makeMove(child, afterNode, toIndex) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'MOVE_EXISTING',
    content: null,
    fromIndex: child._mountIndex,
    fromNode: child.getHostNode(),
    toIndex: toIndex,
    afterNode: afterNode, // 表示child在哪个节点后面
  };
}

/**
 * Make an update for removing an element at an index.
 *
 * @param {number} fromIndex Index of the element to remove.
 * @private
 */
function makeRemove(child, node) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'REMOVE_NODE',
    content: null,
    fromIndex: child._mountIndex,
    fromNode: node,
    toIndex: null,
    afterNode: null,
  };
}
function getNodeAfter(parentNode, node) {
  // Special case for text components, which return [open, close] comments
  // from getHostNode.
  if (Array.isArray(node)) {
    node = node[1];
  }
  return node ? node.nextSibling : parentNode.firstChild;
}
function processQueue(parentInst, updates) {
  let parentNode = parentInst.getHostNode();
  updates.forEach(update => {
    switch (update.type) {
      case 'INSERT_MARKUP':
        parentNode.insertBefore(
          update.content,
          getNodeAfter(parentNode, update.afterNode),
        );
        break;
      case 'MOVE_EXISTING':
        parentNode.insertBefore(
          update.fromNode,
          getNodeAfter(parentNode, update.afterNode),
        );
        break;
      case 'REMOVE_NODE':
        parentNode.removeChild(update.fromNode);
        break;
      default:
        break;
    }
  });
}
