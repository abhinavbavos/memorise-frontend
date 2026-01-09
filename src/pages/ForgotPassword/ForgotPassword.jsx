import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../data/api";
import logo from "../../assets/images/memrise.png";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!email) {
            setError("Email is required");
            return;
        }

        try {
            setLoading(true);
            await api.post("/auth/forgot-password", { email });
            setMessage("If an account exists with this email, you will receive password reset instructions.");
            setEmail("");
        } catch (err) {
            // Should not reveal if email exists or not for security, but usually shows a generic success or specific error if truly needed
            // For now, let's show the error from backend if any, or generic fallback
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
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
                                            <div className="text-center mb-3">
                                                <Link to="/login">
                                                    <img src={logo} alt="logo" />
                                                </Link>
                                            </div>
                                            <h4 className="text-center mb-4">Forgot Password</h4>

                                            {message && <div className="alert alert-success">{message}</div>}
                                            {error && <div className="alert alert-danger">{error}</div>}

                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        <strong>Email</strong>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="hello@example.com"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-block"
                                                        disabled={loading}
                                                    >
                                                        {loading ? "Sending..." : "Reset Password"}
                                                    </button>
                                                </div>
                                            </form>
                                            <div className="new-account mt-3">
                                                <p>
                                                    Remember your password?{" "}
                                                    <Link to="/login" className="text-primary">
                                                        Sign in
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
};

export default ForgotPassword;
