import { useState } from "react"
import "./PublicNav.scss"
import logo from "../../assets/images/memrise.png"
import { SVGICON } from "../../data/constant/theme"
import { Link } from "react-router-dom"

const PublicNav = () => {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [exploreMenu, setExploreMenu] = useState(false)

  return (
    <div className="navbarmain">
      <div className="navbar-content">
        <nav className="nav">
          <div className="navcontent">
            <div className="nav-left">
              <div className="brandlogo">
                <img src={logo || "/placeholder.svg"} alt="Memorise | Memorise Trophies and Gifts" />
              </div>
            </div>
            <div className="nav-right">
              <ul className="navlist">
                {/* Desktop Navigation Links */}
                {/* <li className="navitem desktop-nav">
                  <Link to="/" className="nav-link">
                    Home
                  </Link>
                </li>
                <li className="navitem desktop-nav" onClick={() => setExploreMenu(!exploreMenu)}>
                  <div className="nav-link-dropdown">
                    <span className="nav-link">
                      Explore
                      <i className={`fa fa-chevron-down ms-1 ${exploreMenu ? "rotate" : ""}`}></i>
                    </span>
                    <div className={`dropdown-menu-custom ${exploreMenu ? "show" : ""}`}>
                      <div className="card border-0 mb-0">
                        <div className="card-body px-0 py-2">
                          <Link to="/browse-profiles" className="dropdown-item ai-icon">
                            {SVGICON.UserSvg}
                            <span className="ms-2">Browse Profiles</span>
                          </Link>
                          <Link to="/browse-trophies" className="dropdown-item ai-icon">
                            {SVGICON.Project}
                            <span className="ms-2">Browse Trophies</span>
                          </Link>
                          <Link to="/leaderboard" className="dropdown-item ai-icon">
                            <i className="fa fa-trophy"></i>
                            <span className="ms-2">Leaderboard</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="navitem desktop-nav">
                  <Link to="/about" className="nav-link">
                    About
                  </Link>
                </li>
                <li className="navitem desktop-nav">
                  <Link to="/contact" className="nav-link">
                    Contact
                  </Link>
                </li> */}

                {/* Authentication Buttons */}
                <li className="navitem auth-buttons">
                  <Link to="/login" className="btn btn-outline-primary me-2 d-flex align-items-center justify-center">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary d-flex align-items-center justify-center">
                    Sign Up
                  </Link>
                </li>

                {/* Mobile Menu Toggle */}
                <li className="navitem mobile-menu-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
                  <div className="mobile-menu-btn">
                    <i className={`fa ${mobileMenu ? "fa-times" : "fa-bars"}`}></i>
                  </div>
                  {/* Mobile Menu Dropdown */}
                  <div className={`mobile-menu-dropdown ${mobileMenu ? "show" : ""}`}>
                    <div className="card border-0 mb-0">
                      <div className="card-header py-2">
                        <div className="text-center">
                          <h6 className="mb-0">Navigation</h6>
                        </div>
                      </div>
                      <div className="card-body px-0 py-2">
                        <Link to="/" className="dropdown-item ai-icon">
                          <i className="fa fa-home"></i>
                          <span className="ms-2">Home</span>
                        </Link>
                        <Link to="/browse-profiles" className="dropdown-item ai-icon">
                          {SVGICON.UserSvg}
                          <span className="ms-2">Browse Profiles</span>
                        </Link>
                        <Link to="/browse-trophies" className="dropdown-item ai-icon">
                          {SVGICON.Project}
                          <span className="ms-2">Browse Trophies</span>
                        </Link>
                        <Link to="/leaderboard" className="dropdown-item ai-icon">
                          <i className="fa fa-trophy"></i>
                          <span className="ms-2">Leaderboard</span>
                        </Link>
                        <Link to="/about" className="dropdown-item ai-icon">
                          <i className="fa fa-info-circle"></i>
                          <span className="ms-2">About</span>
                        </Link>
                        <Link to="/contact" className="dropdown-item ai-icon">
                          <i className="fa fa-envelope"></i>
                          <span className="ms-2">Contact</span>
                        </Link>
                      </div>
                      <div className="card-footer px-0 py-2">
                        <Link to="/login" className="dropdown-item ai-icon">
                          <i className="fa fa-sign-in-alt"></i>
                          <span className="ms-2">Login</span>
                        </Link>
                        <Link to="/register" className="dropdown-item ai-icon">
                          <i className="fa fa-user-plus"></i>
                          <span className="ms-2">Sign Up</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default PublicNav;
