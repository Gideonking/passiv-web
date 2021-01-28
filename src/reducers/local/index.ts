import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import device from './device';

export const localPersistConfig = {
  key: 'local',
  storage: storage,
};

export const localReducer = (history: any) =>
  combineReducers({
    device,
  });
