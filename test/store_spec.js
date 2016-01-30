import { expect } from 'chai';
import { createStore, getState } from '../src/store.js';
import Immutable from 'immutable';
const { Map, fromJS } = Immutable;

describe('createStore', () => {
  it('takes an initial state and an emitter function', () => {
    const initState = fromJS({
      cats: {
        alpha: "Sometimes I think I should have gone to medical school",
        beta: "But then I think of all the wasted time"
      }
    });
    const { _ } = createStore(initState, function() {});
    expect(Immutable.is(initState, getState())).to.equal(true);
  });

  it('returns an update function that accepts a function as its sole parameter'
    +' and calls that function with the current state to update', () => {
    const initState = fromJS({'I\'ve': 'gotta feeling'});
    const { update } = createStore(initState, function() {});
    update((state) => {
      expect(Immutable.is(state, initState)).to.equal(true);
    });
  });

  it('calls the emitter function after successfully updating', () => {
    const initState = fromJS([1,2,3]);
    const { update } = createStore(initState, function emit(state) {
      const updatedState = fromJS([1,2,3,4]);
      expect(Immutable.is(state, updatedState)).to.equal(true);
    });
    update(state => state.push(4));
  });

  it('ignores updates in the middle of another update', () => {
    const initState = fromJS([1,2,3]);
    const { update } = createStore(initState, function emit(state) {
      const updatedState = fromJS([1,2,3,5]);
      expect(Immutable.is(state, updatedState)).to.equal(true);
    });
    update((state) => {
      update(state => state.push(4));
      return state.push(5);
    });
  });
});
