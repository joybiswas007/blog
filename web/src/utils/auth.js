export const getAuthTokens = () => {
  const tokens = localStorage.getItem("authTokens");
  return tokens
    ? JSON.parse(tokens)
    : { access_token: null, refresh_token: null };
};

export const setAuthTokens = ({ access_token, refresh_token }) => {
  localStorage.setItem(
    "authTokens",
    JSON.stringify({ access_token, refresh_token })
  );
};

export const clearAuthTokens = () => {
  localStorage.removeItem("authTokens");
};
