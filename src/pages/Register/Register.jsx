import React, { useState } from "react";
import logo from "../../assets/images/memrise.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../data/api";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // detect admin create route
  const isAdminCreate = location.pathname.startsWith("/admin/register");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = { name: "", email: "", password: "" };
    let ok = true;

    if (!name.trim()) {
      e.name = "Name is required";
      ok = false;
    }
    if (!email.trim()) {
      e.email = "Email is required";
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Enter a valid email";
      ok = false;
    }
    if (!password) {
      e.password = "Password is required";
      ok = false;
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters";
      ok = false;
    }

    setErrors(e);
    return ok;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    try {
      setLoading(true);

      const endpoint = isAdminCreate ? "/admin/register" : "/auth/register";
      // Keep payload minimal; backend decides role for admin route.
      const payload = { name: name.trim(), email: email.trim(), password };

      await api.post(endpoint, payload);

      if (isAdminCreate) {
        alert("Admin account created.");
        navigate("/admin/users", { replace: true });
      } else {
        alert("Account created. Please sign in.");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Registration failed";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100">
      <div className="authincation h-100">
        <div className="container h-100">
          <div className="row justify-content-center h-100 align-items-center">
            <div className="col-md-6">
              <div className="authincation-content">
                <div className="row no-gutters">
                  <div className="col-xl-12">
                    <div className="auth-form">
                      <div className="text-center flex self-center justify-center mb-3">
                        <Link to="#">
                          <img src={logo} alt="logo" />
                        </Link>
                      </div>
                      <h4 className="text-center mb-4">
                        {isAdminCreate
                          ? "Create Admin"
                          : "Sign up your account"}
                      </h4>

                      {serverError && (
                        <div className="bg-danger text-white p-2 mb-3 rounded">
                          {serverError}
                        </div>
                      )}

                      <form onSubmit={onSubmit} noValidate>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Username</strong>{" "}
                            <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                          />
                          {errors.name && (
                            <div className="text-danger fs-12">
                              {errors.name}
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Email</strong>{" "}
                            <span className="required">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="hello@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                          />
                          {errors.email && (
                            <div className="text-danger fs-12">
                              {errors.email}
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Password</strong>{" "}
                            <span className="required">*</span>
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={
                              isAdminCreate ? "new-password" : "new-password"
                            }
                          />
                          {errors.password && (
                            <div className="text-danger fs-12">
                              {errors.password}
                            </div>
                          )}
                        </div>

                        <div className="text-center mt-4">
                          <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                          >
                            {loading
                              ? "Creating…"
                              : isAdminCreate
                              ? "Create Admin"
                              : "Sign me up"}
                          </button>
                        </div>
                      </form>

                      {!isAdminCreate && (
                        <div className="new-account mt-3">
                          <p>
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary">
                              Sign in
                            </Link>
                          </p>
                        </div>
                      )}

                      {isAdminCreate && (
                        <div className="new-account mt-3">
                          <p className="text-muted small">
                            You’re creating a new admin. This route requires an
                            admin token and is protected by the{" "}
                            <code>RequireAdmin</code> guard.
                          </p>
                        </div>
                      )}
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
};

export default Register;
