import axios from "axios";
import { clearAuthTokens, getAuthTokens, setAuthTokens } from "../utils/auth";

const { VITE_BASE_URL } = import.meta.env;

const api = axios.create({
  baseURL: VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add a request interceptor to attach tokens to outgoing requests
api.interceptors.request.use(
  config => {
    const { access_token, refresh_token } = getAuthTokens();

    // Handle the refresh token separately for the refresh endpoint
    if (config.url === "/auth/refresh") {
      if (refresh_token) {
        config.headers["Authorization"] = `Bearer ${refresh_token}`;
      }
      return config;
    }

    // Attach the access token for all other requests
    if (access_token) {
      config.headers["Authorization"] = `Bearer ${access_token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Handle 401: Token refresh logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If 401 and not retrying already
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refresh_token } = getAuthTokens();
        // Call your refresh endpoint (adjust URL as needed)
        const response = await axios.post(`${VITE_BASE_URL}/auth/refresh`, "", {
          headers: {
            Authorization: `Bearer ${refresh_token}`
          }
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        setAuthTokens({ access_token, refresh_token: newRefreshToken });

        api.defaults.headers.common["Authorization"] = "Bearer " + access_token;
        processQueue(null, newToken);

        originalRequest.headers["Authorization"] = "Bearer " + access_token;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Optionally, logout the user here if refresh fails
        clearAuthTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
