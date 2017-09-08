import ReactUpdates from './ReactUpdates';
export default class ReactComponent {
  constructor(props) {
    this.props = props;
  }
  setState(partialState, callback) {
    // this.state = Object.assign({}, this.state, partialState);
    const internalInstance = this._reactInternalInstance;
    internalInstance._pendingStateQueue =
      internalInstance._pendingStateQueue || [];
    internalInstance._pendingStateQueue.push(partialState);
    // console.log(this,_pendingStateQueue)
    // this._reactInternalInstance.receiveComponent(null, partialState);
    if (callback) {
      internalInstance._pendingCallbacks =
        internalInstance._pendingCallbacks || [];
      internalInstance._pendingCallbacks.push(callback);
    }
    ReactUpdates.enqueueUpdate(internalInstance);
  }
  render() {}
}
// ReactComponent._isReactComponent = {};
