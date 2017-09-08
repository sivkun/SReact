import instantiateReactComponent from './instantiateReactComponent';
import shouldUpdateReactComponent from './shouldUpdateReactComponent';
import callbackQueue from './callbackQueue';
import * as utils from './utils';
let mountOrder = 0;
export default class ReactCompositeComponent {
  constructor(element) {
    this._currentElement = element;
    this._domId = null;
    this._instance = null;
    this._pendingCallbacks = null;
    this._pendingStateQueue = null;
    this._mountOrder = null; // 挂载顺序，用于更新
    this._hostPatent = null; // 保存该实例的父实例，用于更新元素。
  }
  mountComponent() {
    this._mountOrder = mountOrder++;
    let { type: Component, props: publicProps } = this._currentElement;
    let inst = new Component(); // 实例化自定义组件
    inst.props = publicProps; // 添加组件实例属性props
    this._instance = inst; // 保存自定义组件实例
    inst._reactInternalInstance = this; // 自定义组件实例保存内部对象实例
    if (inst.componentWillMount) {
      // 生命周期调用
      inst.componentWillMount();
    }
    inst.state = this._processPendingState(); // 处理state
    this._pendingStateQueue = null; // 重新计算state后置空
    const renderedElement = inst.render(); // 执行render函数
    this._renderedComponent = instantiateReactComponent(renderedElement); // 实例化子组件
    let markup = this._renderedComponent.mountComponent(); // 递归生成html
    if (inst.componentDidMount) {
      // 添加回调，挂载成功执行
      callbackQueue.listen(
        callbackQueue.type.reactMountReady,
        inst.componentDidMount,
        inst,
      );
    }
    return markup;
  }
  receiveComponent(nextElement) {
    const prevElement = this._currentElement;
    nextElement = nextElement || this._currentElement;
    this._currentElement = nextElement;
    let inst = this._instance;
    let willReceive = false;
    let nextProps = nextElement.props;
    if (nextElement !== prevElement) {
      willReceive = true;
    }
    if (willReceive && inst.componentWillReceiveProps) {
      inst.componentWillReceiveProps(nextProps);
    }
    let nextState = this._processPendingState(); // 处理state
    this._pendingStateQueue = null; // 重新计算state后置空
    this._pendingCallbacks = null;
    var shouldUpdate = true;
    if (inst.shouldComponentUpdate) {
      shouldUpdate = inst.shouldComponentUpdate(nextProps, nextState);
    }
    // 判断是否需要更新
    if (shouldUpdate) {
      inst.componentWillUpdate &&
        inst.componentWillUpdate(nextProps, nextState);
      let hasComponentDidUpdate = !!inst.componentDidUpdate;
      let prevProps, prevState;
      if (hasComponentDidUpdate) {
        prevProps = inst.props;
        prevState = inst.state;
      }
      inst.props = nextProps;
      inst.state = nextState;
      let prevRenderedComponent = this._renderedComponent;
      let nextRenderedELement = inst.render();
      let prevRenderedElement = prevRenderedComponent._currentElement;
      if (
        shouldUpdateReactComponent(prevRenderedElement, nextRenderedELement) // 判断是更新还是直接替换
      ) {
        prevRenderedComponent.receiveComponent(nextRenderedELement); // 交给子元素进行更新
      } else {
        // 直接生成新的元素进行替换
        let nextRenderedComponent = instantiateReactComponent(
          nextRenderedELement,
        );
        nextRenderedComponent.mountComponent(
          this._hostParent,
          this._hostContainerInfo,
        );
        // 得到新渲染生成DOM元素
        let nextDOM = nextRenderedComponent.getHostNode();
        // 获取老的DOM元素
        let dom = this.getHostNode();
        // 插入新的DOM元素
        dom.parentElement.inertBefore(nextDOM, dom.nextElementSibling);
        // 移除事件监听
        utils.removeEvent(dom);
        // 移除老的元素
        dom.parentElement.removeChild(dom);
        dom = null;
        // 更新_renderedComponent
        inst._renderedComponent = nextRenderedComponent;
      }
      if (hasComponentDidUpdate) {
        // 生命周期 回调
        callbackQueue.listen(
          callbackQueue.type.reactMountReady,
          inst.componentDidUpdate.bind(inst, prevProps, prevState),
          inst,
        );
      }
    } else {
      inst.state = nextState;
      inst.props = nextProps;
    }
  }
  _processPendingState() {
    let inst = this._instance;
    let queue = this._pendingStateQueue || [];
    let nextState = Object.assign({}, inst.state);
    queue.forEach(state => {
      Object.assign(nextState, state);
    });
    return nextState;
  }
  // 递归查找hostNode，即组件生成的DOM元素
  getHostNode() {
    let component = this._renderedComponent;
    return component ? component.getHostNode() : this.getHostNode();
  }
}
