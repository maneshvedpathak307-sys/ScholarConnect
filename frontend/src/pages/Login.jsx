import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  GraduationCap,
  LogIn,
  ShieldCheck,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Mail,
  RefreshCw,
  KeyRound,
  ArrowRight
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import PublicNavbar from "../components/PublicNavbar";

import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const {
    login,
    sendPasswordResetOtp,
    getPasswordResetCaptcha,
    verifyPasswordResetOtp,
    resetPassword
  } = useAuth();

  // LOGIN STATE
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  // RECOVERY STATE
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaText, setCaptchaText] = useState("");

  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");

  // --------------------------------------------------
  // LOGIN FORM CHANGE
  // --------------------------------------------------

  const handleChange = event => {
    const { name, value } = event.target;

    setForm(current => ({
      ...current,
      [name]: value
    }));
  };

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const handleSubmit = async event => {
    event.preventDefault();

    setError("");
    setLoginSuccess("");
    setLoading(true);

    try {
      const data = await login({
        email: form.email.trim(),
        password: form.password
      });

      if (data.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // RECOVERY ERROR MESSAGE
  // --------------------------------------------------

  const getRecoveryErrorMessage = err => {
    const data = err.response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
    if (data?.title) return data.title;

    if (err.response?.status === 429) {
      return "Too many attempts. Please wait and try again.";
    }

    if (!err.response) {
      return "Unable to connect to the server. Please try again.";
    }

    return "Something went wrong. Please try again.";
  };

  // --------------------------------------------------
  // OPEN FORGOT PASSWORD
  // --------------------------------------------------

  const openRecovery = () => {
    setShowRecovery(true);
    setRecoveryStep(1);

    setRecoveryEmail(form.email.trim().toLowerCase());
    setOtp("");
    setCaptchaId("");
    setCaptchaImage("");
    setCaptchaText("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");

    setRecoveryError("");
    setRecoverySuccess("");
    setError("");
    setLoginSuccess("");
  };

  // --------------------------------------------------
  // RETURN TO LOGIN
  // --------------------------------------------------

  const backToLogin = () => {
    setShowRecovery(false);
    setRecoveryStep(1);

    setOtp("");
    setCaptchaId("");
    setCaptchaImage("");
    setCaptchaText("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");

    setRecoveryError("");
    setRecoverySuccess("");
  };

  // --------------------------------------------------
  // LOAD / REFRESH CAPTCHA
  // --------------------------------------------------

  const loadCaptcha = async (preserveMessage = false) => {
    const normalizedEmail = recoveryEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setRecoveryError("Please enter your registered email address.");
      return;
    }

    setCaptchaLoading(true);

    if (!preserveMessage) {
      setRecoveryError("");
      setRecoverySuccess("");
    }

    setCaptchaText("");

    try {
      const response = await getPasswordResetCaptcha(normalizedEmail);

      setCaptchaId(response.captchaId);
      setCaptchaImage(response.image);

    } catch (err) {
      setCaptchaId("");
      setCaptchaImage("");

      if (!preserveMessage) {
        setRecoveryError(getRecoveryErrorMessage(err));
      }
    } finally {
      setCaptchaLoading(false);
    }
  };

  // --------------------------------------------------
  // STEP 1: SEND OTP
  // --------------------------------------------------

  const handleSendOtp = async event => {
    event.preventDefault();

    setRecoveryError("");
    setRecoverySuccess("");

    const normalizedEmail = recoveryEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setRecoveryError("Please enter your registered email address.");
      return;
    }

    setRecoveryLoading(true);

    try {
      await sendPasswordResetOtp(normalizedEmail);

      setRecoveryEmail(normalizedEmail);
      setOtp("");
      setCaptchaText("");
      setCaptchaId("");
      setCaptchaImage("");

      const response = await getPasswordResetCaptcha(normalizedEmail);

      setCaptchaId(response.captchaId);
      setCaptchaImage(response.image);

      setRecoveryStep(2);

      setRecoverySuccess(
        "If your email is registered, a verification OTP has been sent. Please check your inbox."
      );

    } catch (err) {
      setRecoveryError(getRecoveryErrorMessage(err));
    } finally {
      setRecoveryLoading(false);
    }
  };

  // --------------------------------------------------
  // STEP 2: VERIFY OTP + CAPTCHA
  // --------------------------------------------------

  const handleVerifyOtp = async event => {
    event.preventDefault();

    setRecoveryError("");
    setRecoverySuccess("");

    if (!/^[0-9]{6}$/.test(otp)) {
      setRecoveryError("Please enter the correct six-digit OTP.");
      return;
    }

    if (!captchaId || !captchaImage) {
      setRecoveryError("Please refresh and load a new CAPTCHA.");
      return;
    }

    if (!captchaText.trim()) {
      setRecoveryError("Please enter the CAPTCHA displayed in the image.");
      return;
    }

    setRecoveryLoading(true);

    try {
      const response = await verifyPasswordResetOtp({
        email: recoveryEmail.trim().toLowerCase(),
        otp: otp.trim(),
        captchaId,
        captchaText: captchaText.trim().toUpperCase()
      });

      if (!response.resetToken) {
        throw new Error("Verification token was not received.");
      }

      setResetToken(response.resetToken);

      setOtp("");
      setCaptchaText("");
      setCaptchaImage("");
      setCaptchaId("");

      setRecoverySuccess("Your email has been verified successfully.");
      setRecoveryStep(3);

    } catch (err) {
      const message = getRecoveryErrorMessage(err);

      setRecoveryError(message);

      const requiresNewOtp =
        /otp has expired|otp expired|too many incorrect otp attempts|request a new otp/i
          .test(message);

      if (requiresNewOtp) {
        setCaptchaImage("");
        setCaptchaId("");
      } else {
        await loadCaptcha(true);
      }
    } finally {
      setRecoveryLoading(false);
    }
  };

  // --------------------------------------------------
  // STEP 3: RESET PASSWORD
  // --------------------------------------------------

  const handleResetPassword = async event => {
    event.preventDefault();

    setRecoveryError("");
    setRecoverySuccess("");

    if (newPassword.length < 8 || newPassword.length > 72) {
      setRecoveryError(
        "Password must contain between 8 and 72 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (!resetToken) {
      setRecoveryError(
        "Your verification session is missing. Please verify your email again."
      );
      return;
    }

    setRecoveryLoading(true);

    try {
      const response = await resetPassword({
        email: recoveryEmail.trim().toLowerCase(),
        resetToken,
        newPassword,
        confirmPassword
      });

      setRecoverySuccess(
        response.message ||
        "Password reset successfully. You can now sign in."
      );

      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");

      // Return to the login form after a successful reset.
      setTimeout(() => {
        setShowRecovery(false);
        setRecoveryStep(1);
        setForm(current => ({
          ...current,
          email: recoveryEmail,
          password: ""
        }));
        setLoginSuccess("Password reset successfully. Please sign in with your new password.");
        setRecoverySuccess("");
      }, 1500);

    } catch (err) {
      setRecoveryError(getRecoveryErrorMessage(err));
    } finally {
      setRecoveryLoading(false);
    }
  };

  // --------------------------------------------------
  // LEFT BRAND PANEL
  // --------------------------------------------------

  const brandPanel = (
    <section className="auth-brand-panel">

      <Link to="/" className="auth-brand">

        <div className="auth-brand-logo">
          <GraduationCap size={27} />
        </div>

        <div>
          <h2>ScholarConnect</h2>
          <span>Scholarship Management Portal</span>
        </div>

      </Link>

      <div className="auth-brand-content">

        <span className="auth-eyebrow">
          WELCOME BACK
        </span>

        <h1>
          Your education.
          <br />
          <span>Your opportunities.</span>
        </h1>

        <p>
          Sign in to explore scholarship opportunities,
          manage your applications and follow your
          educational journey.
        </p>

        <div className="auth-benefits">

          <div className="auth-benefit">
            <span><CheckCircle2 size={18} /></span>
            <div>
              <strong>Simple Applications</strong>
              <small>
                Apply through a convenient online process.
              </small>
            </div>
          </div>

          <div className="auth-benefit">
            <span><ShieldCheck size={18} /></span>
            <div>
              <strong>Secure Document Management</strong>
              <small>
                Manage your submitted documents securely.
              </small>
            </div>
          </div>

          <div className="auth-benefit">
            <span><Clock size={18} /></span>
            <div>
              <strong>Application Tracking</strong>
              <small>
                Follow your application review status.
              </small>
            </div>
          </div>

        </div>

      </div>

      <div className="auth-brand-footer">
        <span>ScholarConnect</span>
        <span>Supporting your educational journey.</span>
      </div>

      <div className="auth-decoration auth-decoration-one"></div>
      <div className="auth-decoration auth-decoration-two"></div>

    </section>
  );

  // --------------------------------------------------
  // RECOVERY PROGRESS
  // --------------------------------------------------

  const recoveryProgress = (
    <div className="auth-recovery-progress">

      {[1, 2, 3].map(number => (
        <React.Fragment key={number}>

          <div
            className={`auth-recovery-step ${
              recoveryStep >= number ? "active" : ""
            }`}
          >
            <span>
              {recoveryStep > number
                ? <CheckCircle2 size={18} />
                : number}
            </span>

            <small>
              {number === 1
                ? "Email"
                : number === 2
                  ? "Verify"
                  : "Reset"}
            </small>
          </div>

          {number !== 3 && (
            <div
              className={`auth-recovery-line ${
                recoveryStep > number ? "active" : ""
              }`}
            />
          )}

        </React.Fragment>
      ))}

    </div>
  );

  // --------------------------------------------------
  // RIGHT PANEL
  // --------------------------------------------------

  return (
    <div className="auth-page-wrapper">

      <PublicNavbar activePage="login" />

      <main className="auth-page">

        <div className="auth-layout">

          {brandPanel}

          <section className={`auth-form-panel ${
            showRecovery ? "auth-recovery-mode" : ""
          }`}>

            <div className="auth-form-container">

              {/* MOBILE BRAND */}
              <div className="auth-mobile-brand">

                <div className="auth-brand-logo">
                  <GraduationCap size={25} />
                </div>

                <strong>ScholarConnect</strong>

              </div>

              {!showRecovery ? (

                // ======================================
                // NORMAL LOGIN FORM
                // ======================================

                <>

                  <div className="auth-form-heading">

                    <span className="auth-form-eyebrow">
                      STUDENT & ADMIN ACCESS
                    </span>

                    <h2>Welcome back!</h2>

                    <p>
                      Enter your details to sign in to your account.
                    </p>

                  </div>

                  <form onSubmit={handleSubmit}>

                    <div className="auth-field">

                      <label htmlFor="login-email">
                        Email Address
                      </label>

                      <input
                        id="login-email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        maxLength={150}
                        required
                      />

                    </div>

                    <div className="auth-field">

                      <div className="auth-label-row">

                        <label htmlFor="login-password">
                          Password
                        </label>

                        <button
                          type="button"
                          className="auth-forgot-link"
                          onClick={openRecovery}
                        >
                          Forgot Password?
                        </button>

                      </div>

                      <div className="auth-password-wrapper">

                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={form.password}
                          onChange={handleChange}
                          autoComplete="current-password"
                          required
                        />

                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={() =>
                            setShowPassword(current => !current)
                          }
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword
                            ? <EyeOff size={19} />
                            : <Eye size={19} />}
                        </button>

                      </div>

                    </div>

                    {error && (
                      <div className="auth-error" role="alert">
                        {error}
                      </div>
                    )}

                    {loginSuccess && (
                      <div className="auth-success" role="status">
                        <CheckCircle2 size={17} />
                        {loginSuccess}
                      </div>
                    )}

                    <button
                      className="auth-submit"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        "Signing in..."
                      ) : (
                        <>
                          Sign In
                          <LogIn size={18} />
                        </>
                      )}
                    </button>

                  </form>

                  <div className="auth-footer">
                    Don't have an account?
                    <Link to="/register"> Create account</Link>
                  </div>

                  <Link to="/" className="auth-back-home">
                    <ArrowLeft size={15} />
                    Back to home
                  </Link>

                  <div className="auth-security-note">
                    <ShieldCheck size={16} />
                    Your account is protected by secure authentication.
                  </div>

                </>

              ) : (

                // ======================================
                // FORGOT PASSWORD - THREE STEPS
                // ======================================

                <div className="auth-recovery-content">

                  <button
                    type="button"
                    className="auth-recovery-back"
                    onClick={backToLogin}
                  >
                    <ArrowLeft size={16} />
                    Back to Login
                  </button>

                  {recoveryProgress}

                  {/* STEP 1 */}
                  {recoveryStep === 1 && (

                    <div className="auth-recovery-card">

                      <div className="auth-recovery-icon">
                        <Mail size={27} />
                      </div>

                      <span className="auth-form-eyebrow">
                        ACCOUNT RECOVERY
                      </span>

                      <h2>Forgot Password?</h2>

                      <p className="auth-recovery-description">
                        Enter your registered email address.
                        We will send you a six-digit verification OTP.
                      </p>

                      <form onSubmit={handleSendOtp}>

                        <div className="auth-field">
                          <label htmlFor="recovery-email">
                            Email Address
                          </label>

                          <input
                            id="recovery-email"
                            type="email"
                            placeholder="you@example.com"
                            value={recoveryEmail}
                            onChange={event =>
                              setRecoveryEmail(event.target.value)
                            }
                            autoComplete="email"
                            maxLength={150}
                            required
                          />
                        </div>

                        {recoveryError && (
                          <div className="auth-error" role="alert">
                            {recoveryError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="auth-submit"
                          disabled={recoveryLoading}
                        >
                          {recoveryLoading
                            ? "Sending OTP..."
                            : "Send OTP"}

                          {!recoveryLoading && <ArrowRight size={18} />}
                        </button>

                      </form>

                    </div>

                  )}

                  {/* STEP 2 */}
                  {recoveryStep === 2 && (

                    <div className="auth-recovery-card">

                      <div className="auth-recovery-icon">
                        <ShieldCheck size={27} />
                      </div>

                      <span className="auth-form-eyebrow">
                        EMAIL VERIFICATION
                      </span>

                      <h2>Verify Your Email</h2>

                      <p className="auth-recovery-description">
                        Enter the six-digit OTP sent to
                        <strong> {recoveryEmail}</strong>.
                      </p>

                      <form onSubmit={handleVerifyOtp}>

                        <div className="auth-field">
                          <label htmlFor="recovery-otp">
                            Six-Digit OTP
                          </label>

                          <input
                            id="recovery-otp"
                            className="auth-otp-input"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="000000"
                            value={otp}
                            onChange={event =>
                              setOtp(
                                event.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 6)
                              )
                            }
                            maxLength={6}
                            required
                          />
                        </div>

                        <div className="auth-captcha-heading">
                          <label htmlFor="recovery-captcha">
                            Security CAPTCHA
                          </label>

                          <button
                            type="button"
                            className="auth-refresh-captcha"
                            onClick={() => loadCaptcha()}
                            disabled={captchaLoading || recoveryLoading}
                          >
                            <RefreshCw
                              size={15}
                              className={captchaLoading ? "auth-spinning" : ""}
                            />
                            {captchaLoading ? "Refreshing..." : "Refresh"}
                          </button>
                        </div>

                        <div className="auth-captcha-box">
                          {captchaImage ? (
                            <img
                              src={captchaImage}
                              alt="Security CAPTCHA"
                            />
                          ) : (
                            <span>
                              {captchaLoading
                                ? "Loading CAPTCHA..."
                                : "CAPTCHA unavailable"}
                            </span>
                          )}
                        </div>

                        <div className="auth-field">
                          <input
                            id="recovery-captcha"
                            type="text"
                            placeholder="Enter characters shown above"
                            value={captchaText}
                            onChange={event =>
                              setCaptchaText(
                                event.target.value
                                  .toUpperCase()
                                  .slice(0, 8)
                              )
                            }
                            maxLength={8}
                            autoComplete="off"
                            required
                          />
                        </div>

                        {recoveryError && (
                          <div className="auth-error" role="alert">
                            {recoveryError}
                          </div>
                        )}

                        {recoverySuccess && (
                          <div className="auth-success" role="status">
                            {recoverySuccess}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="auth-submit"
                          disabled={
                            recoveryLoading ||
                            captchaLoading ||
                            !captchaId ||
                            !captchaImage
                          }
                        >
                          {recoveryLoading
                            ? "Verifying..."
                            : "Verify Email"}

                          {!recoveryLoading && <ShieldCheck size={18} />}
                        </button>

                      </form>

                      <button
                        type="button"
                        className="auth-recovery-secondary"
                        onClick={backToLogin}
                        disabled={recoveryLoading}
                      >
                        <ArrowLeft size={15} />
                        Cancel and return to Login
                      </button>

                    </div>

                  )}

                  {/* STEP 3 */}
                  {recoveryStep === 3 && (

                    <div className="auth-recovery-card">

                      <div className="auth-recovery-icon auth-recovery-success-icon">
                        <KeyRound size={27} />
                      </div>

                      <span className="auth-form-eyebrow">
                        CREATE NEW PASSWORD
                      </span>

                      <h2>Reset Password</h2>

                      <p className="auth-recovery-description">
                        Your email is verified. Create a new password
                        for your ScholarConnect account.
                      </p>

                      <form onSubmit={handleResetPassword}>

                        <div className="auth-field">
                          <label htmlFor="recovery-new-password">
                            New Password
                          </label>

                          <div className="auth-password-wrapper">
                            <input
                              id="recovery-new-password"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={event =>
                                setNewPassword(event.target.value)
                              }
                              autoComplete="new-password"
                              minLength={8}
                              maxLength={72}
                              required
                            />

                            <button
                              type="button"
                              className="auth-password-toggle"
                              onClick={() =>
                                setShowNewPassword(current => !current)
                              }
                              aria-label={
                                showNewPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showNewPassword
                                ? <EyeOff size={18} />
                                : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <div className="auth-field">
                          <label htmlFor="recovery-confirm-password">
                            Confirm New Password
                          </label>

                          <div className="auth-password-wrapper">
                            <input
                              id="recovery-confirm-password"
                              type={
                                showConfirmPassword ? "text" : "password"
                              }
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={event =>
                                setConfirmPassword(event.target.value)
                              }
                              autoComplete="new-password"
                              minLength={8}
                              maxLength={72}
                              required
                            />

                            <button
                              type="button"
                              className="auth-password-toggle"
                              onClick={() =>
                                setShowConfirmPassword(current => !current)
                              }
                              aria-label={
                                showConfirmPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showConfirmPassword
                                ? <EyeOff size={18} />
                                : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <small className="auth-recovery-hint">
                          Use at least 8 characters.
                        </small>

                        {recoveryError && (
                          <div className="auth-error" role="alert">
                            {recoveryError}
                          </div>
                        )}

                        {recoverySuccess && (
                          <div className="auth-success" role="status">
                            <CheckCircle2 size={17} />
                            {recoverySuccess}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="auth-submit"
                          disabled={recoveryLoading || !resetToken}
                        >
                          {recoveryLoading
                            ? "Updating password..."
                            : "Reset Password"}

                          {!recoveryLoading && <CheckCircle2 size={18} />}
                        </button>

                      </form>

                    </div>

                  )}

                  <div className="auth-recovery-security">
                    <ShieldCheck size={16} />
                    Secure Account Recovery
                  </div>

                </div>
              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Login;