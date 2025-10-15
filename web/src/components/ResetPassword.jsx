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
      <div className="reset-password-container">
        <div className="reset-password-card">
          {/* Header */}
          <div className="reset-password-header">
            <div className="reset-password-icon">
              <FiLock />
            </div>
            <h1 className="reset-password-title">Reset Password</h1>
            <p className="reset-password-subtitle">
              Enter your email and new password to change your credentials
            </p>
          </div>

          {/* Back Button */}
          <Link to="/dashboard" className="reset-password-back">
            <FiArrowLeft />
            <span>Back to Dashboard</span>
          </Link>

          {/* Form */}
          <form onSubmit={handleSubmit} className="reset-password-form">
            {/* Error Message */}
            {error && (
              <div className="reset-password-error">
                <ErrorMessage error={error} />
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="reset-password-success">
                <FiCheck />
                <span>Password has been reset successfully!</span>
              </div>
            )}

            {/* Email Field */}
            <div className="reset-password-field">
              <label htmlFor="email" className="reset-password-label">
                <FiMail />
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
                className="reset-password-input"
                placeholder="your@email.com"
              />
            </div>

            {/* New Password Field */}
            <div className="reset-password-field">
              <label htmlFor="password" className="reset-password-label">
                <FiLock />
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
                className="reset-password-input"
                placeholder="Enter new password"
              />
              <p className="reset-password-hint">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="reset-password-field">
              <label htmlFor="confirmPassword" className="reset-password-label">
                <FiLock />
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
                className="reset-password-input"
                placeholder="Confirm new password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="reset-password-submit"
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
