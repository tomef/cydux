import { expect } from 'chai';
import createEventStream from '../src/events.js';
import most from 'most';
import EventEmitter from 'eventemitter3';

const { Stream } = most;

describe('createEventStream', () => {
  it('creates an event stream and an event emitter', () => {
    const { eventStream, emitter } = createEventStream();
    expect(eventStream instanceof Stream).to.equal(true);
    expect(emitter instanceof EventEmitter).to.equal(true);
  });

  it('catches manually added events', function(done) {
    const { eventStream, emitter } = createEventStream({
      handleEvent: (ev, add) => add(ev),
      customEvents: ['festival'],
    });
    eventStream
      .take(1)
      .observe(ev => {
        expect(ev.name).to.equal('banana');
        done();
      });
    emitter.emit('festival', {
      name: 'banana',
    });
  });
});
