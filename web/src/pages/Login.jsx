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
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>Login</title>
      <div className="flex items-center justify-center min-h-full py-8">
        <div className="w-full max-w-md space-y-0">
          {/* Header */}
          <div className="text-center space-y-2 p-6 rounded-t bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] border-b-0">
            <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full mb-2 bg-[var(--color-active-bg)] text-[var(--color-accent-primary)] text-xl">
              <FiLogIn />
            </div>
            <h1 className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
              Welcome Back
            </h1>
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-4 p-6 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] border-t-0 rounded-b"
          >
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded text-sm font-sans bg-[rgba(220,38,38,0.1)] text-[#fca5a5] border border-[rgba(220,38,38,0.3)]">
                <svg
                  className="w-4 h-4 shrink-0"
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
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium font-sans text-[var(--color-text-secondary)]"
              >
                <FiMail className="text-sm" />
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
                className="w-full px-3 py-2 rounded text-sm font-mono bg-[var(--color-input-bg)] text-[var(--color-text-primary)] border border-[var(--color-input-border)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_3px_rgba(0,122,204,0.1)] placeholder:text-[var(--color-text-muted)]"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-medium font-sans text-[var(--color-text-secondary)]"
              >
                <FiLock className="text-sm" />
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
                className="w-full px-3 py-2 rounded text-sm font-mono bg-[var(--color-input-bg)] text-[var(--color-text-primary)] border border-[var(--color-input-border)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_3px_rgba(0,122,204,0.1)] placeholder:text-[var(--color-text-muted)]"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded transition-all text-sm font-medium font-sans bg-[var(--color-accent-primary)] text-white border border-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,122,204,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
