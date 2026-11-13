import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "../styles/ForgotPassword.css";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const {
    sendPasswordResetOtp,
    getPasswordResetCaptcha,
    verifyPasswordResetOtp,
    resetPassword
  } = useAuth();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaText, setCaptchaText] = useState("");

  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Extract useful messages from Spring Boot responses.
  const getErrorMessage = err => {

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

  // LOAD / REFRESH CAPTCHA
  const loadCaptcha = async (preserveMessage = false) => {

    setCaptchaLoading(true);

    if (!preserveMessage) {
      setError("");
      setSuccess("");
    }

    setCaptchaText("");

    try {

      const response =
        await getPasswordResetCaptcha(email.trim());

      setCaptchaId(response.captchaId);
      setCaptchaImage(response.image);

    } catch (err) {

      setCaptchaId("");
      setCaptchaImage("");

      if (!preserveMessage) {
        setError(getErrorMessage(err));
      }

    } finally {
      setCaptchaLoading(false);
    }
  };

  // STEP 1: SEND OTP
  const handleSendOtp = async event => {

    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {

      await sendPasswordResetOtp(normalizedEmail);

      setEmail(normalizedEmail);
      setOtp("");
      setCaptchaText("");
      setCaptchaId("");
      setCaptchaImage("");

      const response =
        await getPasswordResetCaptcha(normalizedEmail);

      setCaptchaId(response.captchaId);
      setCaptchaImage(response.image);

      setStep(2);

      setSuccess(
        "If your email is registered, a verification OTP has been sent. Please check your inbox."
      );

    } catch (err) {

      setError(getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP + CAPTCHA
  const handleVerifyOtp = async event => {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (!/^[0-9]{6}$/.test(otp)) {
      setError("Please enter the correct six-digit OTP.");
      return;
    }

    if (!captchaId || !captchaImage) {
      setError("Please refresh and load a new CAPTCHA.");
      return;
    }

    if (!captchaText.trim()) {
      setError("Please enter the CAPTCHA displayed in the image.");
      return;
    }

    setLoading(true);

    try {

      const response = await verifyPasswordResetOtp({
        email: email.trim().toLowerCase(),
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

      setSuccess("Your email has been verified successfully.");

      setStep(3);

    } catch (err) {

      const message = getErrorMessage(err);

      setError(message);

      // Expired OTP or maximum attempts:
      // Student must request a new OTP.
      const requiresNewOtp =
        /otp has expired|otp expired|too many incorrect otp attempts|request a new otp/i
          .test(message);

      if (requiresNewOtp) {

        setCaptchaImage("");
        setCaptchaId("");

      } else {

        // Wrong OTP or CAPTCHA:
        // Refresh CAPTCHA, but preserve the error message.
        await loadCaptcha(true);

      }

    } finally {
      setLoading(false);
    }
  };

  // STEP 3: RESET PASSWORD
  const handleResetPassword = async event => {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword.length < 8 || newPassword.length > 72) {

      setError(
        "Password must contain between 8 and 72 characters."
      );

      return;
    }

    if (newPassword !== confirmPassword) {

      setError(
        "New password and confirm password do not match."
      );

      return;
    }

    setLoading(true);

    try {

      const response = await resetPassword({
        email: email.trim().toLowerCase(),
        resetToken,
        newPassword,
        confirmPassword
      });

      setSuccess(
        response.message ||
        "Password reset successfully. Please sign in."
      );

      setResetToken("");

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);

    } catch (err) {

      setError(getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  };

  // RETURN TO EMAIL STEP
  const changeEmail = () => {

    setStep(1);

    setOtp("");
    setCaptchaText("");
    setCaptchaImage("");
    setCaptchaId("");

    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");

    setError("");
    setSuccess("");
  };

  return (

    <main className="forgot-page">

      <div className="forgot-container">

        {/* BRAND */}
        <Link to="/" className="forgot-brand">

          <div className="forgot-brand-icon">
            <GraduationCap size={28} />
          </div>

          <div>
            <strong>ScholarConnect</strong>
            <small>Scholarship Management Portal</small>
          </div>

        </Link>

        {/* PROGRESS */}
        <div className="forgot-progress">

          {[1, 2, 3].map(number => (

            <React.Fragment key={number}>

              <div
                className={`forgot-progress-step ${
                  step >= number ? "active" : ""
                }`}
              >

                <span>
                  {step > number
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
                  className={`forgot-progress-line ${
                    step > number ? "active" : ""
                  }`}
                />
              )}

            </React.Fragment>

          ))}

        </div>

        {/* STEP 1: EMAIL */}
        {step === 1 && (

          <section className="forgot-card">

            <div className="forgot-main-icon">
              <Mail size={28} />
            </div>

            <span className="forgot-eyebrow">
              ACCOUNT RECOVERY
            </span>

            <h1>Forgot Password?</h1>

            <p className="forgot-description">
              Enter your registered email address. We will send
              you a six-digit verification OTP.
            </p>

            <form onSubmit={handleSendOtp}>

              <label htmlFor="forgot-email">
                Email Address
              </label>

              <input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
                autoComplete="email"
                maxLength={150}
                required
              />

              {error && (
                <div className="forgot-message error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="forgot-primary-button"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}

                {!loading && <ArrowRight size={18} />}
              </button>

            </form>

          </section>

        )}

        {/* STEP 2: VERIFY EMAIL */}
        {step === 2 && (

          <section className="forgot-card">

            <div className="forgot-main-icon">
              <ShieldCheck size={28} />
            </div>

            <span className="forgot-eyebrow">
              EMAIL VERIFICATION
            </span>

            <h1>Verify Your Email</h1>

            <p className="forgot-description">
              Enter the six-digit OTP sent to
              <strong> {email}</strong>.
            </p>

            <form onSubmit={handleVerifyOtp}>

              <label htmlFor="forgot-otp">
                Six-Digit OTP
              </label>

              <input
                id="forgot-otp"
                className="forgot-otp-input"
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

              <div className="forgot-captcha-heading">

                <label htmlFor="captcha-answer">
                  Security CAPTCHA
                </label>

                <button
                  type="button"
                  className="forgot-refresh-captcha"
                  onClick={() => loadCaptcha()}
                  disabled={captchaLoading || loading}
                >
                  <RefreshCw
                    size={17}
                    className={captchaLoading ? "spinning" : ""}
                  />

                  {captchaLoading ? "Refreshing..." : "Refresh"}
                </button>

              </div>

              <div className="forgot-captcha-box">

                {captchaImage ? (

                  <img
                    src={captchaImage}
                    alt="Security CAPTCHA"
                    className="forgot-captcha-image"
                  />

                ) : (

                  <div className="forgot-captcha-placeholder">

                    {captchaLoading
                      ? "Loading CAPTCHA..."
                      : "CAPTCHA unavailable"}

                  </div>

                )}

              </div>

              <input
                id="captcha-answer"
                type="text"
                placeholder="Enter the characters shown above"
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

              {error && (
                <div className="forgot-message error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="forgot-message success" role="status">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="forgot-primary-button"
                disabled={
                  loading ||
                  captchaLoading ||
                  !captchaImage ||
                  !captchaId
                }
              >
                {loading ? "Verifying..." : "Verify Email"}

                {!loading && <ShieldCheck size={18} />}
              </button>

            </form>

            <button
              type="button"
              className="forgot-back-button"
              onClick={changeEmail}
              disabled={loading}
            >
              <ArrowLeft size={16} />
              Change email address
            </button>

          </section>

        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 3 && (

          <section className="forgot-card">

            <div className="forgot-main-icon success-icon">
              <KeyRound size={28} />
            </div>

            <span className="forgot-eyebrow">
              CREATE NEW PASSWORD
            </span>

            <h1>Reset Password</h1>

            <p className="forgot-description">
              Your email is verified. Create a new password
              for your ScholarConnect account.
            </p>

            <form onSubmit={handleResetPassword}>

              <label htmlFor="new-password">
                New Password
              </label>

              <div className="forgot-password-wrapper">

                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
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
                  onClick={() =>
                    setShowPassword(current => !current)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>

              </div>

              <label htmlFor="confirm-password">
                Confirm New Password
              </label>

              <div className="forgot-password-wrapper">

                <input
                  id="confirm-password"
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
                  onClick={() =>
                    setShowConfirmPassword(current => !current)
                  }
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>

              </div>

              <small className="forgot-password-hint">
                Use at least 8 characters.
              </small>

              {error && (
                <div className="forgot-message error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="forgot-message success" role="status">
                  <CheckCircle2 size={17} />
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="forgot-primary-button"
                disabled={loading || !resetToken}
              >
                {loading ? "Updating password..." : "Reset Password"}

                {!loading && <CheckCircle2 size={18} />}
              </button>

            </form>

          </section>

        )}

        {/* FOOTER */}
        <div className="forgot-footer">

          <Link to="/login">
            <ArrowLeft size={15} />
            Back to Login
          </Link>

          <span>
            <ShieldCheck size={15} />
            Secure Account Recovery
          </span>

        </div>

      </div>

    </main>
  );
}