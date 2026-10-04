export const environment = {
  production: true,
  // Address of the deployed backend API — set this before building for production
  apiUrl: "https://your-backend.example.com",
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
