const initialState = {
  device: null,
  expiry: null,
};

const device = (state = initialState, action: any) => {
  console.log('inside the device reducer', action);
  if (action.type === 'SET_DEVICE') {
    console.log('inside the device reducer action', action);
    return {
      device: action.payload.data.device.token,
      expiry: action.payload.data.device.expiry,
    };
  }
  return state;
};

export default device;
