import ReactGA from 'react-ga';

// hack to make routing work on both prod and dev
export const prefixPath = (path: string) => {
  return `/app${path}`;
};

// // parse a JWT
// export const parseJwt = (token: string) => {
//     var base64Url = token.split('.')[1];
//     var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join(''));
//
//     return JSON.parse(jsonPayload);
// };

// have to require this for Typescript to work properly.....
// hopefully we can import this in the future
export const jwtDecode = require('jwt-decode');

// init google analytics
export const initGA = (userId?: string | undefined) => {
  ReactGA.initialize(
    [
      {
        debug: process.env.NODE_ENV === 'production' ? false : true,
        trackingId:
          process.env.NODE_ENV === 'production'
            ? 'UA-113321962-1'
            : 'UA-113321962-2',
        gaOptions: {
          userId: userId === undefined ? '0' : userId,
        },
      },
    ],
    {
      debug: process.env.NODE_ENV === 'production' ? false : true,
    },
  );
};

// init google analytics
export const setUserIdGA = (userId?: string | undefined) => {
  ReactGA.set({ userId: userId === undefined ? '0' : userId });
};
