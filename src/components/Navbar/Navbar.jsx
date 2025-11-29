import React, { useEffect, useRef, useState } from "react";
import "./Navbar.scss";
import userimg from "../../assets/images/user.jpg";
import logo from "../../assets/images/memrise.png";
import { SVGICON } from "../../data/constant/theme";
import { Link, useNavigate } from "react-router-dom";
import api from "../../data/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // helper: ask backend to sign a GET for a given S3 key
  const signGetKey = async (key) => {
    if (!key) return null;
    try {
      const { data } = await api.get("/files/sign", { params: { key } });
      return data?.url || null;
    } catch {
      return null;
    }
  };

  // Load current user and resolve avatar
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/users/me");
        if (!mounted) return;
        setMe(data);

        // prefer direct URL; otherwise sign the key
        if (data?.avatarUrl) {
          setAvatarUrl(data.avatarUrl);
        } else if (data?.avatarKey) {
          const url = await signGetKey(data.avatarKey);
          if (mounted) setAvatarUrl(url);
        } else {
          setAvatarUrl(null);
        }
      } catch {
        setMe(null);
      } finally {
        if (mounted) setLoadingMe(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Close on outside click
  useEffect(() => {
    const onAway = (e) => {
      if (!isOpen) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onAway);
    return () => document.removeEventListener("mousedown", onAway);
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  const avatarSrc = avatarUrl || userimg;
  const displayName = me?.name || "Guest";
  const subtitle = me?.email || "Not signed in";

  // Destinations
  const profileLink = me ? `/profile/${me.publicId}` : "/login";
  const baseUser = me ? `/user/${me.id || me._id}` : "/login";

  const go = (to) => {
    setIsOpen(false);
    navigate(to);
  };

  const doLogout = async () => {
    // Try server logout if it exists, but don't care if it's 404
    try {
      await api.post("/auth/logout").catch((err) => {
        if (err?.response?.status !== 404) throw err;
      });
    } catch {
      // non-404 errors can be logged if you want
      // console.warn("Server logout failed:", e);
    } finally {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        delete api.defaults.headers.common.Authorization;
      } catch {
        // intentionally left blank
      }
      setIsOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="navbarmain">
      <div className="navbar-content">
        <nav className="nav">
          <div className="navcontent">
            <div className="nav-left">
              <div className="brandlogo">
                <Link to="/">
                  <img src={logo} alt="Memorise Trophies and Gifts" />
                </Link>
              </div>
            </div>

            <div className="nav-right">
              <ul className="navlist">
                {!me && !loadingMe ? (
                  <li className="navitem">
                    <Link
                      className="btn btn-outline-primary btn-sm"
                      to="/login"
                    >
                      Login
                    </Link>
                  </li>
                ) : (
                  <li className="navitem">
                    {/* Avatar button */}
                    <button
                      ref={btnRef}
                      type="button"
                      className="usermenu"
                      onClick={() => setIsOpen((s) => !s)}
                      aria-haspopup="true"
                      aria-expanded={isOpen ? "true" : "false"}
                      title="Account"
                    >
                      <div className="usermedia">
                        <img
                          src={avatarSrc}
                          alt="user avatar"
                          className="userimg"
                        />
                      </div>
                    </button>

                    {/* Dropdown */}
                    <div
                      ref={menuRef}
                      className={`usermediamenu ${isOpen ? "is-open" : ""}`}
                      role="menu"
                    >
                      <div className="card border-0 mb-0">
                        <div className="card-header py-2">
                          <div className="products">
                            <img
                              src={avatarSrc}
                              alt=""
                              className="avatar avatar-md"
                            />
                            <div>
                              <h6 className="mb-0">{displayName}</h6>
                              <span className="text-muted">{subtitle}</span>
                            </div>
                          </div>
                        </div>

                        <div className="card-body px-0 py-2">
                          <button
                            className="dropdown-item ai-icon"
                            onClick={() => go(profileLink)}
                          >
                            {SVGICON.UserSvg}{" "}
                            <span className="ms-2">Profile</span>
                          </button>

                          <button
                            className="dropdown-item ai-icon"
                            onClick={() => go(`${baseUser}?tab=Trophies`)}
                          >
                            {SVGICON.Project}{" "}
                            <span className="ms-2">My Trophies</span>
                          </button>

                          <button
                            className="dropdown-item ai-icon"
                            onClick={() => go(`${baseUser}?tab=Setting`)}
                          >
                            {SVGICON.Headersetting}{" "}
                            <span className="ms-2">Settings</span>
                          </button>
                        </div>

                        <div className="card-footer px-0 py-2">
                          <button
                            className="dropdown-item ai-icon ms-1 logout-btn"
                            onClick={doLogout}
                          >
                            {SVGICON.Logout}{" "}
                            <span className="ms-2">Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
