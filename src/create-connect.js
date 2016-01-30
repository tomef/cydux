import most from 'most';
import React from 'react';
const { Component } = React;

/**
 * Creates a higher order component that connects a React component to the
 * stream of updates from the global store
 *
 * @param {stream} stateStream the global state store update stream
 * @param {function} getState gets the current state of the global store
 * @return {function} that connects ComposedComponent to the store
 */
export default function createConnect(stateStream, getState) {
  // inspired by https://gist.github.com/nissoh/e835e940288b990d6160

  /**
   * Creates a higher order component that connects ComposedComponent to
   * select portions of the global state
   *
   * @param {object} ComposedComponent the React component to connect
   * @param {function|string[]} providedKeys to use to filter the global state
   * If the first item in providedKeys is a function:
   * - the function will receive (nextGlobalState, this.props) as arguments
   * - the function should return an object with keys equal to the props
   * eg:
   *
   *   export default connect(App, (state, props) => {
   *     return {
   *       isMobile: state.getIn(['mediaQuery', 'isMobile']),
   *       client: state.get('client'),
   *     };
   *   });
   *
   * For Immutable.js state objects only:
   * If a string or multiple strings are passed as providedKeys:
   * - each string will be converted to an array with the string inside
   * For arrays in providedKeys (including arrays converted from strings):
   * - each array will be used to look up a part of the global state via getIn
   * - the value from getIn will use the last string from its keypath array as
   *   the key for the local state
   * eg (equivalent to the above):
   *
   *   export default connect(App, ['mediaQuery', 'isMobile'], ['client']);
   *
   * NB: Don't pass a mix of function and string/array arguments in one
   *   'connect' call; it isn't that flexible.
   * @return {object} the higher order component (renders ComposedComponent)
   */
  return function connect(ComposedComponent, ...providedKeys) {
    class ConnectedComponent extends Component {
      constructor(props) {
        super(props);

        if (providedKeys[0].constructor === Array
          || typeof providedKeys[0] === 'string') {
          this.stateFilter = providedKeys.map(key => {
            return typeof key === 'string' ? [key] : key;
          });
          this.stateFilterFn = this.stateFilterArray;
        } else if (typeof providedKeys[0] === 'function') {
          this.stateFilter = providedKeys[0];
          this.stateFilterFn = this.stateFilterFunction;
        } else {
          console.error("'connect' requires a function to select a portion of "
                       +"the global state (a string or array of strings also "
                       +"works for apps using Immutable.js). Instead received "
                       + providedKeys[0]);
        }

        this.state = {};
        this.state = this.stateFilterFn(getState()) || {};

        this.stateCycle = most.create(add => {
          this.stateCycleEnd = add;
        });

        this.observe(stateStream);
      }

      componentWillUnmount() {
        if (this.stateCycleEnd) {
          this.stateCycleEnd();
        }
      }

      render() {
        return <ComposedComponent {...this.props} {...this.state} />;
      }

      stateFilterArray(nextGlobalState) {
        let nextState = {};
        let hasChanged = false;
        this.stateFilter.forEach((arr) => {
          const key = arr[arr.length - 1];
          nextState[key] = nextGlobalState.getIn(arr);
          if (hasChanged || nextState[key] !== this.state[key]) {
            hasChanged = true;
          }
        });
        return hasChanged ? nextState : false;
      }

      stateFilterFunction(nextGlobalState) {
        const nextState = this.stateFilter(nextGlobalState, this.props);
        const thisStateKeys = Object.keys(this.state);
        const nextStateKeys = Object.keys(nextState);
        const sameState = thisStateKeys.length === nextStateKeys.length
          && nextStateKeys.every(key => this.state.hasOwnProperty(key)
                                 && this.state[key] === nextState[key]);
        return !sameState ? nextState : false;
      }

      observe(stream) {
        most.merge(this.stateCycle, stream)
          // Lazy stream means this will only take when there's something to
          // take from the stateCycle stream, and nothing is added to the
          // stateCycle stream until componentWillUnmount
          .until(this.stateCycle.take(1))
          // But until then, we can observe the update stream :)
          .observe((nextGlobalState) => {
            const nextState = this.stateFilterFn(nextGlobalState);
            if (nextState !== false) {
              this.setState(nextState);
            }
          });
      }
    }

    return ConnectedComponent;
  }
}
