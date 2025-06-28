import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import ResetPassword from "./components/ResetPassword";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Tags from "./pages/Tags";
import Archives from "./pages/Archives";
import ArchiveByYear from "./pages/ArchiveByYear";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:slug" element={<Post />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/archives/:year" element={<ArchiveByYear />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth/posts/create" element={<CreatePost />} />
            <Route path="/auth/posts/:id/edit" element={<EditPost />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
