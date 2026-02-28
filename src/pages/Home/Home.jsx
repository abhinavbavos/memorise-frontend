import React from "react";
import { Link } from "react-router-dom";
import trophyLogo from "../../assets/images/trophy.png";
import memoriseLogo from "../../assets/images/memrise.png";
import "./Home.css";

export default function Home() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    {/* Logo Section */}
                    <div className="logo-section mb-5">
                        <div className="logo-duo">
                            <div className="logo-item">
                                <img
                                    src={trophyLogo}
                                    alt="Trophy Logo"
                                    className="logo-img trophy-logo"
                                />
                            </div>
                            <div className="logo-separator">×</div>
                            <div className="logo-item">
                                <img
                                    src={memoriseLogo}
                                    alt="Memorise Logo"
                                    className="logo-img memorise-logo"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Heading */}
                    <h1 className="hero-title">Digital Trophy Hub</h1>

                    {/* Subheading */}
                    <p className="hero-subtitle">
                        Powered by <span className="text-brand">Memorise</span>
                    </p>

                    {/* Description */}
                    <div className="description-section">
                        <h2 className="section-heading">What is Trophy Hub?</h2>
                        <p className="description-text">
                            Trophy Hub is your personal digital achievement showcase. Display your accomplishments,
                            celebrate your victories, and share your success story with the world. Whether it's
                            academic awards, sports achievements, certifications, or personal milestones – your
                            trophies deserve recognition.
                        </p>
                    </div>

                    {/* About Memorise */}
                    <div className="description-section">
                        <h2 className="section-heading">About Memorise</h2>
                        <p className="description-text">
                            Memorise is a comprehensive platform dedicated to recognizing and celebrating human
                            achievement. Our mission is to create a vibrant community where accomplishments are
                            valued, recognized, and preserved for generations to come. Join thousands of users
                            who are already sharing their success stories.
                        </p>
                        <a
                            href="https://mrise.ca/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="visit-link"
                        >
                            Visit Memorise Website →
                        </a>
                    </div>

                    {/* Features */}
                    <div className="features-section">
                        <h2 className="section-heading">Why Trophy Hub?</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">🏆</div>
                                <h3>Showcase Achievements</h3>
                                <p>Display all your accomplishments in one beautiful profile</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🎯</div>
                                <h3>Organize by Category</h3>
                                <p>Categorize your trophies - Academic, Sports, Leadership, and more</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">📱</div>
                                <h3>Share Anywhere</h3>
                                <p>Share your public profile and celebrate your success with others</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🔒</div>
                                <h3>Private & Secure</h3>
                                <p>Control what you share - your privacy is our priority</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">📊</div>
                                <h3>Track Progress</h3>
                                <p>View detailed analytics and insights about your achievements over time</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">⭐</div>
                                <h3>Get Recognized</h3>
                                <p>Unlock special badges and recognition as you grow your trophy collection</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="cta-section">
                        <h2 className="section-heading">Get Started Today</h2>
                        <p className="cta-subtitle">Join Trophy Hub and start showcasing your achievements</p>
                        <div className="button-group">
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn btn-secondary btn-lg">
                                Create Account
                            </Link>
                        </div>
                    </div>

                    {/* Footer Text */}
                    <div className="footer-text">
                        <p>
                            Already have an account?{" "}
                            <Link to="/login" className="link-login">
                                Sign in here
                            </Link>
                        </p>
                        <p className="mt-3">
                            Don't have an account?{" "}
                            <Link to="/register" className="link-signup">
                                Join Trophy Hub now
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
