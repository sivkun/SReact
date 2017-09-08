import callbackQueue from './callbackQueue';
let dirtyComponents = [];
let isBatchingUpdates = false;
let updateBatchNumber = 0;
function enqueueUpdate(component) {
  dirtyComponents.push(component);
  if (isBatchingUpdates) {
    // 如果在批处理中，则在下一批次更新组件。
    component._updateBatchNumber = updateBatchNumber + 1;
  } else {
    isBatchingUpdates = true; // 设置正在更新标记
    runBatchedUpdates(); // 更新
  }
}
// 按照组件挂载顺序更新
function mountOrderComparator(c1, c2) {
  return c1._mountOrder - c2._mountOrder;
}
function runBatchedUpdates() {
  let prevDirtyComponent = dirtyComponents.slice();
  dirtyComponents = [];
  prevDirtyComponent.sort(mountOrderComparator);
  updateBatchNumber++;
  for (let len = prevDirtyComponent.length, i = 0; i < len; i++) {
    let component = prevDirtyComponent[i];
    let callbacks = component._pendingCallbacks;
    component._pendingCallbacks = null;
    if (component._pendingStateQueue !== null) component.receiveComponent(null); // 更新组件
    if (callbacks) {
      callbacks.forEach(callback => {
        callbackQueue.listen(
          callbackQueue.type.reactUpdateReady,
          callback,
          component._instance, // 自定义组件实例
        );
      });
    }
  }

  callbackQueue.dispatch(callbackQueue.type.reactMountReady); // 触发声明周期函数
  if (dirtyComponents.length > 0) {
    // 在更新的过程中,会调用生命周期函数，如果生命周期函数中有setState调用，则继续更新
    runBatchedUpdates();
  } else {
    callbackQueue.dispatch(callbackQueue.type.reactUpdateReady);
    isBatchingUpdates = false; // 批量更新结束
  }
}
const ReactUpdates = {
  runBatchedUpdates,
  enqueueUpdate,
  setIsBatchingUpdates(f) {
    isBatchingUpdates = f;
  },
};
export default ReactUpdates;
