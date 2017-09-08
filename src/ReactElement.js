var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};
function ReactElement(type, key, props) {
  const element = {
    type,
    key,
    props,
  };
  return element;
}

ReactElement.createElement = function(type, config, ...children) {
  const props = {};
  let key = null;
  let propName;
  if (config != null) {
    if (config.key !== undefined) {
      key = config.key;
    }
    for (propName in config) {
      if (
        config.hasOwnProperty(propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }
  props.children = props.children || [];
  props.children.push(...children);
  if (type && type.defaultProps) {
    let defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (defaultProps[propName] !== undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  return ReactElement(type, key, props);
};
export default ReactElement;
