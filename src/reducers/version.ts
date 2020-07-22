const initialState = {
  version: 0,
  needsRefresh: false,
};

const version = (state = initialState, action: any) => {
  if (action.type === 'SET_VERSION') {
    const newVersion = action.payload.version;
    let needsRefresh = false;
    if (state.version > 0 && state.version !== newVersion) {
      // outdated version, force app reload
      needsRefresh = true;
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    return { ...state, version: newVersion, needsRefresh: needsRefresh };
  }
  if (action.type === 'SET_REFRESH_DONE') {
    return { ...state, needsRefresh: false };
  }
  return state;
};

export default version;
