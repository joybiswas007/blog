import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLock, FiMail, FiCheck } from "react-icons/fi";
import api from "@/services/api";
import { ErrorMessage, LoadingSpinner } from "@/components/PostForm";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: formData.email,
        password: formData.password
      });
      setSuccess(true);
      setFormData({
        email: "",
        password: "",
        confirmPassword: ""
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>Reset Password</title>
      <div className="flex items-center justify-center min-h-full py-12 px-4">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded bg-[#353b45]">
                <FiLock className="w-5 h-5 text-[#61afef]" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-sans text-[#abb2bf]">
                  Reset Password
                </h1>
                <p className="text-[11px] font-mono text-[#5c6370]">
                  auth/reset-password
                </p>
              </div>
            </div>
            <p className="text-[13px] font-sans text-[#5c6370] leading-relaxed">
              Enter your credentials to reset your password
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6">
              <ErrorMessage error={error} />
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-l-none bg-[rgba(152,195,121,0.1)] border-l-4 border-l-[#98c379]">
              <FiCheck className="w-4 h-4 text-[#98c379] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13px] font-mono text-[#98c379]">
                  Password reset successful!
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-2 mb-2 text-[12px] font-semibold font-sans text-[#5c6370] uppercase tracking-wider"
              >
                <FiMail className="w-3 h-3" />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                autoComplete="email"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded text-[13px] font-mono bg-[#2c313a] text-[#abb2bf] border border-[#353b45] transition-all focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#5c6370]"
                placeholder="user@example.com"
              />
            </div>

            {/* New Password Field */}
            <div>
              <label
                htmlFor="password"
                className="flex items-center gap-2 mb-2 text-[12px] font-semibold font-sans text-[#5c6370] uppercase tracking-wider"
              >
                <FiLock className="w-3 h-3" />
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 rounded text-[13px] font-mono bg-[#2c313a] text-[#abb2bf] border border-[#353b45] transition-all focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#5c6370]"
                placeholder="••••••••"
              />
              <p className="mt-1.5 text-[11px] font-mono text-[#5c6370]">
                → min 8 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="flex items-center gap-2 mb-2 text-[12px] font-semibold font-sans text-[#5c6370] uppercase tracking-wider"
              >
                <FiLock className="w-3 h-3" />
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 rounded text-[13px] font-mono bg-[#2c313a] text-[#abb2bf] border border-[#353b45] transition-all focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#5c6370]"
                placeholder="••••••••"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Link
                to="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded no-underline transition-all text-[13px] font-medium font-sans bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef]"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded transition-all text-[13px] font-medium font-sans bg-[#61afef] text-[#21252b] border border-[#61afef] hover:bg-[#84c0f4] hover:border-[#84c0f4] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Hint */}
          <div className="mt-6 pt-4 border-t border-t-[#2c313a]">
            <p className="text-[11px] font-mono text-[#5c6370] text-center">
              💡 Passwords are encrypted using bcrypt
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
