import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware, Action } from 'redux';
import reduxThunk, { ThunkMiddleware } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { routerMiddleware } from 'connected-react-router';
import { persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';
import { responsiveStoreEnhancer } from 'redux-responsive';
import createRootReducer from '../reducers';
import apiMiddleware from '../middleware/api';

export const history = createBrowserHistory();

const defaultState = {};

const persistConfig = {
  key: 'root',
  storage: sessionStorage,
  blacklist: [
    'appTime',
    'router',
    'browser',
    'updateServiceWorker',
    'online',
    'local',
  ],
};

// create our root reducer
const rootReducer = createRootReducer(history);

// export the type for usage elsewhere
export type AppState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer(persistConfig, rootReducer);

const composeEnhancers = composeWithDevTools({ trace: true, traceLimit: 25 });
const store = createStore(
  persistedReducer,
  defaultState,
  composeEnhancers(
    responsiveStoreEnhancer,
    applyMiddleware(
      routerMiddleware(history),
      reduxThunk as ThunkMiddleware<AppState, Action<any>>,
      apiMiddleware,
    ),
  ),
);

export default store;
