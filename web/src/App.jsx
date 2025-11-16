import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "@/components/PrivateRoute";
import Layout from "@/components/Layout";

const Home = lazy(() => import("@/pages/Home"));
const Post = lazy(() => import("@/pages/Post"));
const Tags = lazy(() => import("@/pages/Tags"));
const Archives = lazy(() => import("@/pages/Archives"));
const ArchiveByYear = lazy(() => import("@/pages/ArchiveByYear"));
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CreatePost = lazy(() => import("@/pages/CreatePost"));
const EditPost = lazy(() => import("@/pages/EditPost"));
const ResetPassword = lazy(() => import("@/components/ResetPassword"));
const LoginAttempts = lazy(() => import("@/components/LoginAttempts"));
const NotFound = lazy(() => import("@/components/NotFound"));

const App = () => {
  return (
    <Router>
      <Layout>
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-screen">
              <div className="text-[var(--color-text-secondary)] font-mono">
                Loading...
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:slug" element={<Post />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/archives/:year" element={<ArchiveByYear />} />
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth/posts/create" element={<CreatePost />} />
              <Route path="/auth/posts/:id/edit" element={<EditPost />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/auth/login-attempts" element={<LoginAttempts />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
