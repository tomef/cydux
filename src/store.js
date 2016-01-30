let isUpdating = false;
let state;

function createStore(initialState, emit) {
  state = initialState;

  function update(updaterFn) {
    if (isUpdating) {
      console.error('Only one event handler should update the state at a time');
      return;
    }

    isUpdating = true;
    state = updaterFn(state);
    isUpdating = false;

    emit(state);
  }

  return {
    update,
  };
}

function getState() {
  return state;
}

export {
  createStore,
  getState,
};
