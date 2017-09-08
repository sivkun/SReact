// 判断元素是否需要更新，否则直接替换实例
export default function shouldUpdateReactComponent(prevElement, nextElement) {
  let prevEmpty = prevElement === null || prevElement === false;
  let nextEmpty = nextElement === null || prevElement === false;
  if (prevEmpty || nextEmpty) {
    return prevEmpty === nextEmpty;
  }
  let prevType = typeof prevElement;
  let nextType = typeof nextElement;
  if (prevType === 'string' || prevType === 'number') {
    return nextType === 'string' || nextType === 'number';
  } else {
    return (
      nextType === 'object' &&
      prevElement.type === nextElement.type &&
      prevElement.key === nextElement.key
    );
  }
}
