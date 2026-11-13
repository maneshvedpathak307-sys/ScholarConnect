import React, {
  createContext,
  useContext,
  useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const saveAuth = data => {

    localStorage.setItem("token", data.token);

    const userData = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role
    };

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  // REGISTER
  const register = async formData => {

    const response = await api.post(
      "/auth/register",
      formData
    );

    saveAuth(response.data);

    return response.data;
  };

  // LOGIN
  const login = async credentials => {

    const response = await api.post(
      "/auth/login",
      credentials
    );

    saveAuth(response.data);

    return response.data;
  };

  // PASSWORD RECOVERY: SEND OTP
  const sendPasswordResetOtp = async email => {

    const response = await api.post(
      "/auth/forgot-password/send-otp",
      { email }
    );

    return response.data;
  };

  // PASSWORD RECOVERY: LOAD CAPTCHA
  const getPasswordResetCaptcha = async email => {

    const response = await api.get(
      "/auth/forgot-password/captcha",
      {
        params: { email }
      }
    );

    return response.data;
  };

  // PASSWORD RECOVERY: VERIFY OTP AND CAPTCHA
  const verifyPasswordResetOtp = async data => {

    const response = await api.post(
      "/auth/forgot-password/verify-otp",
      data
    );

    return response.data;
  };

  // PASSWORD RECOVERY: SAVE NEW PASSWORD
  const resetPassword = async data => {

    const response = await api.post(
      "/auth/forgot-password/reset-password",
      data
    );

    return response.data;
  };

  // LOGOUT
  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(
      user && localStorage.getItem("token")
    ),

    register,
    login,
    logout,

    sendPasswordResetOtp,
    getPasswordResetCaptcha,
    verifyPasswordResetOtp,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}