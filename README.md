# cydux

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)


## Motivation

I wanted a React.js app architecture that would be faster to refactor, so I
created Cydux to keep views and event handlers cleanly separated from each
other. Conceptually:

- Create a view that listens for changes to stateful data
- Create event listeners for the view that update the stateful data

The views (React components) listen for store updates similarly to ReactRedux.
However, instead of adding an event listener and handler directly on components,
Cydux creates a global event stream and lets you name important components so
that you can filter the global event stream to update the store or perform some
side effect.

As a result, React components can exclusively focus on converting stateful data
into views without any event-related code, and the global event stream can be
passed around completely independently of the views, so you can filter, tap,
map, and observe it in any way that fits your needs.

The stateful store portion is similar to Redux except without actions or action
objects, since the browser automatically creates event objects anyway, plus
Cydux labels each object to match component names.


## Usage

[![NPM](https://nodei.co/npm/cydux.png)](https://www.npmjs.com/package/cydux)


## API

```js
// Cydux API
export {
  createAnode,
  createConnect,
  createEventStream,
  createStore,
  createTagCheck,
  getNodeMap,
  getState,
};
```


### createAnode

####`createAnode(mixins) -> Anode`

Where `Anode` is a React class that can be used as follows:

```js
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';

// Mixins are optional
const Anode = createAnode([PureRenderMixin]);

const MyReactComponent = React.createClass({
  render: function() {
    return (
      <Anode alias="my-react-component">
        [Heavenly HTML here...]
      </Anode>
    );
  }
});
```

By default, `<Anode>` will produce a `<div>` that renders any children you pass.
`<Anode>` accepts:

- `alias` - the conceptual "name" of the component
- `aid` - an "id" field to uniquely identify a particular component in a list of
components with equal alias, for example
- `tag` - to mark sub-components of aliased components (such as buttons)
- `tagName` - the HTML tagName for the `<Anode>` component - defaults to `<div>`

Any other properties are passed through to the React element rendered by Anode.


### createEventStream

####`createEventStream({[eventHandler], [customEvents]}) -> {eventStream, emitter}`

```js
/** @module setup/eventStream */
import { createEventStream } from 'cydux';

const { eventStream, emitter } = createEventStream();

export {
  eventStream,
  emitter
};
```

If you pass an array of custom events to `createEventStream`, `emitter` can be
used to imperatively emit custom events into the global event stream. If you
don't pass any custom events to `createEventStream`, emitter will do nothing.


### createStore

####`createStore(initialState, emit) -> { update }`

`emit` will be called with the new state after each call to `update`. This can
be used to create a new state stream as shown below:

```js
/** @module setup/stateStream */
import { createStore } from 'cydux';
import { fromJS } from 'immutable';
import most from 'most';

const stateStream = most.create((add) => {
  const INITIAL_STATE = fromJS({
    text: 'hello'
  });
  const { update } = createStore(INITIAL_STATE, add);

  // Example of `update` usage:
  update((state) => {
    return state.update('text', prevTextState => {
      return prevTextState + ' world';
    });
  });
});

export {
  stateStream,
};
```

`update` should always be called with a function that takes the current state
and returns a new state object. Attempts to call `update` inside of an `update`
call will be ignored with a warning.


### createTagCheck

####`createTagCheck(alias) -> function checkIsTagged`
####`checkIsTagged(tag) -> boolean`

Creates a helper function that can be used to filter the event stream to find
tagged descendant elements of aliased elements.

```js
/** @module event-handlers/messages */

import { createTagCheck } from 'cydux';
import { eventStream } from '../setup/eventStream';
import { sendMessage } from '../magical-side-effects';

const checkIsTagged = createTagCheck('message-alias');

eventStream
  .filter(checkIsTagged('send-message-button'))
  .filter(({type}) => type === 'click')
  .forEach(sendMessage);
```


### createConnect

####`createConnect(stateStream, getState) -> function connect`
####`connect(ComponentToConnect, ...stateKeys) -> ConnectedComponent`

```js
/** @module setup/connect */
import { createConnect, getState } from 'cydux';
import { stateStream } from './stateStream';

export default const connect = createConnect(stateStream, getState);
```

```js
import React from 'react';
import connect from '../setup/connect'

const MyStatefulComponent = React.createClass({
  render: function() {
    return (
      <Anode alias="my-stateful-component">
        {this.props.text}
      </Anode>
    );
  }
});

export default connect(MyStatefulComponent, 'text');
```


## License

MIT, see [LICENSE.md](http://github.com/tomef/cydux/blob/master/LICENSE.md) for details.
