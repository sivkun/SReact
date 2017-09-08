import ReactDOMTextComponent from './ReactDOMTextComponent';
import ReactDOMComponent from './ReactDOMComponent';
import ReactCompositeComponent from './ReactCompositeComponent';

export default function instantiateReactComponent(node) {
  // 文本节点
  if (typeof node === 'string' || typeof node === 'number') {
    return new ReactDOMTextComponent(node);
  }
  // 原生DOM元素
  if (typeof node.type === 'string') {
    return new ReactDOMComponent(node);
  }
  // 自定义组件
  if (typeof node === 'object' && typeof node.type === 'function') {
    return new ReactCompositeComponent(node);
  }
}
