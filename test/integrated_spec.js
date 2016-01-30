import { expect } from 'chai';
import createAnode from '../src/create-anode';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  renderIntoDocument,
  isCompositeComponent,
  scryRenderedDOMComponentsWithTag,
  findRenderedDOMComponentWithTag,
  findAllInRenderedTree,
  Simulate,
} from 'react-addons-test-utils';
import createEventStream from '../src/events.js';
import { createStore, getState } from '../src/store.js';
import most from 'most';
import Immutable from 'immutable';
const { Map, fromJS } = Immutable;
import createTagCheck from '../src/create-tag-check.js';
import createConnect from '../src/create-connect.js';


describe('cydux', () => {

  it('listens for events on rendered elements', (done) => {
    const Anode = createAnode();
    ReactDOM.render(<Anode />, document.getElementById('app'));
    const { eventStream, emitter } = createEventStream({
      handleEvent: (ev, add) => add(ev),
      customEvents: [],
    });
    eventStream
      .take(1)
      .forEach(ev => {
        expect(ev.target).to.equal(document.querySelector('div'));
        done();
      });
    document.querySelector('div').click();
  });


  it('by default listens for events on aliased elements', (done) => {
    const Anode = createAnode();
    ReactDOM.render(
      <Anode alias="my-alias">
        <span className="wat">What are you doing</span>
      </Anode>, document.getElementById('app'));
    expect(document.querySelector('span').innerHTML).to.equal('What are you doing')
    const { eventStream, emitter } = createEventStream({
      // Using default event handler
      customEvents: [],
    });
    eventStream
      .take(1)
      .forEach(ev => {
        expect(ev.target).to.equal(document.querySelector('div'));
        done();
      });
    document.querySelector('div').click();
  });


  it('matches parent alias to events from descendant elements', (done) => {
    const Anode = createAnode();
    ReactDOM.render(
      <Anode alias="my-alias">
        <div>
          <Anode
            className="wat"
            tagName="p"
            >
            What are you doing
          </Anode>
        </div>
      </Anode>, document.getElementById('app'));
    const { eventStream, emitter } = createEventStream({
      customEvents: [],
    });
    eventStream
      .take(1)
      .forEach(ev => {
        expect(ev.target).to.equal(document.querySelector('p'));
        done();
      });
    document.querySelector('p').click();
  });


  it('captures events on tagged children separately', (done) => {
    const TOP_ALIAS = 'my-top-alias';
    const checkIsTagged = createTagCheck(TOP_ALIAS);
    const Anode = createAnode();
    ReactDOM.render(
      <Anode alias={TOP_ALIAS}>
        <Anode
          tag="child-anode1"
          className="button1"
          >
          Click me
        </Anode>
        <div>
          <Anode
            tag="child-anode2"
            className="button2"
            >
            No click me
          </Anode>
        </div>
      </Anode>, document.getElementById('app'));
    const { eventStream, emitter } = createEventStream({
      // Using default event handler
      customEvents: [],
    });
    const topAliasStream = eventStream
      .filter(({cydux}) => cydux.alias === TOP_ALIAS)
      .multicast();

    let done1 = false;
    let done2 = false;

    topAliasStream
      .filter(checkIsTagged('child-anode1'))
      .forEach(ev => {
        expect(ev.target).to.equal(document.querySelector('.button1'));
        done1 = true;
        checkDone();
      });

    topAliasStream
      .filter(checkIsTagged('child-anode2'))
      .forEach(ev => {
        expect(ev.target).to.equal(document.querySelector('.button2'));
        done2 = true;
        checkDone();
      });

    document.querySelector('.button1').click();
    document.querySelector('.button2').click();

    function checkDone() {
      if (done1 && done2) done();
    }
  });


  it('connects components with the global state stream', (done) => {
    const Anode = createAnode();
    const MY_ALIAS = 'my-component-name';

    // Create event stream and state stream
    const { eventStream, emitter } = createEventStream();
    const stateStream = most.create((add) => {
      const INITIAL_STATE = fromJS({
        text: 'hello'
      });
      const { update } = createStore(INITIAL_STATE, add);
      eventStream
        .filter(({cydux}) => cydux.alias === MY_ALIAS)
        .filter(({type}) => type === 'click')
        .forEach(ev => {
          update((state) => {
            return state.update('text', prevTextState => {
              return prevTextState + ' world';
            });
          });
          // Element updates asynchronously
          setTimeout(() => {
            expect(myComp.innerHTML).to.equal('hello world');
            done();
          }, 1)
        });
    });
    // Must call forEach/observe or drain on a 'most' stream before it
    // processes events
    stateStream.drain();

    // Create component and connect it to the global state stream
    const connect = createConnect(stateStream, getState);
    let MyComponent = React.createClass({
      render: function() {
        return (
          <Anode
            alias={MY_ALIAS}
            className="bananaphone"
            >
            {this.props.text}
          </Anode>
        );
      }
    });
    MyComponent = connect(MyComponent, 'text');

    // Verify the initial render
    ReactDOM.render((
      <MyComponent />
    ), document.getElementById('app'));
    var myComp = document.querySelector('.bananaphone');
    expect(myComp.innerHTML).to.equal('hello');
    myComp.click();
  });

});
