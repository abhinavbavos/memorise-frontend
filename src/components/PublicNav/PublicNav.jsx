import { useState, useEffect } from "react"
import "./PublicNav.scss"
import trophyLogo from "../../assets/images/trophy.png"
import { Link } from "react-router-dom"

const MEMORISE_URL = "https://mrise.ca/"

const PublicNav = () => {
  const [mobileMenu, setMobileMenu] = useState(false)
  const close = () => setMobileMenu(false)

  // Close the mobile drawer on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobileMenu(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <header className="pubnav">
      <div className="pubnav-inner">
        {/* Brand */}
        <Link to="/" className="pubnav-brand" onClick={close}>
          <img src={trophyLogo} alt="Trophy Hub" />
          <span className="pubnav-wordmark">Trophy Hub</span>
        </Link>

        {/* Center title */}
        <span className="pubnav-title">Memorise Digital Trophy Hub</span>

        {/* Desktop actions */}
        <nav className="pubnav-actions" aria-label="Primary">
          <a
            href={MEMORISE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pubnav-link"
          >
            Visit Memorise
          </a>
          <Link to="/login" className="pubnav-btn pubnav-btn-ghost">
            Login
          </Link>
          <Link to="/register" className="pubnav-btn pubnav-btn-solid">
            Sign Up
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className={`pubnav-burger ${mobileMenu ? "is-open" : ""}`}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenu}
          onClick={() => setMobileMenu((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`pubnav-mobile ${mobileMenu ? "is-open" : ""}`}>
        <Link to="/" className="pubnav-mobile-link" onClick={close}>
          Home
        </Link>
        <a
          href={MEMORISE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="pubnav-mobile-link"
          onClick={close}
        >
          Visit Memorise
        </a>
        <div className="pubnav-mobile-actions">
          <Link to="/login" className="pubnav-btn pubnav-btn-ghost" onClick={close}>
            Login
          </Link>
          <Link to="/register" className="pubnav-btn pubnav-btn-solid" onClick={close}>
            Sign Up
          </Link>
        </div>
      </div>

      {/* Backdrop */}
      {mobileMenu && <div className="pubnav-backdrop" onClick={close} />}
    </header>
  )
}

export default PublicNav
