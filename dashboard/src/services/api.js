import axios from "axios";
import { API_BASE_URL } from "../config";
import { toast } from "react-hot-toast";
import { getAuthTokens, setAuthTokens, clearAuthTokens } from "../utils/auth";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		// Skip adding Authorization header for refresh endpoint
		if (config.url === "/auth/refresh") {
			return config;
		}

		const { accessToken } = getAuthTokens();
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const { refreshToken } = getAuthTokens();

		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			refreshToken &&
			originalRequest.url !== "/auth/refresh"
		) {
			originalRequest._retry = true;

			try {
				const response = await api.post("/auth/refresh", { refreshToken });
				const { access_token, refresh_token } = response.data;
				setAuthTokens({ access_token, refresh_token });

				// Retry original request with new accessToken
				originalRequest.headers.Authorization = `Bearer ${access_token}`;
				return api(originalRequest);
			} catch (refreshError) {
				clearAuthTokens();
				window.location.href = "/login";
				return Promise.reject(refreshError);
			}
		}

		// Handle other errors
		if (error.response?.data?.message) {
			toast.error(error.response.data.message);
		} else {
			toast.error("An error occurred. Please try again.");
		}

		return Promise.reject(error);
	},
);

export const authService = {
	login: async (email, password) => {
		const response = await api.post("/auth/login", { email, password });
		return response.data;
	},
	logout: async () => {
		clearAuthTokens();
	},
	status: async () => {
		const response = await api.get("/auth/status");
		return response.data;
	},
	resetPassword: async (email) => {
		const response = await api.post("/auth/users/reset-password", { email });
		return response.data;
	},
	refresh: async (refreshToken) => {
		const response = await api.post("/auth/refresh", { refreshToken });
		return response.data;
	},
};

export const postService = {
	getPosts: async ({
		limit = 5,
		offset = 0,
		order_by = "created_at",
		sort = "DESC",
	}) => {
		const response = await api.get("/posts", {
			params: {
				limit,
				offset,
				order_by,
				sort,
			},
		});
		return response.data;
	},
	getPost: async (id) => {
		const response = await api.get(`/posts/${id}`);
		return response.data;
	},

	createPost: async (postData) => {
		const response = await api.post("/posts", postData);
		return response.data;
	},
	updatePost: async (id, postData) => {
		const response = await api.patch(`/posts/${id}`, postData);
		return response.data;
	},
	deletePost: async (id) => {
		const response = await api.delete(`/posts/${id}`);
		return response.data;
	},
};

export default api;
