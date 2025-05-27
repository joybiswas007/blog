import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const { login } = useAuth()
	const navigate = useNavigate()

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		const success = await login(email, password)
		setLoading(false)
		if (success) {
			navigate('/')
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
				<div className="text-center">
					<h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Sign in</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="input-field"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="input-field"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>
					<div>
						<button
							type="submit"
							disabled={loading}
							className="w-full btn-primary"
						>
							{loading ? 'Signing in...' : 'Sign in'}
						</button>
					</div>
					{/* It's all upto you the user */}
					{/* <div className="text-sm text-center"> */}
					{/* 	<Link */}
					{/* 		to="#" */}
					{/* 		className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300" */}
					{/* 	> */}
					{/* 		Forgot your password? */}
					{/* 	</Link> */}
					{/* </div> */}
				</form>
			</div>
		</div>
	)
}

export default Login
