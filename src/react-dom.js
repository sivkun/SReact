import instantiateReactComponent from './instantiateReactComponent';
import callbackQueue from './callbackQueue';
import ReactUpdates from './ReactUpdates';
// function getContainerInfo() {
//   const hostContainerInfo = {
//     _idCounter: 1,
//     // 这里集中放置一些参数，主要是为了后续方便处理，不用传递那么多参数
//     callbackQueue,
//     isBatchingUpdates: false, // 判断是否在批量更新中
//   };
//   return hostContainerInfo;
// }
const ReactDOM = {
  render(element, container) {
    const componentInstance = instantiateReactComponent(element);
    // const hostContainerInfo = getContainerInfo();
    // hostContainerInfo._node = container;
    // hostContainerInfo.isBatchingUpdates = true; // 批量处理开始
    ReactUpdates.setIsBatchingUpdates(true);
    const markup = componentInstance.mountComponent();
    container.appendChild(markup);
    // 触发任务队列里的回调
    callbackQueue.dispatch(callbackQueue.type.reactMountReady);
    // 在componentWillMount，setState更新操作，state在执行render之前已经合并，但是setState的callback并没有执行。
    // 因此需要再次执行runBatchedUpdates
    ReactUpdates.runBatchedUpdates();
  },
};
export default ReactDOM;
