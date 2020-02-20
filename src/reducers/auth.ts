import { Reducer } from 'redux';
import { setUserIdGA, jwtDecode } from '../common';

export type AuthState = {
  token: string | null;
  error: object | null;
};

const initialState: AuthState = {
  token: null,
  error: null,
};

type AuthAction = {
  type: 'LOGIN_SUCCEEDED' | 'LOGIN_FAILED' | 'LOGOUT' | 'TOKEN_EXPIRED';
  payload: {
    data: {
      token: string;
    };
  };
};

const auth: Reducer<AuthState, AuthAction> = (
  state = initialState,
  action: AuthAction,
) => {
  if (action.type === 'LOGIN_SUCCEEDED') {
    const rawToken = jwtDecode(action.payload.data.token);
    setUserIdGA(String(rawToken.user_id));
    return {
      token: action.payload.data.token,
      error: null,
    };
  }

  if (action.type === 'LOGIN_FAILED') {
    return {
      token: null,
      error: action.payload,
    };
  }

  if (action.type === 'LOGOUT') {
    setUserIdGA();
    return {
      token: null,
      error: null,
    };
  }

  if (action.type === 'TOKEN_EXPIRED') {
    setUserIdGA();
    return {
      ...state,
      token: null,
    };
  }
  return state;
};

export default auth;
