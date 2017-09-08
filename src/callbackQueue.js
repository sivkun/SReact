// 使用观察者模式模拟，任务回调。像componentDidMount回调,setState的回调
const listeners = {};
const contexts = {};
// type
// reactMountReady : componentDidMount/componentDidUpdate
// reactUpdateReady  setState回调， dirtyComponents数组处理完成后调用
// function transformListenerByType(type) {
//   listeners[type] = [listeners[type]];
//   contexts[type] = [contexts[type]];
// }

function listen(type, fn, context) {
  listeners[type] = listeners[type] || [];
  contexts[type] = contexts[type] || [];
  // let index = listeners[type].indexOf(fn);
  // if (!~index) {
  listeners[type].push(fn);
  contexts[type].push(context);
  // }
  // return () => {
  //   index = listeners[type].indexOf(fn);
  //   if (index > -1) {
  //     listeners[type].splice(index, 1);
  //     contexts[type].splice(index, 1);
  //   }
  // };
}
function dispatch(type, data) {
  // console.log(type,listeners[type])

  let event = {
    type,
    data,
  };
  listeners[type] = listeners[type] || [];
  contexts[type] = contexts[type] || [];
  let prevListeners = listeners[type].slice();
  let prevContexts = contexts[type].slice();
  listeners[type] = [];
  contexts[type] = [];
  // console.log(fns);
  // if (fns[0] instanceof Array) {
  //   let i = fns.length;
  //   while (--i) {
  //     fns[i].forEach((fn, k) => {
  //       fn.call(prevContexts[i][k], event);
  //     });
  //   }
  // } else {
  prevListeners.forEach((fn, i) => {
    fn.call(prevContexts[i] || null, event);
  });
  // }
}
export default {
  type: {
    reactMountReady: 'reactMountReady',
    reactUpdateReady: 'reactUpdateReady',
  },
  listen,
  dispatch,
  // transformListenerByType,
};
