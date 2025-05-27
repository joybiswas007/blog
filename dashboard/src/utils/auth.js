export const getAuthTokens = () => {
	const tokens = localStorage.getItem('authTokens')
	return tokens ? JSON.parse(tokens) : { accessToken: null, refreshToken: null }
}

export const setAuthTokens = ({ accessToken, refreshToken }) => {
	localStorage.setItem('authTokens', JSON.stringify({ accessToken, refreshToken }))
}

export const clearAuthTokens = () => {
	localStorage.removeItem('authTokens')
}
