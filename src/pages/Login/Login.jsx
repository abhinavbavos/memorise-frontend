// src/pages/Login/Login.jsx
import React, { useState } from "react";
import trophyLogo from "../../assets/images/trophy.png";
import memoriseLogo from "../../assets/images/memrise.png";
import { Link, useNavigate } from "react-router-dom";
import api from "../../data/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("123456");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const readJwtClaims = (token) => {
    try {
      const base64 = token.split(".")[1];
      const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({ email: "", password: "" });

    let hasError = false;
    if (!email) {
      setErrors((p) => ({ ...p, email: "Email is required" }));
      hasError = true;
    }
    if (!password) {
      setErrors((p) => ({ ...p, password: "Password is required" }));
      hasError = true;
    }
    if (hasError) return;

    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, password });

      const accessToken = data.access || data.token;
      const refreshToken = data.refresh || data.refreshToken;
      if (!accessToken || !refreshToken)
        throw new Error("Invalid login response: tokens missing");

      // persist tokens + set header for immediate follow-up calls
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // derive role from token
      const claims = readJwtClaims(accessToken);
      const tokenRole = (claims?.role || "").toLowerCase();

      // get user object (prefer server /users/me to enrich with role/flags)
      let user = data.user;
      try {
        const me = await api.get("/users/me");
        user = { ...user, ...me.data };
      } catch {
        // fall back to response user if /users/me not available
      }

      // normalize role/isAdmin
      const role = (user?.role || user?.Role || tokenRole || "").toLowerCase();
      const rolesArr = Array.isArray(user?.roles)
        ? user.roles.map((r) => r.toLowerCase())
        : [];
      const isAdmin =
        role === "admin" ||
        user?.isAdmin === true ||
        rolesArr.includes("admin");

      const normalizedUser = { ...user, role, isAdmin };
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      const uid = normalizedUser._id || normalizedUser.id;

      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else if (uid) {
        navigate(`/user/${uid}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wraper">
      <div className="authincation">
        <div className="container">
          <div className="row justify-content-center h-100 align-items-center">
            <div className="col-md-12 h-100 d-flex align-items-center">
              <div className="authincation-content style-1">
                <div className="row h-100">
                  <div className="col-md-6 h-100">
                    <div className="img-bx d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "400px" }}>
                      <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                        <Link to="/" className="d-flex align-items-center">
                          <img
                            src={trophyLogo}
                            alt="Trophy Logo"
                            className="img-fluid"
                            style={{ height: "130px", width: "auto" }}
                          />
                        </Link>
                        <span style={{ color: "#bbb", fontSize: "32px", margin: "0 8px" }}>|</span>
                        <a
                          href="https://mrise.ca/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="d-flex align-items-center"
                        >
                          <img
                            src={memoriseLogo}
                            alt="Memorise Logo"
                            className="img-fluid"
                            style={{ height: "130px", width: "auto" }}
                          />
                        </a>
                      </div>
                      <p className="text-center text-muted" style={{ fontSize: "14px" }}>Digital Trophy Hub</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="auth-form">
                      <h4 className="main-title" style={{ fontFamily: `poppins, sans-serif, sans-serif` }}>Sign in</h4>

                      {serverError && (
                        <div className="bg-danger text-white p-2 mb-3 rounded">
                          {serverError}
                        </div>
                      )}

                      <form onSubmit={handleLogin}>
                        <div className="form-group mb-3 pb-3">
                          <label className="font-w600">
                            Email <span className="required">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control solid"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          {errors.email && (
                            <div className="text-danger fs-12">
                              {errors.email}
                            </div>
                          )}
                        </div>

                        <div className="form-group mb-3 pb-3">
                          <label className="font-w600">
                            Password <span className="required">*</span>
                          </label>
                          <div className="position-relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              className="form-control solid"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <span
                              className={`fa fa-fw ${showPassword ? "fa-eye-slash" : "fa-eye"} field-icon`}
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                color: "#ccc",
                              }}
                              onClick={() => setShowPassword(!showPassword)}
                            />
                          </div>
                          {errors.password && (
                            <div className="text-danger fs-12">
                              {errors.password}
                            </div>
                          )}
                          <div className="d-flex justify-content-end mt-1">
                            <Link
                              to="/forgot-password"
                              className="text-primary small"
                            >
                              Forgot Password?
                            </Link>
                          </div>
                        </div>

                        <div className="text-center">
                          <button
                            type="submit"
                            className="btn btn-primary btn-block rounded"
                            disabled={loading}
                          >
                            {loading ? "Signing In..." : "Sign Me In"}
                          </button>
                        </div>
                      </form>

                      <div className="new-account mt-3">
                        <p>
                          Don't have an account?{" "}
                          <Link to="/register" className="text-primary">
                            Sign up
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
