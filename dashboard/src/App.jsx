import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Posts from './pages/Posts'
import PostEdit from './pages/PostEdit'
import PostCreate from './pages/PostCreate'

function App() {
	return (
		<Router>
			<AuthProvider>
				<div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route element={<PrivateRoute />}>
							<Route path="/" element={<Dashboard />} />
							<Route path="/posts" element={<Posts />} />
							<Route path="/posts/create" element={<PostCreate />} />
							<Route path="/posts/:id/edit" element={<PostEdit />} />
						</Route>
					</Routes>
				</div>
				<Toaster position="top-right" />
			</AuthProvider>
		</Router>
	)
}

export default App
