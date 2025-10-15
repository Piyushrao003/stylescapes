// D:\stylescapes\frontend\src\pages\Auth.js

import React, { useState } from "react";
// CRITICAL: Import useLocation for reading the state
import { useNavigate, useLocation } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../config/firebase";

import { loginUser, registerUser } from "../api/authApi";
import BackgroundAnimation from "../components/login/BackgroundAnimation";
import "../styles/Auth.css";
import "../styles/AuthComp.css";
import "../styles/global.css";

// CRITICAL: Accepts setUser from App.js
const Auth = ({ setUser }) => {
  const [currentSection, setCurrentSection] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "", // Used for login
    firstName: "",
    lastName: "",
    mobile: "",
    newPassword: "", // Used for registration
    confirmPassword: "", // Used for registration
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  // 1. Get the current location object to read the state
  const location = useLocation();
  const firebaseAuth = auth;

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword((prev) => !prev);
    } else if (field === "newPassword") {
      setShowNewPassword((prev) => !prev);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  const handlePageSwitch = (section) => {
    setCurrentSection(section);
    setErrors({});
    setFormData((prev) => ({
      ...prev,
      password: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const { email, password } = formData;
    let firebaseIdToken = null;

    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const user = userCredential.user;

      firebaseIdToken = await user.getIdToken();

      const data = await loginUser({ token: firebaseIdToken });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      // --- REDIRECT TO ORIGIN LOGIC ---
      // 2. Read the 'from' path saved in the navigation state, defaulting to '/'
      const originPath = location.state?.from || "/";

      if (data.user.role === "admin") {
        // Admins always go to dashboard
        navigate("/admin");
      } else {
        // Users go back to where they came from (Cart, Product, etc.)
        navigate(originPath);
      }
      // --- END REDIRECT LOGIC ---
    } catch (err) {
      console.error("Login Error:", err);
      let errorMessage = "Invalid email or password.";
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        errorMessage = "Invalid email or password.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const { email, newPassword, confirmPassword, firstName, lastName, mobile } =
      formData;

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      setIsLoading(false);
      return;
    }

    let firebaseIdToken = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        newPassword
      );
      const user = userCredential.user;

      firebaseIdToken = await user.getIdToken();

      const registrationData = {
        token: firebaseIdToken,
        firstName,
        lastName,
        phoneNumber: mobile,
      };

      await registerUser(registrationData);

      // NOTE: Registration currently just switches to login page;
      // if successful login is desired here, login logic should be duplicated.
      handlePageSwitch("login");
    } catch (err) {
      console.error("Registration Error:", err);
      let errorMessage = "Registration failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      await sendPasswordResetEmail(firebaseAuth, formData.email);
      handlePageSwitch("link-sent");
    } catch (err) {
      console.error("Forgot Password Error:", err);
      let errorMessage =
        "Failed to send a reset link. Check your email address.";
      if (err.code === "auth/user-not-found") {
        errorMessage = "No user found with that email.";
      }
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case "login":
        return (
          <div
            id="login-page"
            className={`form-section ${
              currentSection === "login" ? "active" : ""
            }`}
          >
            <div className="logo-container">
              <img src="/logo.svg" alt="Stylescapes Logo" />
            </div>
            <form onSubmit={handleLogin}>
              {errors.general && (
                <p className="error-message">{errors.general}</p>
              )}
              <div className="input_box">
                <input
                  type="text"
                  id="login-email"
                  className="input-field"
                  name="email"
                  required
                  onChange={handleInputChange}
                  value={formData.email || ""}
                />
                <label htmlFor="login-email" className="label">
                  Email
                </label>
              </div>
              <div className="input_box">
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-pass"
                  className="input-field"
                  name="password"
                  required
                  onChange={handleInputChange}
                  value={formData.password || ""}
                  autocomplete="current-password"
                />
                <label htmlFor="login-pass" className="label">
                  Password
                </label>
                {/* NEW: Dynamic Unicode Icon */}
                <span
                  className="password-toggle-icon icon"
                  onClick={() => togglePasswordVisibility("password")}
                >
                  {showPassword ? "👁️" : "🔒"}{" "}
                  {/* Using emojis for visibility/lock */}
                </span>
              </div>
              <div className="remember-forgot">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember"> Remember me</label>
                </div>
                <div className="forgot">
                  <a onClick={() => handlePageSwitch("forgot-password")}>
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="input_box">
                <button
                  type="submit"
                  className="input-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </div>
              <div className="register">
                <span>
                  Don't have an account?{" "}
                  <a onClick={() => handlePageSwitch("signup")}>Register</a>
                </span>
              </div>
            </form>
          </div>
        );
      case "signup":
        return (
          <div
            id="signup-page"
            className={`form-section ${
              currentSection === "signup" ? "active" : ""
            }`}
          >
            <div className="logo-container">
              <img
                src={"/logo.svg"}
                alt="STYLESCAPES Logo"
                className="logo-img"
              />
            </div>
            <form onSubmit={handleRegister}>
              {errors.general && (
                <p className="error-message">{errors.general}</p>
              )}
              <div className="name-fields">
                <div className="input_box" style={{ marginTop: 0 }}>
                  <input
                    type="text"
                    id="fname"
                    className="input-field"
                    name="firstName"
                    required
                    onChange={handleInputChange}
                    value={formData.firstName || ""}
                  />
                  <label htmlFor="fname" className="label">
                    First Name
                  </label>
                </div>
                <div className="input_box" style={{ marginTop: 0 }}>
                  <input
                    type="text"
                    id="lname"
                    className="input-field"
                    name="lastName"
                    required
                    onChange={handleInputChange}
                    value={formData.lastName || ""}
                  />
                  <label htmlFor="lname" className="label">
                    Last Name
                  </label>
                </div>
              </div>
              <div className="input_box">
                <input
                  type="email"
                  id="signup-email"
                  className="input-field"
                  name="email"
                  required
                  onChange={handleInputChange}
                  value={formData.email || ""}
                />
                <label htmlFor="signup-email" className="label">
                  Email Address
                </label>
              </div>

              <div className="input_box">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="new-pass"
                  className="input-field"
                  name="newPassword"
                  required
                  onChange={handleInputChange}
                  value={formData.newPassword || ""}
                  autocomplete="new-password"
                />
                <label htmlFor="new-pass" className="label">
                  New Password
                </label>
                <span
                  className="password-toggle-icon icon"
                  onClick={() => togglePasswordVisibility("newPassword")}
                >
                  {showNewPassword ? "👁️" : "🔒"}
                </span>
              </div>
              <div className="input_box">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-pass"
                  className="input-field"
                  name="confirmPassword"
                  required
                  onChange={handleInputChange}
                  value={formData.confirmPassword || ""}
                  autocomplete="new-password"
                />
                <label htmlFor="confirm-pass" className="label">
                  Confirm Password
                </label>
                <span
                  className="password-toggle-icon icon"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                >
                  {showConfirmPassword ? "👁️" : "🔒"}
                </span>
                {errors.confirmPassword && (
                  <p className="error-message">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="input_box">
                <input
                  type="tel"
                  id="signup-mobile"
                  className="input-field"
                  name="mobile"
                  required
                  onChange={handleInputChange}
                  value={formData.mobile || ""}
                />
                <label htmlFor="signup-mobile" className="label">
                  Mobile Number
                </label>
              </div>
              <div className="input_box">
                <button
                  type="submit"
                  className="input-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                </button>
              </div>
              <div className="go-back">
                <span>
                  Already have an account?{" "}
                  <a onClick={() => handlePageSwitch("login")}>Login</a>
                </span>
              </div>
            </form>
          </div>
        );
      case "password":
        handlePageSwitch("signup");
        return null;
      case "forgot-password":
        return (
          <div
            id="forgot-password-page"
            className={`form-section ${
              currentSection === "forgot-password" ? "active" : ""
            }`}
          >
            <div className="form-content">
              <h2>Forgot Password</h2>
              <p>Enter your email to receive a reset link.</p>
              <form onSubmit={handleForgotPassword}>
                {errors.general && (
                  <p className="error-message">{errors.general}</p>
                )}
                <div className="input_box">
                  <input
                    type="email"
                    id="forgot-email"
                    className="input-field"
                    name="email"
                    required
                    onChange={handleInputChange}
                    value={formData.email || ""}
                  />
                  <label htmlFor="forgot-email" className="label">
                    Email Address
                  </label>
                </div>
                <div className="input_box">
                  <button
                    type="submit"
                    className="input-submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Link"}
                  </button>
                </div>
                <div className="go-back">
                  <span>
                    Remembered your password?{" "}
                    <a onClick={() => handlePageSwitch("login")}>Login</a>
                  </span>
                </div>
              </form>
            </div>
          </div>
        );
      case "link-sent":
        setTimeout(() => handlePageSwitch("login"), 3000);
        return (
          <div
            id="link-sent-page"
            className={`form-section ${
              currentSection === "link-sent" ? "active" : ""
            }`}
          >
            <div className="confirmation-content">
              <i className="bx bx-check-circle checkmark"></i>
              <h2>Link Sent!</h2>
              <p>A password reset link has been sent to your email address.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <BackgroundAnimation />
      <div className="auth-wrapper">
        <div className="auth-form-box">{renderSection()}</div>
      </div>
    </div>
  );
};

export default Auth;
