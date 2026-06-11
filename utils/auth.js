const TOKEN_KEY = "gym_os_token";
const USER_KEY = "gym_os_user";

export const saveAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
