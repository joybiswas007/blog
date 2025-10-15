import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLock, FiMail, FiCheck } from "react-icons/fi";
import api from "@/services/api";
import { ErrorMessage, LoadingSpinner } from "./PostForm";

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
      <div className="flex items-center justify-center min-h-full py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3 p-6 rounded-t bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] border-b-0">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full mb-3 bg-[var(--color-active-bg)] text-[var(--color-accent-primary)] text-[28px]">
              <FiLock />
            </div>
            <h1 className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
              Reset Password
            </h1>
            <p className="text-sm font-sans text-[var(--color-text-secondary)] leading-normal">
              Enter your email and new password to change your credentials
            </p>
          </div>

          {/* Back Button */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-sans bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border border-[var(--color-panel-border)] hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
          >
            <FiArrowLeft />
            <span>Back to Dashboard</span>
          </Link>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] border-t-0 rounded-b"
          >
            {/* Error Message */}
            {error && (
              <div className="rounded">
                <ErrorMessage error={error} />
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-3 px-4 py-3 rounded text-sm font-sans bg-[rgba(52,211,153,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.3)]">
                <FiCheck className="text-xl" />
                <span>Password has been reset successfully!</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium font-sans text-[var(--color-text-secondary)]"
              >
                <FiMail className="text-base" />
                <span>Email</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                autoComplete="email"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded text-sm font-mono bg-[var(--color-input-bg)] text-[var(--color-text-primary)] border border-[var(--color-input-border)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_3px_rgba(0,122,204,0.1)] placeholder:text-[var(--color-text-muted)]"
                placeholder="your@email.com"
              />
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-medium font-sans text-[var(--color-text-secondary)]"
              >
                <FiLock className="text-base" />
                <span>New Password</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 rounded text-sm font-mono bg-[var(--color-input-bg)] text-[var(--color-text-primary)] border border-[var(--color-input-border)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_3px_rgba(0,122,204,0.1)] placeholder:text-[var(--color-text-muted)]"
                placeholder="Enter new password"
              />
              <p className="text-xs font-mono text-[var(--color-text-muted)]">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="flex items-center gap-2 text-sm font-medium font-sans text-[var(--color-text-secondary)]"
              >
                <FiLock className="text-base" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 rounded text-sm font-mono bg-[var(--color-input-bg)] text-[var(--color-text-primary)] border border-[var(--color-input-border)] transition-all focus:outline-none focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_3px_rgba(0,122,204,0.1)] placeholder:text-[var(--color-text-muted)]"
                placeholder="Confirm new password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded transition-all text-sm font-medium font-sans bg-[var(--color-accent-primary)] text-white border border-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,122,204,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <FiLock />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
