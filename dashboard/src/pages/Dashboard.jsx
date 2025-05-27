import DashboardLayout from "../layouts/DashboardLayout"
const Dashboard = () => {
	return (
		<DashboardLayout>
			<div className="card">
				<h1 className="text-2xl font-bold mb-4">Dashboard</h1>
				<p>Welcome to your admin dashboard. Use the sidebar to navigate.</p>
			</div>
		</DashboardLayout>
	)
}

export default Dashboard
