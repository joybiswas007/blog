import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import api from "@/services/api";
import { setAuthTokens } from "@/utils/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, refresh_token } = response.data;
      setAuthTokens({ access_token, refresh_token });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>Login</title>
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-icon">
              <FiLogIn />
            </div>
            <h1 className="login-title">Welcome Back</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            {/* Error Message */}
            {error && (
              <div className="login-error">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="login-field">
              <label htmlFor="email" className="login-label">
                <FiMail />
                <span>Email Address</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="login-input"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div className="login-field">
              <label htmlFor="password" className="login-label">
                <FiLock />
                <span>Password</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="login-input"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="login-submit">
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <FiLogIn />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
