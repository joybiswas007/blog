import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/api'
import { getAuthTokens, setAuthTokens, clearAuthTokens } from '../utils/auth'
import { toast } from 'react-hot-toast'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
	const [loading, setLoading] = useState(true)
	const [status, setStatus] = useState(false)
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const { accessToken } = getAuthTokens()
				if (accessToken) {
					const message = await authService.status()
					if (message.message === "OK") {
						setStatus(true)
					}
				}
			} catch (error) {
				clearAuthTokens()
				setStatus(false)
			} finally {
				setLoading(false)
			}
		}

		checkAuth()
	}, [])

	const login = async (email, password) => {
		try {
			const data = await authService.login(email, password)
			setAuthTokens({
				accessToken: data.access_token,
				refreshToken: data.refresh_token,
			})
			return true
		} catch (error) {
			toast.error(error.response?.data?.error || 'Login failed')
			return false
		}
	}

	const logout = async () => {
		await authService.logout()
		setStatus(false)
	}

	const value = {
		status,
		loading,
		login,
		logout,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
