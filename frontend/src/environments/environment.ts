// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Address of the backend API (see /backend)
  apiUrl: "http://localhost:3000",
  // true: a visitor with no session enters as the demo account and lands inside the portal.
  // false: every visitor signs in on the login page first.
  autoDemoLogin: true,
  // Social login — replace with the ids of your own Google / Facebook / LINE apps
  googleClientId:
    "246196017998-q52ius7kkuf4g917g4qjgusbl9ga0f4e.apps.googleusercontent.com",
  facebookAppId: "1050061045557139",
  lineLoginLiffId: "1656798245-ZM8GJrRA",
  lineConnectLiffId: "1656798245-1XOVnk67",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
